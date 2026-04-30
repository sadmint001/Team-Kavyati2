import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import https from "https";
dotenv.config();
let db: any;

// Lazy-load Firebase Admin to prevent startup crashes if not installed
const initFirebaseAdmin = async () => {
  try {
    const admin = await import("firebase-admin");
    const { initializeApp: initApp } = await import("firebase-admin/app");
    const { getFirestore: getFS } = await import("firebase-admin/firestore");

    if (!admin.apps.length) {
      const fs = await import("fs");
      const path = await import("path");
      const serviceAccountPath = path.join(process.cwd(), "service-account.json");
      
      let config: any = {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "team-kavyati-official"
      };

      if (fs.existsSync(serviceAccountPath)) {
        config.credential = admin.credential.cert(serviceAccountPath);
        console.log("🔑 Using service-account.json for authentication");
      } else {
        console.warn("⚠️ No service-account.json found. Backend updates might fail locally.");
      }

      const adminApp = initApp(config);
      db = getFS(adminApp);
      console.log("✅ Firebase Admin initialized");
    }
  } catch (e) {
    console.warn("⚠️ Firebase Admin not found. Webhooks will not update Firestore automatically.");
    logToFile("CRITICAL: firebase-admin missing. Auto-provisioning disabled.");
  }
};

initFirebaseAdmin();

const app = express();
const PORT = 3000;

app.use(express.json());

// Logger for audits
const logToFile = (message: string) => {
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(path.join(process.cwd(), "server.log"), logMessage);
  console.log(message);
};

// ============================================================
// PAY HERO M-PESA CONFIGURATION
// ============================================================

const PAYHERO = {
  get username() { return (process.env.PAYHERO_API_USERNAME || "").trim(); },
  get password() { return (process.env.PAYHERO_API_PASSWORD || "").trim(); },
  get accountId() { return (process.env.PAYHERO_ACCOUNT_ID || "8237").trim(); },
  get callbackUrl() { return (process.env.CALLBACK_URL || "").trim(); }
};

const PAYHERO_URL = "https://backend.payhero.co.ke/api/v2/payments";

// Custom HTTPS agent 
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, ""); // strip everything non-digit

  if (digits.startsWith("254")) {
    digits = "0" + digits.slice(3);
  } else if (digits.length === 9) {
    digits = "0" + digits;
  }

  if (!/^(07|01)\d{8}$/.test(digits)) {
    // If not 07... or 01... maybe it's already correct or 254...
    if (/^254\d{9}$/.test(digits)) {
       return "0" + digits.slice(3);
    }
  }

  return digits;
}

// ============================================================
// API ENDPOINTS
// ============================================================

app.get("/api/health", async (req, res) => {
  res.json({
    status: "online",
    gateway: "PayHero",
    firebase: db ? "connected" : "not connected",
    account: PAYHERO.accountId,
    has_credentials: !!PAYHERO.username && !!PAYHERO.password,
    timestamp: new Date().toISOString()
  });
});

app.post("/api/pay", async (req, res) => {
  const { phoneNumber, amount, userId, tierId } = req.body;

  if (!phoneNumber || !amount || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  logToFile(`\n========== NEW PAY HERO PAYMENT REQUEST ==========`);
  logToFile(`User: ${userId} | Phone: ${phoneNumber} | Amount: ${amount} KES`);

  try {
    const phone = normalizePhone(phoneNumber);
    const amountVal = Math.round(Number(amount));
    const auth = Buffer.from(`${PAYHERO.username}:${PAYHERO.password}`).toString("base64");
    
    // Create transaction record
    const checkoutRequestId = `Kavyati_${Date.now()}`;

    if (db) {
      try {
        await db.collection("transactions").doc(checkoutRequestId).set({
          userId,
          tierId,
          amount: amountVal,
          phone,
          status: "pending",
          merchantRequestId: checkoutRequestId,
          checkoutRequestId: checkoutRequestId,
          timestamp: new Date(),
        });
      } catch(e: any) {
        logToFile(`[DB Error]: ${e.message}`);
      }
    }

    const payload = {
      amount: amountVal,
      phone_number: phone,
      customer_name: req.body.customerName || "Kavyati Member",
      external_reference: checkoutRequestId,
      provider: "m-pesa"
    };

    const response = await axios.post(
      "https://backend.payhero.co.ke/api/account/8237/payments",
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://lipwa.link/',
          'Origin': 'https://lipwa.link'
        }
      }
    );

    logToFile(`[PAYHERO] ✅ Response: ${JSON.stringify(response.data)}`);

    if (response.data.success) {
      return res.json({
        success: true,
        message: "Payment initiated successfully",
        checkoutRequestId
      });
    } else {
      throw new Error(response.data.message || "Failed to initiate payment");
    }

  } catch (error: any) {
    const msg = error.response?.data?.message || error.message;
    logToFile(`[PAYHERO] ❌ PAYMENT ERROR: ${msg}`);
    res.status(500).json({ success: false, error: msg });
  }
});

app.post("/api/callback", async (req, res) => {
  logToFile(`\n========== PAY HERO CALLBACK RECEIVED ==========`);
  logToFile(`Body: ${JSON.stringify(req.body, null, 2)}`);

  try {
    const { status, external_reference, checkout_request_id, amount, phone, message } = req.body;

    if (!db) {
       return res.json({ success: true });
    }

    // Look up transaction by external_reference
    const transRef = db.collection("transactions").doc(external_reference);
    const transDoc = await transRef.get();

    if (!transDoc.exists) {
      logToFile(`[CALLBACK] ⚠️ Transaction ${external_reference} not found.`);
      return res.json({ success: true });
    }

    const { userId, tierId } = transDoc.data()!;

    if (status?.toLowerCase() === "success" || status?.toLowerCase() === "completed") {
      logToFile(`[CALLBACK] ✅ PAYMENT SUCCESS for ${userId}`);

      await transRef.update({
        status: "completed",
        resultCode: 0,
        resultDesc: message || "Success",
        mpesaCode: checkout_request_id || "",
        amountPaid: amount,
        completedAt: new Date(),
      });

      await db.collection("users").doc(userId).update({
        subscriptionTier: tierId,
        subscriptionStatus: "active",
        subscriptionDate: new Date(),
      });
    } else {
      logToFile(`[CALLBACK] ❌ Payment FAILED for ${userId}`);
      await transRef.update({
        status: "failed",
        resultCode: 1,
        resultDesc: message || "Failed",
        failedAt: new Date(),
      });
    }
  } catch (err: any) {
    logToFile(`[CALLBACK] ❌ Error: ${err.message}`);
  }

  res.json({ success: true });
});

// ============================================================
// VITE DEV SERVER
// ============================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", 
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) return next();
      try {
        const { transformIndexHtml } = vite;
        const indexPath = path.join(process.cwd(), "index.html");
        let html = fs.readFileSync(indexPath, "utf-8");
        html = await transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Gateway: Pay Hero`);
    console.log(`🔑 Username: ${PAYHERO.username ? PAYHERO.username : "❌ MISSING"}`);
    console.log(`\n💡 Test endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   POST http://localhost:${PORT}/api/pay\n`);
  });
}

startServer();
