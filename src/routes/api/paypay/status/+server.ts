// src/routes/api/payment-status/[id]/+server.js
import { getPaymentStatus } from '$lib/services/paypay';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
    try {
        const { id } = params;
        const result = await getPaymentStatus(id);
        
        return json({
            status: result.data?.status || 'UNKNOWN',
            paymentId: id,
            details: result.data
        });
        
    } catch (error) {
        console.error('查询支付状态失败:', error);
        return json(
            { error: '查询支付状态失败' },
            { status: 500 }
        );
    }
}