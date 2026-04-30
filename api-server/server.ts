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

// Pay Hero Config
const PAYHERO = {
  get username() { return (process.env.PAYHERO_API_USERNAME || "").trim(); },
  get password() { return (process.env.PAYHERO_API_PASSWORD || "").trim(); },
  get accountId() { return (process.env.PAYHERO_ACCOUNT_ID || "8237").trim(); },
  get callbackUrl() { return (process.env.CALLBACK_URL || "").trim(); }
};

const PAYHERO_URL = "https://backend.payhero.co.ke/api/v2/payments";
const agent = new https.Agent({ rejectUnauthorized: false });

// Phone normalization
function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("254")) d = "0" + d.slice(3);
  else if (d.length === 9) d = "0" + d;
  return d;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "online", gateway: "PayHero", account: PAYHERO.accountId, hasKey: !!PAYHERO.username });
});

// Pay Hero Push
app.post("/api/pay", async (req, res) => {
  const { phoneNumber, amount, userId, tierId } = req.body;
  if (!phoneNumber || !amount || !userId) return res.status(400).json({ error: "Missing fields" });

  try {
    const phone = normalizePhone(phoneNumber);
    const amountVal = Math.round(Number(amount));
    const auth = Buffer.from(`${PAYHERO.username}:${PAYHERO.password}`).toString("base64");
    const checkoutRequestId = `Kavyati_${Date.now()}`;

    const payload = {
      amount: amountVal,
      phone_number: phone,
      customer_name: req.body.customerName || "Kavyati Member",
      external_reference: checkoutRequestId,
      provider: "m-pesa"
    };

    const r = await axios.post("https://backend.payhero.co.ke/api/account/8237/payments", payload, {
      headers: { 
        'Content-Type': 'application/json',
        'Referer': 'https://lipwa.link/',
        'Origin': 'https://lipwa.link'
      },
      httpsAgent: agent, timeout: 30000,
    });

    if (r.data.success) {
      return res.json({ success: true, checkoutRequestId, message: "Initiated successfully" });
    }
    throw new Error(r.data.message || "Failed to initiate payment");
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.response?.data?.message || e.message });
  }
});

// Callback
app.post("/api/callback", (req, res) => {
  console.log("PAY HERO CALLBACK:", JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Pay Hero API server on port ${PORT}`);
  console.log(`📡 Gateway: Pay Hero`);
  console.log(`🔑 Username: ${PAYHERO.username ? PAYHERO.username.slice(0, 10) + "..." : "MISSING"}`);
});

