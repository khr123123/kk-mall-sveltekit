// cartService.ts
import { pb } from '$lib/services/PBConfig';
import type { RecordModel } from 'pocketbase';

export interface CartRecord extends RecordModel {
	user: string;
	product: string;
	sku?: string;
	quantity: number;
	selected: boolean;
	specs?: Record<string, string>;
	expand?: {
		product?: any;
		sku?: any;
	};
}

export const cartAPI = {
	/* ---------- 获取用户购物车 ---------- */
	getCartItems: async (userId: string): Promise<CartRecord[]> => {
		return await pb.collection('cart_items').getFullList<CartRecord>({
			filter: `user = "${userId}"`,
			expand: 'product,sku',
			sort: '-created'
		});
	},

	/* ---------- 添加到购物车 ---------- */
	addToCart: async (
		userId: string,
		productId: string,
		quantity: number = 1,
		skuId?: string,
		specs?: Record<string, string>
	): Promise<CartRecord> => {
		// 检查是否已存在相同商品（包括相同的 SKU）
		const filter = skuId
			? `user = "${userId}" && product = "${productId}" && sku = "${skuId}"`
			: `user = "${userId}" && product = "${productId}" && sku = ""`;

		const existing = await pb.collection('cart_items').getFullList<CartRecord>({
			filter
		});

		if (existing.length > 0) {
			// 已存在，更新数量
			const item = existing[0];
			return await pb.collection('cart_items').update<CartRecord>(item.id, {
				quantity: item.quantity + quantity
			});
		} else {
			// 不存在，创建新记录
			return await pb.collection('cart_items').create<CartRecord>({
				user: userId,
				product: productId,
				sku: skuId || '',
				specs: specs || {},
				quantity,
				selected: true
			});
		}
	},

	/* ---------- 更新购物车商品数量 ---------- */
	updateCartItem: async (itemId: string, quantity: number): Promise<CartRecord> => {
		return await pb.collection('cart_items').update<CartRecord>(itemId, {
			quantity
		});
	},

	/* ---------- 删除购物车商品 ---------- */
	removeCartItem: async (itemId: string): Promise<boolean> => {
		return await pb.collection('cart_items').delete(itemId);
	},

	/* ---------- 切换选中状态 ---------- */
	toggleSelectItem: async (itemId: string, selected: boolean): Promise<CartRecord> => {
		return await pb.collection('cart_items').update<CartRecord>(itemId, {
			selected
		});
	},

	/* ---------- 清空用户购物车 ---------- */
	clearCart: async (userId: string): Promise<void> => {
		const items = await pb.collection('cart_items').getFullList<CartRecord>({
			filter: `user = "${userId}"`
		});

		await Promise.all(items.map((item) => pb.collection('cart_items').delete(item.id)));
	},

	/* ---------- 批量删除 ---------- */
	batchRemove: async (itemIds: string[]): Promise<void> => {
		await Promise.all(itemIds.map((id) => pb.collection('cart_items').delete(id)));
	}
};
