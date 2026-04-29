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

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// M-Pesa Config (Must be set in Netlify Environment Variables)
const M_PESA_CONFIG = {
  get consumerKey() { return (process.env.DARAJA_CONSUMER_KEY || "").trim(); },
  get consumerSecret() { return (process.env.DARAJA_CONSUMER_SECRET || "").trim(); },
  get shortCode() { return (process.env.DARAJA_BUSINESS_SHORTCODE || "174379").trim(); },
  get passkey() { return (process.env.DARAJA_PASSKEY || "").trim(); },
  get callbackUrl() { return (process.env.DARAJA_CALLBACK_URL || "").trim(); }
};

router.get("/health", async (req, res) => {
  res.json({ status: "online", environment: "netlify", firebase: db ? "connected" : "failed" });
});

router.post("/pay", async (req, res) => {
  const { phoneNumber, amount, userId, tierId } = req.body;

  try {
    const auth = Buffer.from(`${M_PESA_CONFIG.consumerKey}:${M_PESA_CONFIG.consumerSecret}`).toString("base64");
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` }, httpsAgent }
    );
    const token = tokenResponse.data.access_token;

    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const password = Buffer.from(`${M_PESA_CONFIG.shortCode}${M_PESA_CONFIG.passkey}${timestamp}`).toString("base64");

    let phone = phoneNumber.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.slice(1);
    if (phone.length === 9) phone = "254" + phone;

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: M_PESA_CONFIG.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(Number(amount)),
        PartyA: phone,
        PartyB: M_PESA_CONFIG.shortCode,
        PhoneNumber: phone,
        CallBackURL: M_PESA_CONFIG.callbackUrl,
        AccountReference: `User_${userId.slice(0, 8)}`,
        TransactionDesc: `Subscription_${tierId}`,
      },
      { headers: { Authorization: `Bearer ${token}` }, httpsAgent }
    );

    if (db) {
      await db.collection("transactions").doc(response.data.CheckoutRequestID).set({
        userId, tierId, amount, status: "pending", timestamp: new Date(),
        merchantRequestId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID
      });
    }

    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.response?.data?.errorMessage || error.message });
  }
});

router.post("/callback", async (req, res) => {
  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = req.body.Body.stkCallback;
  
  if (!db) return res.json({ ResultCode: 0, ResultDesc: "Success (DB Missing)" });

  try {
    const transRef = db.collection("transactions").doc(CheckoutRequestID);
    const transDoc = await transRef.get();

    if (transDoc.exists && ResultCode === 0) {
      const { userId, tierId } = transDoc.data()!;
      await transRef.update({ status: "completed", resultDesc: ResultDesc });
      await db.collection("users").doc(userId).update({
        subscriptionTier: tierId,
        subscriptionStatus: "active",
        subscriptionDate: new Date()
      });
    } else if (transDoc.exists) {
      await transRef.update({ status: "failed", resultDesc: ResultDesc });
    }
    res.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (err) {
    res.status(500).send("Error");
  }
});

// Handle multiple possible base paths (Netlify rewrites vs direct access)
app.use(["/.netlify/functions/api", "/api", "/"], router);

export const handler = serverless(app);
