// src/routes/api/paypay/refund/+server.ts
import PAYPAY from "@paypayopa/paypayopa-sdk-node";
import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
	try {
		// 配置 PayPay
		PAYPAY.Configure({
			clientId: "a_rAkl3nPJIv_ZSrN",
			clientSecret: "J7bHSwcSNRDtiBmMOkKZYIjyQqhhzcQlAUe46Vzc9yE=",
			merchantId: "990268679139298865",
			productionMode: false
		});

		const payload = await request.json();

		// 验证必需参数
		if (!payload.merchantRefundId || !payload.paymentId || !payload.amount) {
			throw error(400, "必須パラメータが不足しています");
		}

		// 调用退款 API
		const response = await new Promise<any>((resolve, reject) => {
			PAYPAY.PaymentRefund(payload, (res: any) => {
				console.log("Refund Response:", res);
				if (res?.BODY?.resultInfo?.code === "SUCCESS") {
					resolve(res);
				} else {
					reject(res);
				}
			});
		});

		return json({
			success: true,
			data: response.BODY,
			message: "返金が正常に処理されました"
		});
	} catch (err: any) {
		console.error("PayPay Refund Error:", err);
		return json({
			success: false,
			error: err.BODY?.resultInfo?.message || "返金処理に失敗しました"
		}, { status: err.STATUS || 500 });
	}
};
