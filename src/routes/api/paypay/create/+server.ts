// src/routes/api/create-paypay-order/+server.js
import { createQrCode } from '$lib/services/paypay';
import { json } from '@sveltejs/kit';
import crypto from 'crypto';

export async function POST({ request }) {
    try {
        const orderData = await request.json();

        // 生成唯一的支付ID
        const merchantPaymentId = `ORDER_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        // 调用 PayPay API 创建二维码
        const result = await createQrCode(merchantPaymentId, orderData);

        if (result.resultInfo.code !== 'SUCCESS') {
            return json(
                { error: result.resultInfo.message || '创建支付失败' },
                { status: 400 }
            );
        }

        // 返回支付信息给前端
        return json({
            success: true,
            paymentId: merchantPaymentId,
            qrCodeUrl: result.data.url, // 二维码URL
            qrCodeImage: result.data.qrCodeImage // Base64二维码图片
        });

    } catch (error) {
        console.error('创建支付订单失败:', error);
        return json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}