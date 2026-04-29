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
// DARAJA M-PESA CONFIGURATION (BULLET-PROOF)
// ============================================================

const DARAJA_ENV = (process.env.DARAJA_ENV || "sandbox").trim();
const DARAJA_BASE_URL = DARAJA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const DARAJA = {
  get consumerKey()    { return (process.env.DARAJA_CONSUMER_KEY || "").trim(); },
  get consumerSecret() { return (process.env.DARAJA_CONSUMER_SECRET || "").trim(); },
  get shortcode()      { return (process.env.DARAJA_BUSINESS_SHORTCODE || "174379").trim(); },
  get passkey()        { return (process.env.DARAJA_PASSKEY || "").trim(); },
  get callbackUrl()    { return (process.env.DARAJA_CALLBACK_URL || "").trim(); },
};

// Custom HTTPS agent — sandbox has occasional TLS issues on some networks
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Normalize any Kenyan phone number to 254XXXXXXXXX format.
 * Handles: +254..., 254..., 07..., 7..., 01...
 */
function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, ""); // strip everything non-digit

  if (digits.startsWith("0")) {
    digits = "254" + digits.slice(1);       // 07xx → 2547xx
  } else if (digits.length === 9) {
    digits = "254" + digits;                // 7xx → 2547xx
  } else if (digits.startsWith("254") && digits.length === 12) {
    // already correct
  } else if (digits.startsWith("+254")) {
    digits = digits.replace("+", "");
  }

  if (!/^254\d{9}$/.test(digits)) {
    throw new Error(`Invalid phone number after normalization: "${raw}" → "${digits}". Expected 254XXXXXXXXX (12 digits).`);
  }

  return digits;
}

/**
 * Generate the Daraja timestamp in the exact format YYYYMMDDHHmmss
 * using East Africa Time (UTC+3).
 */
function getDarajaTimestamp(): string {
  const now = new Date();
  // Convert to EAT (UTC+3)
  const eat = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  const y = eat.getUTCFullYear();
  const m = String(eat.getUTCMonth() + 1).padStart(2, "0");
  const d = String(eat.getUTCDate()).padStart(2, "0");
  const h = String(eat.getUTCHours()).padStart(2, "0");
  const mi = String(eat.getUTCMinutes()).padStart(2, "0");
  const s = String(eat.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}${h}${mi}${s}`;
}

/**
 * Generate the Daraja password: Base64(Shortcode + Passkey + Timestamp)
 */
function getDarajaPassword(timestamp: string): string {
  return Buffer.from(`${DARAJA.shortcode}${DARAJA.passkey}${timestamp}`).toString("base64");
}

/**
 * Obtain an OAuth access token from Safaricom with retry logic.
 * Retries up to 3 times with a 2-second delay between attempts.
 */
async function getOAuthToken(retries = 3): Promise<string> {
  const url = `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
  const auth = Buffer.from(`${DARAJA.consumerKey}:${DARAJA.consumerSecret}`).toString("base64");

  logToFile(`[OAUTH] Requesting token from ${url}`);
  logToFile(`[OAUTH] Consumer Key: ${DARAJA.consumerKey.slice(0, 8)}...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Cache-Control": "no-cache",
        },
        httpsAgent,
        timeout: 15000,
      });

      const token = response.data.access_token;
      if (!token) {
        throw new Error(`No access_token in response: ${JSON.stringify(response.data)}`);
      }

      logToFile(`[OAUTH] ✅ Token obtained (attempt ${attempt}): ${token.slice(0, 15)}...`);
      return token;
    } catch (err: any) {
      const status = err.response?.status;
      const body = err.response?.data;
      logToFile(`[OAUTH] ❌ Attempt ${attempt}/${retries} FAILED — HTTP ${status || "NETWORK_ERROR"}: ${JSON.stringify(body) || err.message}`);

      if (attempt === retries) {
        throw new Error(
          `OAuth token generation failed after ${retries} attempts. ` +
          `HTTP ${status || "N/A"}: ${JSON.stringify(body) || err.message}. ` +
          `This usually means your Consumer Key/Secret are invalid or expired. ` +
          `Go to https://developer.safaricom.co.ke → My Apps → create a new app → copy fresh keys.`
        );
      }

      // Wait 2 seconds before retry
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  throw new Error("Unreachable");
}

// ============================================================
// API ENDPOINTS
// ============================================================

// 1. Health & Readiness Check
app.get("/api/health", async (req, res) => {
  let safaricomStatus = "unknown";
  try {
    await axios.head(DARAJA_BASE_URL, { httpsAgent, timeout: 5000 });
    safaricomStatus = "reachable";
  } catch (e: any) {
    safaricomStatus = `blocked: ${e.message}`;
  }

  res.json({
    status: "online",
    env: DARAJA_ENV,
    daraja_url: DARAJA_BASE_URL,
    safaricom: safaricomStatus,
    firebase: db ? "connected" : "not connected",
    shortcode: DARAJA.shortcode,
    has_consumer_key: !!DARAJA.consumerKey,
    has_passkey: !!DARAJA.passkey,
    timestamp: new Date().toISOString()
  });
});

// 2. Standalone Token Test (debug endpoint)
app.get("/api/test-token", async (req, res) => {
  try {
    const token = await getOAuthToken();
    res.json({ success: true, token_preview: token.slice(0, 20) + "...", message: "OAuth is working!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. STK Push Initiation (Daraja Lipa na M-Pesa Online)
app.post("/api/pay", async (req, res) => {
  const { phoneNumber, amount, userId, tierId } = req.body;

  // A. Input validation
  if (!phoneNumber || !amount || !userId) {
    return res.status(400).json({ error: "Missing required fields: phoneNumber, amount, userId" });
  }

  logToFile(`\n========== NEW STK PUSH REQUEST ==========`);
  logToFile(`User: ${userId} | Phone: ${phoneNumber} | Amount: ${amount} KES | Tier: ${tierId}`);

  try {
    // B. Normalize the phone number to 254XXXXXXXXX
    const phone = normalizePhone(phoneNumber);
    logToFile(`[STK] Phone normalized: ${phoneNumber} → ${phone}`);

    // C. Get OAuth token
    const token = await getOAuthToken();

    // D. Build timestamp & password
    const timestamp = getDarajaTimestamp();
    const password = getDarajaPassword(timestamp);
    logToFile(`[STK] Timestamp: ${timestamp}`);
    logToFile(`[STK] Shortcode: ${DARAJA.shortcode}`);
    logToFile(`[STK] Callback URL: ${DARAJA.callbackUrl}`);

    // E. Build the STK Push payload
    const stkPayload = {
      BusinessShortCode: DARAJA.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(Number(amount)),
      PartyA: phone,
      PartyB: DARAJA.shortcode,
      PhoneNumber: phone,
      CallBackURL: DARAJA.callbackUrl || `http://localhost:${PORT}/api/callback`,
      AccountReference: `Kavyati-${tierId || "sub"}`,
      TransactionDesc: `Team Kavyati ${tierId || "subscription"} payment`,
    };

    logToFile(`[STK] Payload: ${JSON.stringify(stkPayload, null, 2)}`);

    // F. Send STK Push request
    const stkUrl = `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`;
    logToFile(`[STK] Posting to: ${stkUrl}`);

    const stkResponse = await axios.post(stkUrl, stkPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      httpsAgent,
      timeout: 30000,
    });

    logToFile(`[STK] ✅ Safaricom Response: ${JSON.stringify(stkResponse.data)}`);

    // G. Check for success
    const { ResponseCode, MerchantRequestID, CheckoutRequestID, ResponseDescription } = stkResponse.data;

    if (ResponseCode === "0") {
      logToFile(`[STK] ✅ STK Push sent! MerchantRequestID: ${MerchantRequestID}, CheckoutRequestID: ${CheckoutRequestID}`);

      // Store pending transaction in Firestore
      if (db) {
        try {
          await db.collection("transactions").doc(CheckoutRequestID).set({
            userId,
            tierId,
            amount: Math.round(Number(amount)),
            phone,
            status: "pending",
            merchantRequestId: MerchantRequestID,
            checkoutRequestId: CheckoutRequestID,
            timestamp: new Date(),
          });
          logToFile(`[STK] Transaction saved to Firestore: ${CheckoutRequestID}`);
        } catch (dbErr: any) {
          logToFile(`[STK] ⚠️ Firestore save failed (non-blocking): ${dbErr.message}`);
        }
      }

      return res.json({
        success: true,
        message: ResponseDescription,
        checkoutRequestId: CheckoutRequestID,
        merchantRequestId: MerchantRequestID,
      });
    } else {
      throw new Error(`Safaricom rejected the request: ${ResponseDescription} (Code: ${ResponseCode})`);
    }
  } catch (error: any) {
    const status = error.response?.status;
    const body = error.response?.data;
    const msg = body?.errorMessage || body?.ResponseDescription || error.message;

    logToFile(`[STK] ❌ PAYMENT ERROR — HTTP ${status || "N/A"}: ${msg}`);
    logToFile(`[STK] Full error body: ${JSON.stringify(body)}`);

    res.status(status || 500).json({
      success: false,
      error: msg,
      hint: status === 400
        ? "Check your Consumer Key/Secret in .env. They may be expired. Create a new Daraja app at https://developer.safaricom.co.ke"
        : status === 500
        ? "Safaricom internal error. Wait 30 seconds and try again."
        : "Unexpected error. Check server.log for details.",
    });
  }
});

// 4. Daraja Callback (Webhook)
app.post("/api/callback", async (req, res) => {
  logToFile(`\n========== DARAJA CALLBACK RECEIVED ==========`);
  logToFile(`Body: ${JSON.stringify(req.body, null, 2)}`);

  // Safaricom sends: { Body: { stkCallback: { ... } } }
  const callback = req.body?.Body?.stkCallback;
  if (!callback) {
    logToFile(`[CALLBACK] ⚠️ Unexpected payload structure. Ignoring.`);
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;
  logToFile(`[CALLBACK] CheckoutRequestID: ${CheckoutRequestID}, ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);

  if (!db) {
    logToFile("[CALLBACK] ⚠️ No database connection. Logging only.");
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  try {
    const transRef = db.collection("transactions").doc(CheckoutRequestID);
    const transDoc = await transRef.get();

    if (!transDoc.exists) {
      logToFile(`[CALLBACK] ⚠️ Transaction ${CheckoutRequestID} not found in database.`);
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const { userId, tierId } = transDoc.data()!;

    if (ResultCode === 0) {
      // PAYMENT SUCCESSFUL — extract metadata
      const metadata: Record<string, any> = {};
      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          metadata[item.Name] = item.Value;
        }
      }

      logToFile(`[CALLBACK] ✅ PAYMENT SUCCESS for ${userId}! M-Pesa Receipt: ${metadata.MpesaReceiptNumber}`);

      await transRef.update({
        status: "completed",
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        mpesaCode: metadata.MpesaReceiptNumber || "",
        amountPaid: metadata.Amount || 0,
        phoneUsed: metadata.PhoneNumber || "",
        completedAt: new Date(),
      });

      // Upgrade user subscription
      await db.collection("users").doc(userId).update({
        subscriptionTier: tierId,
        subscriptionStatus: "active",
        subscriptionDate: new Date(),
      });

      logToFile(`[CALLBACK] ✅ User ${userId} upgraded to "${tierId}"`);
    } else {
      // PAYMENT FAILED
      logToFile(`[CALLBACK] ❌ Payment FAILED for ${userId}: ${ResultDesc}`);
      await transRef.update({
        status: "failed",
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        failedAt: new Date(),
      });
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err: any) {
    logToFile(`[CALLBACK] ❌ Processing error: ${err.message}`);
    res.status(500).json({ ResultCode: 1, ResultDesc: "Internal error" });
  }
});

// ============================================================
// VITE DEV SERVER
// ============================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // "custom" = Vite handles assets only, NOT the SPA fallback
    });
    app.use(vite.middlewares);

    // Serve index.html only for non-API routes (SPA client-side routing)
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
    console.log(`📡 Daraja ENV: ${DARAJA_ENV} → ${DARAJA_BASE_URL}`);
    console.log(`🔑 Consumer Key: ${DARAJA.consumerKey ? DARAJA.consumerKey.slice(0, 10) + "..." : "❌ MISSING"}`);
    console.log(`🏪 Shortcode: ${DARAJA.shortcode}`);
    console.log(`\n💡 Test endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/health     — check connectivity`);
    console.log(`   GET  http://localhost:${PORT}/api/test-token  — test OAuth`);
    console.log(`   POST http://localhost:${PORT}/api/pay         — initiate STK push\n`);
  });
}

startServer();
