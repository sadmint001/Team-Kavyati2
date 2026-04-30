const axios = require("axios");

const PAYHERO_URL = "https://backend.payhero.co.ke/api/v2/payments";
const auth = Buffer.from(`BucaIWqWjOLHlYI1BNQ5:ENdMwB0zGirlbop9WtDG08kFcqar2zSkuh3pQwp1`).toString("base64");

async function run(phone, channelId) {
  const payload = {
    amount: 10,
    phone: phone,
    channel_id: channelId,
    provider: "m-pesa",
    external_reference: "TEST_" + Date.now(),
    callback_url: "https://example.com"
  };

  try {
    console.log(`Testing with phone: ${phone}, channel_id: ${channelId} (${typeof channelId})`);
    const response = await axios.post(PAYHERO_URL, payload, {
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }
    });
    console.log("✅ SUCCESS:", response.data);
  } catch (err) {
    console.log("❌ ERROR:", err.response?.data || err.message);
  }
}

async function main() {
  await run("0792505930", 8237); // String phone, Number channel
  await run("254792505930", 8237); // 254 phone, Number channel
  await run("0792505930", "8237"); // String phone, String channel
}

main();
