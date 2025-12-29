import PAYPAY from "@paypayopa/paypayopa-sdk-node";
import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import config from "$lib/config/paypayconfig";

// 获取支付状态
export const GET: RequestHandler = async ({ params }) => {
    const merchantPaymentId = [params.merchantPaymentId];

    if (!merchantPaymentId) {
        throw error(400, "merchantPaymentId is required");
    }

    try {
        PAYPAY.Configure({
            clientId: config.paypayconfig.clientId,
            clientSecret: config.paypayconfig.clientSecret,
            merchantId: config.paypayconfig.merchantId,
            productionMode: config.paypayconfig.productionMode
        });

        const response = await new Promise<any>((resolve, reject) => {
            PAYPAY.GetCodePaymentDetails(merchantPaymentId as any, (res: any) => {
                console.log(res);
                if (res?.BODY?.resultInfo?.code === "SUCCESS") {
                    resolve(res);
                } else {
                    reject(res);
                }
            });
        });
		console.log("createStatus",response);

        return json({
            success: true,
            data: response
        });
    } catch (err) {
        console.error("PayPay API Error:", err);
        throw error(500, "Failed to fetch payment details");
    }
};
