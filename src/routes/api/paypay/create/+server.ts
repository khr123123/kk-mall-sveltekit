import PAYPAY from '@paypayopa/paypayopa-sdk-node';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import config from '$lib/config/paypayconfig';

// 创建支付订单
export const POST: RequestHandler = async ({ request }) => {
	PAYPAY.Configure({
		clientId: config.paypayconfig.clientId,
		clientSecret: config.paypayconfig.clientSecret,
		merchantId: config.paypayconfig.merchantId,
		productionMode: config.paypayconfig.productionMode
	});
	const payload = await request.json();
	const response = await new Promise<any>((resolve, reject) => {
		PAYPAY.QRCodeCreate(payload, (res: any) => {
			if (res?.BODY?.resultInfo?.code === 'SUCCESS') {
				resolve(res);
			} else {
				reject(res);
			}
		});
	});
	console.log('create', response);

	return json({
		success: true,
		data: response
	});
};
