const axios = require('axios');
const auth = Buffer.from('pHq1m1x6azsNh9iZB1KVSIA4am9CkqTxvmQbdTzakadXFn6p:guG7wJ6N4hnRy2pGDuCJ2TIJS4sbENKVzHb7jY6oZ1mQl3KTop62TaAwqPYQtlPf').toString('base64');
async function run() {
  try {
    const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {headers: {Authorization: `Basic ${auth}`, 'User-Agent': 'Mozilla/5.0'}});
    console.log(res.data);
  } catch(e) {
    console.log('ERROR STATUS:', e.response?.status);
    console.log('ERROR DATA:', e.response?.data);
  }
}
run();
