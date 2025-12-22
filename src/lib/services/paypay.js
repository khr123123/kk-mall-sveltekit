// src/lib/server/paypay.js
import crypto from 'crypto';

// 从环境变量读取配置（安全！）
// ============================
const API_KEY = "a_rAkl3nPJIv_ZSrN";
const API_SECRET = "J7bHSwcSNRDtiBmMOkKZYIjyQqhhzcQlAUe46Vzc9yE";
const MERCHANT_ID = "990268679139298865"; // MUNE_CAKE_SHOP
const BASE_URL = "https://stg-api.sandbox.paypay.ne.jp"; // sandbox
const redirectBaseUrl = "https://mune-cake-shop.vercel.app";
function generateHeaders(method, path, body = '') {
    const nonce = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${timestamp}${nonce}${body}`;
    const hmac = crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');

    return {
        'Content-Type': 'application/json',
        'X-ASSUME-MERCHANT': MERCHANT_ID,
        'X-API-KEY': API_KEY,
        'X-REQUEST-NONCE': nonce,
        'X-REQUEST-TIMESTAMP': timestamp,
        'X-REQUEST-HMAC': hmac
    };
}

export async function createQrCode(merchantPaymentId, request) {
    const body = JSON.stringify({
        merchantPaymentId,
        codeType: 'ORDER_QR',
        amount: request.amount,
        orderItems: request.orderItems,
        requestedAt: Math.floor(Date.now() / 1000),
        redirectUrl: `${redirectBaseUrl}/payment/success?payment_id=${merchantPaymentId}`,
        redirectType: 'WEB_LINK'
    });

    const headers = generateHeaders('POST', '/v2/codes', body);
    const response = await fetch(`${BASE_URL}/v2/codes`, {
        method: 'POST',
        headers,
        body
    });

    return await response.json();
}

export async function getPaymentStatus(merchantPaymentId) {
    const path = `/v2/codes/payments/${merchantPaymentId}`;
    const headers = generateHeaders('GET', path);

    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers
    });

    return await response.json();
}