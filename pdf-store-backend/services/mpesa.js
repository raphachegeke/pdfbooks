const axios = require('axios');
const moment = require('moment');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

// 1. Generate Access Token
const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    // Buffer auth string
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(url, {
            headers: {
                "Authorization": `Basic ${auth}`
            }
        });
        return response.data.access_token;
    } catch (error) {
        throw new Error("Failed to generate M-Pesa Access Token");
    }
};

// 2. STK Push (Prompt user to enter PIN)
const stkPush = async (phoneNumber, amount, orderId) => {
    const accessToken = await getAccessToken();
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const timestamp = moment().format('YYYYMMDDHHmmss');
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;

    // Create Password: Shortcode + Passkey + Timestamp
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // Format phone number (remove leading 0 or +254 and add 254)
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith("0")) {
        formattedPhone = "254" + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith("+")) {
        formattedPhone = phoneNumber.substring(1);
    }

    const requestBody = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.MPESA_CALLBACK_URL}`,
        AccountReference: `PDF-Store-${orderId}`,
        TransactionDesc: "Purchase of PDF Book"
    };

    try {
        const response = await axios.post(url, requestBody, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("STK Push Error:", error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = { stkPush };