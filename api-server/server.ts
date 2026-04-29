import express from "express";
import axios from "axios";
import https from "https";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Allow requests from your frontend
app.use(cors({ origin: "*" }));
app.use(express.json());

// Daraja Config
const DARAJA_ENV = (process.env.DARAJA_ENV || "sandbox").trim();
const BASE_URL = DARAJA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const DARAJA = {
  get key()       { return (process.env.DARAJA_CONSUMER_KEY || "").trim(); },
  get secret()    { return (process.env.DARAJA_CONSUMER_SECRET || "").trim(); },
  get shortcode() { return (process.env.DARAJA_BUSINESS_SHORTCODE || "174379").trim(); },
  get passkey()   { return (process.env.DARAJA_PASSKEY || "").trim(); },
  get callback()  { return (process.env.DARAJA_CALLBACK_URL || "").trim(); },
};

const agent = new https.Agent({ rejectUnauthorized: false });

// Phone normalization
function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) d = "254" + d.slice(1);
  else if (d.length === 9) d = "254" + d;
  if (!/^254\d{9}$/.test(d)) throw new Error(`Invalid phone: ${raw}`);
  return d;
}

// Timestamp in EAT (UTC+3)
function getTimestamp(): string {
  const n = new Date(Date.now() + 3 * 3600000);
  return `${n.getUTCFullYear()}${String(n.getUTCMonth()+1).padStart(2,"0")}${String(n.getUTCDate()).padStart(2,"0")}${String(n.getUTCHours()).padStart(2,"0")}${String(n.getUTCMinutes()).padStart(2,"0")}${String(n.getUTCSeconds()).padStart(2,"0")}`;
}

// OAuth with retry
async function getToken(retries = 3): Promise<string> {
  const url = `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
  const auth = Buffer.from(`${DARAJA.key}:${DARAJA.secret}`).toString("base64");

  for (let i = 1; i <= retries; i++) {
    try {
      const r = await axios.get(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
        httpsAgent: agent, timeout: 15000,
      });
      if (r.data.access_token) return r.data.access_token;
      throw new Error("No token in response");
    } catch (e: any) {
      console.log(`OAuth attempt ${i}/${retries} failed:`, e.response?.status, e.response?.data || e.message);
      if (i === retries) throw new Error(`OAuth failed: ${e.response?.status} ${JSON.stringify(e.response?.data) || e.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error("Unreachable");
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "online", env: DARAJA_ENV, base: BASE_URL, hasKey: !!DARAJA.key });
});

// Test token
app.get("/api/test-token", async (req, res) => {
  try {
    const token = await getToken();
    res.json({ success: true, preview: token.slice(0, 20) + "..." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// STK Push
app.post("/api/pay", async (req, res) => {
  const { phoneNumber, amount, userId, tierId } = req.body;
  if (!phoneNumber || !amount || !userId) return res.status(400).json({ error: "Missing fields" });

  try {
    const phone = normalizePhone(phoneNumber);
    const token = await getToken();
    const ts = getTimestamp();
    const password = Buffer.from(`${DARAJA.shortcode}${DARAJA.passkey}${ts}`).toString("base64");

    const payload = {
      BusinessShortCode: DARAJA.shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(Number(amount)),
      PartyA: phone,
      PartyB: DARAJA.shortcode,
      PhoneNumber: phone,
      CallBackURL: DARAJA.callback || `https://example.com/api/callback`,
      AccountReference: `Kavyati-${tierId || "sub"}`,
      TransactionDesc: `Kavyati ${tierId || "subscription"}`,
    };

    const r = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      httpsAgent: agent, timeout: 30000,
    });

    if (r.data.ResponseCode === "0") {
      return res.json({ success: true, ...r.data });
    }
    throw new Error(r.data.ResponseDescription);
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.response?.data?.errorMessage || e.message });
  }
});

// Callback
app.post("/api/callback", (req, res) => {
  console.log("CALLBACK:", JSON.stringify(req.body, null, 2));
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

app.listen(PORT, () => {
  console.log(`🚀 Daraja API server on port ${PORT}`);
  console.log(`📡 ${DARAJA_ENV} → ${BASE_URL}`);
  console.log(`🔑 Key: ${DARAJA.key ? DARAJA.key.slice(0, 10) + "..." : "MISSING"}`);
});
