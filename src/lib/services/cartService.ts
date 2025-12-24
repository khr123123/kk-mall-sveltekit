import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

// PocketBase 客户端实例
export const pb = new PocketBase('http://127.0.0.1:8090'); // 根据你的实际地址修改

// 用户认证状态 store
export const currentUser = writable(pb.authStore.model);

// 监听认证状态变化
pb.authStore.onChange(() => {
    currentUser.set(pb.authStore.model);
});

// API 工具函数
export const cartAPI = {
    // 获取用户购物车
    async getCartItems(userId: string) {
        return await pb.collection('cart_items').getFullList({
            filter: `user = "${userId}"`,
            expand: 'product'
        });
    },

    // 添加商品到购物车
    async addToCart(userId: string, productId: string, quantity: number = 1) {
        // 检查是否已存在
        const existing = await pb.collection('cart_items').getFirstListItem(
            `user = "${userId}" && product = "${productId}"`
        ).catch(() => null);

        if (existing) {
            // 更新数量
            return await pb.collection('cart_items').update(existing.id, {
                quantity: existing.quantity + quantity
            });
        } else {
            // 新增
            return await pb.collection('cart_items').create({
                user: userId,
                product: productId,
                quantity,
                selected: true
            });
        }
    },

    // 更新购物车项数量
    async updateCartItem(itemId: string, quantity: number) {
        return await pb.collection('cart_items').update(itemId, {
            quantity: Math.max(1, quantity)
        });
    },

    // 切换选择状态
    async toggleSelectItem(itemId: string, selected: boolean) {
        return await pb.collection('cart_items').update(itemId, { selected });
    },

    // 删除购物车项
    async removeCartItem(itemId: string) {
        return await pb.collection('cart_items').delete(itemId);
    },

    // 清空购物车
    async clearCart(userId: string) {
        const items = await pb.collection('cart_items').getFullList({
            filter: `user = "${userId}"`
        });
        
        for (const item of items) {
            await pb.collection('cart_items').delete(item.id);
        }
    }
};

export const couponAPI = {
    // 验证优惠券
    async validateCoupon(code: string, userId: string, subtotal: number) {
        const now = new Date().toISOString();
        
        const coupon = await pb.collection('coupons').getFirstListItem(
            `code = "${code}" && is_active = true && valid_from <= "${now}" && valid_until >= "${now}"`
        ).catch(() => null);

        if (!coupon) {
            throw new Error('無効なクーポンコードです');
        }

        // 检查使用限制
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            throw new Error('このクーポンの使用上限に達しました');
        }

        // 检查最低购买金额
        if (coupon.min_purchase && subtotal < coupon.min_purchase) {
            throw new Error(`このクーポンは¥${coupon.min_purchase.toLocaleString()}以上の購入でご利用いただけます`);
        }

        return coupon;
    },

    // 使用优惠券
    async useCoupon(couponId: string, userId: string, orderId: string) {
        await pb.collection('user_coupons').create({
            user: userId,
            coupon: couponId,
            order_id: orderId,
            used_at: new Date().toISOString()
        });

        // 更新使用计数
        const coupon = await pb.collection('coupons').getOne(couponId);
        await pb.collection('coupons').update(couponId, {
            used_count: (coupon.used_count || 0) + 1
        });
    }
};