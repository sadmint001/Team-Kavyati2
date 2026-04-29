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
// DARAJA M-PESA CONFIGURATION
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

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "254" + digits.slice(1);
  else if (digits.length === 9) digits = "254" + digits;
  if (!/^254\d{9}$/.test(digits)) {
    throw new Error(`Invalid phone number: "${raw}" → "${digits}"`);
  }
  return digits;
}

function getDarajaTimestamp(): string {
  const now = new Date();
  const eat = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  const y = eat.getUTCFullYear();
  const m = String(eat.getUTCMonth() + 1).padStart(2, "0");
  const d = String(eat.getUTCDate()).padStart(2, "0");
  const h = String(eat.getUTCHours()).padStart(2, "0");
  const mi = String(eat.getUTCMinutes()).padStart(2, "0");
  const s = String(eat.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}${h}${mi}${s}`;
}

function getDarajaPassword(timestamp: string): string {
  return Buffer.from(`${DARAJA.shortcode}${DARAJA.passkey}${timestamp}`).toString("base64");
}

async function getOAuthToken(retries = 3): Promise<string> {
  const url = `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
  const auth = Buffer.from(`${DARAJA.consumerKey}:${DARAJA.consumerSecret}`).toString("base64");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        httpsAgent,
        timeout: 15000,
      });
      const token = response.data.access_token;
      if (!token) throw new Error(`No access_token: ${JSON.stringify(response.data)}`);
      return token;
    } catch (err: any) {
      if (attempt === retries) {
        throw new Error(
          `OAuth failed after ${retries} attempts. HTTP ${err.response?.status || "N/A"}: ` +
          `${JSON.stringify(err.response?.data) || err.message}`
        );
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error("Unreachable");
}

// ============================================================
// ROUTES
// ============================================================

router.get("/health", async (req, res) => {
  res.json({
    status: "online",
    environment: "netlify",
    daraja_env: DARAJA_ENV,
    firebase: db ? "connected" : "not connected",
    timestamp: new Date().toISOString(),
  });
});

router.get("/test-token", async (req, res) => {
  try {
    const token = await getOAuthToken();
    res.json({ success: true, token_preview: token.slice(0, 20) + "..." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/pay", async (req, res) => {
  const { phoneNumber, amount, userId, tierId } = req.body;

  if (!phoneNumber || !amount || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const phone = normalizePhone(phoneNumber);
    const token = await getOAuthToken();
    const timestamp = getDarajaTimestamp();
    const password = getDarajaPassword(timestamp);

    const stkPayload = {
      BusinessShortCode: DARAJA.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(Number(amount)),
      PartyA: phone,
      PartyB: DARAJA.shortcode,
      PhoneNumber: phone,
      CallBackURL: DARAJA.callbackUrl || "https://example.com/api/callback",
      AccountReference: `Kavyati-${tierId || "sub"}`,
      TransactionDesc: `Team Kavyati ${tierId || "subscription"} payment`,
    };

    const stkResponse = await axios.post(
      `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      stkPayload,
      {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        httpsAgent,
        timeout: 30000,
      }
    );

    const { ResponseCode, MerchantRequestID, CheckoutRequestID, ResponseDescription } = stkResponse.data;

    if (ResponseCode === "0") {
      if (db) {
        await db.collection("transactions").doc(CheckoutRequestID).set({
          userId, tierId, amount: Math.round(Number(amount)), phone,
          status: "pending", merchantRequestId: MerchantRequestID,
          checkoutRequestId: CheckoutRequestID, timestamp: new Date(),
        });
      }
      return res.json({
        success: true, message: ResponseDescription,
        checkoutRequestId: CheckoutRequestID, merchantRequestId: MerchantRequestID,
      });
    } else {
      throw new Error(`Safaricom rejected: ${ResponseDescription} (Code: ${ResponseCode})`);
    }
  } catch (error: any) {
    const body = error.response?.data;
    res.status(error.response?.status || 500).json({
      success: false,
      error: body?.errorMessage || body?.ResponseDescription || error.message,
    });
  }
});

router.post("/callback", async (req, res) => {
  const callback = req.body?.Body?.stkCallback;
  if (!callback) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

  if (!db) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const transRef = db.collection("transactions").doc(CheckoutRequestID);
    const transDoc = await transRef.get();
    if (!transDoc.exists) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const { userId, tierId } = transDoc.data()!;

    if (ResultCode === 0) {
      const metadata: Record<string, any> = {};
      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) metadata[item.Name] = item.Value;
      }
      await transRef.update({
        status: "completed", resultCode: ResultCode, resultDesc: ResultDesc,
        mpesaCode: metadata.MpesaReceiptNumber || "", amountPaid: metadata.Amount || 0,
        completedAt: new Date(),
      });
      await db.collection("users").doc(userId).update({
        subscriptionTier: tierId, subscriptionStatus: "active", subscriptionDate: new Date(),
      });
    } else {
      await transRef.update({ status: "failed", resultCode: ResultCode, resultDesc: ResultDesc, failedAt: new Date() });
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    res.status(500).json({ ResultCode: 1, ResultDesc: "Internal error" });
  }
});

// Handle multiple possible base paths (Netlify rewrites vs direct access)
app.use(["/.netlify/functions/mpesa", "/api", "/"], router);

export const handler = serverless(app);
