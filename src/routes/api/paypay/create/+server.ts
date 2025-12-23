import PAYPAY from "@paypayopa/paypayopa-sdk-node";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";


export const POST: RequestHandler = async ({ request }) => {
    PAYPAY.Configure({
        clientId: "a_rAkl3nPJIv_ZSrN",
        clientSecret: "J7bHSwcSNRDtiBmMOkKZYIjyQqhhzcQlAUe46Vzc9yE=",
        merchantId: "990268679139298865",
        productionMode: false
    });
    const payload = await request.json();
    const response = await new Promise<any>((resolve, reject) => {
        PAYPAY.QRCodeCreate(payload, (res: any) => {
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
};
