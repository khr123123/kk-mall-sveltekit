import { writable, derived } from 'svelte/store';
import { pb, cartAPI, currentUser, couponAPI } from '$lib/services/cartService';

// 购物车项类型
export interface CartItem {
    id: string;
    quantity: number;
    selected: boolean;
    product: {
        id: string;
        name: string;
        price: number;
        original_price?: number;
        image: string;
        tags?: string;
        in_stock: boolean;
    };
}

// 购物车 store
function createCartStore() {
    const { subscribe, set, update } = writable<{
        items: CartItem[];
        loading: boolean;
        error: string | null;
    }>({
        items: [],
        loading: false,
        error: null
    });

    // 从数据库加载购物车
    async function loadCart() {
        const user = pb.authStore.model;
        if (!user) {
            set({ items: [], loading: false, error: null });
            return;
        }

        update(state => ({ ...state, loading: true, error: null }));

        try {
            const records = await cartAPI.getCartItems(user.id);
            const items: CartItem[] = records.map(record => ({
                id: record.id,
                quantity: record.quantity,
                selected: record.selected,
                product: {
                    id: record.expand!.product.id,
                    name: record.expand!.product.name,
                    price: record.expand!.product.price,
                    original_price: record.expand!.product.originalPrice,
                    image: record.expand!.product.image,
                    tags: record.expand!.product.tags,
                    in_stock: record.expand!.product.inStock,
                }
            }));

            set({ items, loading: false, error: null });
        } catch (error) {
            console.error('Failed to load cart:', error);
            set({ items: [], loading: false, error: 'カートの読み込みに失敗しました' });
        }
    }

    // 添加商品到购物车
    async function addItem(productId: string, quantity: number = 1) {
        const user = pb.authStore.model;
        if (!user) {
            throw new Error('ログインが必要です');
        }

        try {
            await cartAPI.addToCart(user.id, productId, quantity);
            await loadCart(); // 重新加载
        } catch (error) {
            console.error('Failed to add item:', error);
            throw error;
        }
    }

    // 更新数量
    async function updateQuantity(itemId: string, delta: number) {
        update(state => {
            const item = state.items.find(i => i.id === itemId);
            if (!item) return state;

            const newQuantity = Math.max(1, item.quantity + delta);

            // 立即更新 UI
            const updatedItems = state.items.map(i =>
                i.id === itemId ? { ...i, quantity: newQuantity } : i
            );

            // 异步更新数据库
            cartAPI.updateCartItem(itemId, newQuantity).catch(console.error);

            return { ...state, items: updatedItems };
        });
    }

    // 切换选择状态
    async function toggleSelect(itemId: string) {
        update(state => {
            const item = state.items.find(i => i.id === itemId);
            if (!item) return state;

            const newSelected = !item.selected;
            const updatedItems = state.items.map(i =>
                i.id === itemId ? { ...i, selected: newSelected } : i
            );

            cartAPI.toggleSelectItem(itemId, newSelected).catch(console.error);

            return { ...state, items: updatedItems };
        });
    }

    // 删除商品
    async function removeItem(itemId: string) {
        try {
            await cartAPI.removeCartItem(itemId);
            update(state => ({
                ...state,
                items: state.items.filter(i => i.id !== itemId)
            }));
        } catch (error) {
            console.error('Failed to remove item:', error);
            throw error;
        }
    }

    // 清空购物车
    async function clearCart() {
        const user = pb.authStore.model;
        if (!user) return;

        try {
            await cartAPI.clearCart(user.id);
            set({ items: [], loading: false, error: null });
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    }

    // 监听用户变化
    currentUser.subscribe(user => {
        if (user) {
            loadCart();
        } else {
            set({ items: [], loading: false, error: null });
        }
    });

    return {
        subscribe,
        addItem,
        updateQuantity,
        toggleSelect,
        removeItem,
        clearCart,
        loadCart,
        refresh: loadCart
    };
}

export const cart = createCartStore();

// 派生 store：计算购物车统计
export const cartStats = derived(cart, $cart => {
    const selectedItems = $cart.items.filter(item => item.selected && item.product.in_stock);

    const subtotal = selectedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity, 0
    );

    const selectedCount = selectedItems.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    return {
        subtotal,
        selectedCount,
        totalItems: $cart.items.reduce((sum, item) => sum + item.quantity, 0),
        totalUniqueItems: $cart.items.length
    };
});

// 优惠券 store
function createCouponStore() {
    const { subscribe, set } = writable<{
        code: string;
        discount: number;
        type: string;
        applied: boolean;
    }>({
        code: '',
        discount: 0,
        type: '',
        applied: false
    });

    return {
        subscribe,
        async applyCoupon(code: string, subtotal: number) {
            const user = pb.authStore.model;
            if (!user) throw new Error('ログインが必要です');

            const coupon = await couponAPI.validateCoupon(code, user.id, subtotal);

            let discount = 0;

            if (coupon.discount_type === 'percentage') {
                discount = Math.floor(subtotal * (coupon.discount_value / 100));
            } else if (coupon.discount_type === 'fixed') {
                discount = coupon.discount_value;
            } else if (coupon.discount_type === 'shipping') {
                // 在购物车页面计算
                discount = 0; // 实际在 total 计算时处理
            }

            set({
                code: coupon.code,
                discount,
                type: coupon.discount_type,
                applied: true
            });

            return discount;
        },
        removeCoupon() {
            set({
                code: '',
                discount: 0,
                type: '',
                applied: false
            });
        }
    };
}

export const coupon = createCouponStore();