/**
 * Standalone Daraja Test Script
 * Run: node scripts/test-daraja.js
 * 
 * Tests OAuth token generation and optionally STK push
 * WITHOUT needing the full application server running.
 */

const axios = require("axios");
const https = require("https");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const DARAJA_ENV = (process.env.DARAJA_ENV || "sandbox").trim();
const BASE = DARAJA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const KEY = (process.env.DARAJA_CONSUMER_KEY || "").trim();
const SECRET = (process.env.DARAJA_CONSUMER_SECRET || "").trim();
const SHORTCODE = (process.env.DARAJA_BUSINESS_SHORTCODE || "174379").trim();
const PASSKEY = (process.env.DARAJA_PASSKEY || "").trim();

console.log("============================================");
console.log("   DARAJA STANDALONE DIAGNOSTICS");
console.log("============================================");
console.log(`Environment:   ${DARAJA_ENV}`);
console.log(`Base URL:      ${BASE}`);
console.log(`Consumer Key:  ${KEY ? KEY.slice(0, 10) + "..." : "❌ MISSING"}`);
console.log(`Consumer Sec:  ${SECRET ? SECRET.slice(0, 10) + "..." : "❌ MISSING"}`);
console.log(`Shortcode:     ${SHORTCODE}`);
console.log(`Passkey:       ${PASSKEY ? PASSKEY.slice(0, 15) + "..." : "❌ MISSING"}`);
console.log("============================================\n");

async function testOAuth() {
  console.log("🔐 Step 1: Testing OAuth Token Generation...\n");

  const auth = Buffer.from(`${KEY}:${SECRET}`).toString("base64");
  const url = `${BASE}/oauth/v1/generate?grant_type=client_credentials`;

  console.log(`   URL: ${url}`);
  console.log(`   Auth Header: Basic ${auth.slice(0, 20)}...`);

  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
      httpsAgent,
      timeout: 15000,
    });

    console.log(`\n   ✅ SUCCESS!`);
    console.log(`   Token: ${res.data.access_token.slice(0, 30)}...`);
    console.log(`   Expires in: ${res.data.expires_in} seconds\n`);
    return res.data.access_token;
  } catch (err) {
    console.log(`\n   ❌ FAILED!`);
    console.log(`   HTTP Status: ${err.response?.status || "NETWORK_ERROR"}`);
    console.log(`   Response: ${JSON.stringify(err.response?.data || err.message)}`);
    console.log(`\n   💡 FIX: Go to https://developer.safaricom.co.ke`);
    console.log(`   → My Apps → Create a NEW app → Enable "Lipa Na M-Pesa Sandbox"`);
    console.log(`   → Copy the fresh Consumer Key & Secret into your .env file\n`);
    return null;
  }
}

async function testSTKPush(token, phone) {
  console.log(`📱 Step 2: Testing STK Push to ${phone}...\n`);

  // Generate timestamp in EAT
  const now = new Date();
  const eat = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  const ts = `${eat.getUTCFullYear()}${String(eat.getUTCMonth() + 1).padStart(2, "0")}${String(eat.getUTCDate()).padStart(2, "0")}${String(eat.getUTCHours()).padStart(2, "0")}${String(eat.getUTCMinutes()).padStart(2, "0")}${String(eat.getUTCSeconds()).padStart(2, "0")}`;
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${ts}`).toString("base64");

  // Normalize phone
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "254" + digits.slice(1);
  else if (digits.length === 9) digits = "254" + digits;

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: ts,
    TransactionType: "CustomerPayBillOnline",
    Amount: 1,
    PartyA: digits,
    PartyB: SHORTCODE,
    PhoneNumber: digits,
    CallBackURL: "https://example.com/api/callback",
    AccountReference: "KavyatiTest",
    TransactionDesc: "Test payment",
  };

  console.log(`   Timestamp: ${ts}`);
  console.log(`   Phone:     ${digits}`);
  console.log(`   Amount:    1 KES`);

  try {
    const res = await axios.post(
      `${BASE}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        httpsAgent,
        timeout: 30000,
      }
    );

    console.log(`\n   ✅ STK PUSH SENT!`);
    console.log(`   Response Code: ${res.data.ResponseCode}`);
    console.log(`   Description: ${res.data.ResponseDescription}`);
    console.log(`   Checkout ID: ${res.data.CheckoutRequestID}`);
    console.log(`\n   📱 Check your phone for the M-Pesa prompt!\n`);
  } catch (err) {
    console.log(`\n   ❌ STK PUSH FAILED!`);
    console.log(`   HTTP Status: ${err.response?.status || "NETWORK_ERROR"}`);
    console.log(`   Response: ${JSON.stringify(err.response?.data || err.message)}`);
    console.log(`\n   💡 Common fixes:`);
    console.log(`   - Make sure "Lipa Na M-Pesa Sandbox" is enabled on your Daraja App`);
    console.log(`   - For sandbox, use test number: 254708374149`);
    console.log(`   - Verify your passkey matches the one from Test Credentials page\n`);
  }
}

async function main() {
  const token = await testOAuth();
  if (!token) {
    console.log("⛔ Cannot proceed to STK Push without a valid token.");
    process.exit(1);
  }

  // Use command line arg or default sandbox test number
  const phone = process.argv[2] || "254708374149";
  await testSTKPush(token, phone);
}

main();
