
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ error: 'Phone and amount are required' });
  }

  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    return res.status(500).json({ error: 'Daraja API keys missing in environment variables' });
  }

  try {
    // 1. Get OAuth Token from Safaricom Sandbox
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(401).json({ error: 'Failed to authenticate with Safaricom', details: tokenData });
    }

    const accessToken = tokenData.access_token;

    // 2. Format Timestamp & Password (Sandbox Defaults)
    const shortcode = "174379";
    const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    
    const date = new Date();
    const timestamp =
      date.getFullYear().toString() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // 3. Initiate STK Push
    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: "https://smm-panel-drab-sigma.vercel.app/api/callback",
        AccountReference: "SMM Panel",
        TransactionDesc: "Payment for order",
      }),
    });

    const stkData = await stkResponse.json();
    return res.status(200).json(stkData);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
