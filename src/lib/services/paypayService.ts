import crypto from "crypto";
// ============================
// PayPay REST API 基础配置
// ============================
const API_KEY = "a_rAkl3nPJIv_ZSrN";
const API_SECRET = "J7bHSwcSNRDtiBmMOkKZYIjyQqhhzcQlAUe46Vzc9yE";
const MERCHANT_ID = "990268679139298865"; // MUNE_CAKE_SHOP
const BASE_URL = "https://stg-api.sandbox.paypay.ne.jp"; // sandbox
const redirectBaseUrl = "https://mune-cake-shop.vercel.app";

// PayPay Authorization 计算签名
function generateHeaders(method, path, body = "") {
    const nonce = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000);

    const message = `${timestamp}${nonce}${body}`;
    const hmac = crypto
        .createHmac("sha256", API_SECRET)
        .update(message)
        .digest("hex");

    return {
        "Content-Type": "application/json",
        "X-ASSUME-MERCHANT": MERCHANT_ID,
        "X-API-KEY": API_KEY,
        "X-REQUEST-NONCE": nonce,
        "X-REQUEST-TIMESTAMP": timestamp,
        "X-REQUEST-HMAC": hmac,
    };
}

// =======================================
// 创建 QR 码 (Java: createQrCode)
// =======================================
export async function createQrCode(request, merchantPaymentId) {
    const body = JSON.stringify({
        merchantPaymentId,
        codeType: "ORDER_QR",
        amount: request.amount,
        orderItems: request.orderItems,
        requestedAt: Math.floor(Date.now() / 1000),
        redirectUrl: `${redirectBaseUrl}/${merchantPaymentId}`,
        redirectType: "WEB_LINK",
    });

    // const headers = generateHeaders("POST", "/v2/codes", body);

    const response = await fetch(`${BASE_URL}/v2/codes`, {
        method: "POST",
        headers,
        body,
    });

    const data = await response.json();
    return data;
}

// =======================================
// 查询支付状态 (Java: fetchPaymentDetails)
// 自动轮询 3 次，每次间隔 1 秒
// =======================================
export async function getPaymentStatus(merchantPaymentId) {
    for (let i = 0; i < 3; i++) {
        const path = `/v2/codes/payments/${merchantPaymentId}`;
        const headers = generateHeaders("GET", path);

        const response = await fetch(`${BASE_URL}${path}`, {
            method: "GET",
            headers,
        });
        const data = await response.json();

        const status = data?.data?.status;

        if (status === "COMPLETED" || status === "FAILED") {
            return data;
        }

        // 等待 1 秒继续轮询
        await new Promise((r) => setTimeout(r, 1000));
    }

    return { message: "Payment still pending after 3 attempts" };
}
