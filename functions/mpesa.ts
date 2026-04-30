import express, { Router } from "express";
import serverless from "serverless-http";
import axios from "axios";
import https from "https";
import * as admin from "firebase-admin";

const app = express();
const router = Router();
app.use(express.json());

let db: any;

// Initialize Firebase Admin (Serverless Version)
const initFirebase = () => {
  if (admin.apps.length) {
    db = admin.firestore();
    return;
  }

  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(
        serviceAccountVar.startsWith("{") 
          ? serviceAccountVar 
          : Buffer.from(serviceAccountVar, "base64").toString()
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ Firebase initialized via Environment Variable");
    } else {
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "team-kavyati-official"
      });
      console.warn("⚠️ Firebase initialized with Project ID only. Writes might fail without Service Account.");
    }
    db = admin.firestore();
  } catch (e) {
    console.error("❌ Firebase Init Error:", e);
  }
};

initFirebase();

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
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) digits = "0" + digits.slice(3);
  else if (digits.length === 9) digits = "0" + digits;
  return digits;
}

// ============================================================
// ROUTES
// ============================================================

router.get("/health", async (req, res) => {
  res.json({
    status: "online",
    environment: "netlify",
    gateway: "PayHero",
    firebase: db ? "connected" : "not connected",
    timestamp: new Date().toISOString(),
  });
});

router.post("/pay", async (req, res) => {
  const { phoneNumber, amount, userId, tierId } = req.body;

  if (!phoneNumber || !amount || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const phone = normalizePhone(phoneNumber);
    const amountVal = Math.round(Number(amount));
    const auth = Buffer.from(`${PAYHERO.username}:${PAYHERO.password}`).toString("base64");
    
    const checkoutRequestId = `Kavyati_${Date.now()}`;

    if (db) {
      await db.collection("transactions").doc(checkoutRequestId).set({
        userId, tierId, amount: amountVal, phone,
        status: "pending", merchantRequestId: checkoutRequestId,
        checkoutRequestId: checkoutRequestId, timestamp: new Date(),
      });
    }

    const payload = {
      amount: amountVal,
      phone_number: phone,
      customer_name: req.body.customerName || "Kavyati Member",
      external_reference: checkoutRequestId,
      provider: "m-pesa"
    };

    const response = await axios.post("https://backend.payhero.co.ke/api/account/8237/payments", payload, {
      headers: { 
        'Content-Type': 'application/json',
        'Referer': 'https://lipwa.link/',
        'Origin': 'https://lipwa.link'
      },
      httpsAgent, timeout: 30000,
    });

    if (response.data.success) {
      return res.json({
        success: true, message: "Payment initiated successfully",
        checkoutRequestId, merchantRequestId: checkoutRequestId,
      });
    } else {
      throw new Error(response.data.message || "Failed to initiate payment");
    }
  } catch (error: any) {
    const body = error.response?.data;
    res.status(error.response?.status || 500).json({
      success: false,
      error: body?.message || error.message,
    });
  }
});

router.post("/callback", async (req, res) => {
  const callback = req.body;
  if (!callback) return res.json({ success: true });

  const { status, external_reference, checkout_request_id, amount, phone, message } = callback;

  if (!db) return res.json({ success: true });

  try {
    const transRef = db.collection("transactions").doc(external_reference);
    const transDoc = await transRef.get();
    if (!transDoc.exists) return res.json({ success: true });

    const { userId, tierId } = transDoc.data()!;

    if (status?.toLowerCase() === "success" || status?.toLowerCase() === "completed") {
      await transRef.update({
        status: "completed", resultCode: 0, resultDesc: message || "Success",
        mpesaCode: checkout_request_id || "", amountPaid: amount,
        completedAt: new Date(),
      });
      await db.collection("users").doc(userId).update({
        subscriptionTier: tierId, subscriptionStatus: "active", subscriptionDate: new Date(),
      });
    } else {
      await transRef.update({ status: "failed", resultCode: 1, resultDesc: message || "Failed", failedAt: new Date() });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// Handle multiple possible base paths (Netlify rewrites vs direct access)
app.use(["/.netlify/functions/mpesa", "/api", "/"], router);

export const handler = serverless(app);
