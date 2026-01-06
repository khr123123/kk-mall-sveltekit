import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
// Test API
export const GET: RequestHandler = async () => {
	return json({
		message: 'Hello SvelteKit API'
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	return json({
		success: true,
		data: body
	});
};
