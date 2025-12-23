import PAYPAY from "@paypayopa/paypayopa-sdk-node";
import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
    const merchantPaymentId = [params.merchantPaymentId];

    // 验证参数
    if (!merchantPaymentId) {
        throw error(400, "merchantPaymentId is required");
    }

    try {
        // 配置 PayPay
        PAYPAY.Configure({
            clientId: "a_rAkl3nPJIv_ZSrN",
            clientSecret: "J7bHSwcSNRDtiBmMOkKZYIjyQqhhzcQlAUe46Vzc9yE=",
            merchantId: "990268679139298865",
            productionMode: false
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

        return json({
            success: true,
            data: response
        });
    } catch (err) {
        console.error("PayPay API Error:", err);
        throw error(500, "Failed to fetch payment details");
    }
};
