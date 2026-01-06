// cartStore.ts
import {derived, get, writable} from 'svelte/store';
import {cartAPI} from '$lib/services/cartService';
import {pb} from '$lib/services/PBConfig';
import {currentUser} from '$lib/stores/userStore';

export interface CartItem {
    id: string;
    quantity: number;
    selected: boolean;
    sku?: string; // SKU ID
    specs?: Record<string, string>; // 规格信息
    product: {
        id: string;
        name: string;
        price: number;
        original_price?: number;
        image: string;
        tags?: string;
        in_stock: boolean;
    };
    skuInfo?: {
        id: string;
        price: number;
        stock: number;
        status: boolean;
        specs: Record<string, string>;
    };
}

interface CartState {
    items: CartItem[];
    loading: boolean;
    error: string | null;
}

const createCartStore = () => {
    const {subscribe, set, update} = writable<CartState>({
        items: [],
        loading: false,
        error: null
    });

    /* ---------- 加载购物车 ---------- */
    const loadCart = async (): Promise<void> => {
        const user = pb.authStore.record;
        if (!user) {
            set({items: [], loading: false, error: null});
            return;
        }

        update(s => ({...s, loading: true, error: null}));

        try {
            const records = await cartAPI.getCartItems(user.id);

            const items: CartItem[] = records
                .filter(r => r.expand?.product)
                .map(r => {
                    const skuInfo = r.expand?.sku ? {
                        id: r.expand.sku.id,
                        price: r.expand.sku.price,
                        stock: r.expand.sku.stock,
                        status: r.expand.sku.status,
                        specs: r.expand.sku.specs
                    } : undefined;

                    // 如果有 SKU，使用 SKU 的价格和库存状态
                    const price = skuInfo?.price ?? r.expand!.product.price;
                    const inStock = skuInfo ? (skuInfo.status && skuInfo.stock > 0) : r.expand!.product.inStock;

                    return {
                        id: r.id,
                        quantity: r.quantity,
                        selected: r.selected,
                        sku: r.sku,
                        specs: r.specs,
                        product: {
                            id: r.expand!.product.id,
                            name: r.expand!.product.name,
                            price: price,
                            original_price: r.expand!.product.originalPrice,
                            image: r.expand!.product.image,
                            tags: r.expand!.product.tags,
                            in_stock: inStock
                        },
                        skuInfo
                    };
                });

            set({items, loading: false, error: null});
        } catch (e) {
            console.error('Cart load failed:', e);
            set({items: [], loading: false, error: 'カートの読み込みに失敗しました'});
        }
    };

    /* ---------- 添加商品到购物车 ---------- */
    const addItem = async (
        productId: string,
        quantity: number = 1,
        skuId?: string,
        specs?: Record<string, string>
    ): Promise<void> => {
        const user = pb.authStore.record;
        if (!user) throw new Error('ログインが必要です');

        await cartAPI.addToCart(user.id, productId, quantity, skuId, specs);
        await loadCart();
    };

    /* ---------- 更新数量 ---------- */
    const updateQuantity = async (itemId: string, delta: number): Promise<void> => {
        update(state => {
            const item = state.items.find(i => i.id === itemId);
            if (!item) return state;

            const newQuantity = item.quantity + delta;

            // 检查库存限制
            const maxStock = item.skuInfo?.stock ?? 999;
            if (newQuantity > maxStock) {
                return state;
            }

            if (newQuantity <= 0) {
                removeItem(itemId);
                return state;
            }

            cartAPI.updateCartItem(itemId, newQuantity).catch(console.error);

            return {
                ...state,
                items: state.items.map(i =>
                    i.id === itemId ? {...i, quantity: newQuantity} : i
                )
            };
        });
    };

    /* ---------- 设置具体数量 ---------- */
    const setQuantity = async (itemId: string, quantity: number): Promise<void> => {
        if (quantity <= 0) {
            await removeItem(itemId);
            return;
        }

        update(state => {
            const item = state.items.find(i => i.id === itemId);
            if (!item) return state;

            // 检查库存限制
            const maxStock = item.skuInfo?.stock ?? 999;
            const finalQuantity = Math.min(quantity, maxStock);

            cartAPI.updateCartItem(itemId, finalQuantity).catch(console.error);

            return {
                ...state,
                items: state.items.map(i =>
                    i.id === itemId ? {...i, quantity: finalQuantity} : i
                )
            };
        });
    };

    /* ---------- 删除商品 ---------- */
    const removeItem = async (itemId: string): Promise<void> => {
        await cartAPI.removeCartItem(itemId);
        update(s => ({
            ...s,
            items: s.items.filter(i => i.id !== itemId)
        }));
    };

    /* ---------- 批量删除选中的商品 ---------- */
    const removeSelectedItems = async (): Promise<void> => {
        const state = get({subscribe});
        const selectedIds = state.items.filter(i => i.selected).map(i => i.id);

        await Promise.all(selectedIds.map(id => cartAPI.removeCartItem(id)));
        await loadCart();
    };

    /* ---------- 切换单个商品选中状态 ---------- */
    const toggleSelect = async (itemId: string): Promise<void> => {
        update(state => {
            const item = state.items.find(i => i.id === itemId);
            if (!item) return state;

            const selected = !item.selected;
            cartAPI.toggleSelectItem(itemId, selected).catch(console.error);

            return {
                ...state,
                items: state.items.map(i =>
                    i.id === itemId ? {...i, selected} : i
                )
            };
        });
    };

    /* ---------- 全选/取消全选 ---------- */
    const toggleSelectAll = async (selected: boolean): Promise<void> => {
        const items = get({subscribe}).items;

        await Promise.all(
            items.map(item =>
                cartAPI.toggleSelectItem(item.id, selected)
            )
        );

        update(s => ({
            ...s,
            items: s.items.map(i => ({...i, selected}))
        }));
    };

    /* ---------- 清空购物车 ---------- */
    const clearCart = async (): Promise<void> => {
        const user = pb.authStore.record;
        if (!user) return;

        await cartAPI.clearCart(user.id);
        set({items: [], loading: false, error: null});
    };

    // 监听用户登录状态
    currentUser.subscribe((user: any) => {
        if (user) loadCart();
        else set({items: [], loading: false, error: null});
    });

    return {
        subscribe,
        loadCart,
        refresh: loadCart,
        addItem,
        updateQuantity,
        setQuantity,
        removeItem,
        removeSelectedItems,
        toggleSelect,
        toggleSelectAll,
        clearCart
    };
};

export const cart = createCartStore();

/* ---------- 购物车统计信息 ---------- */
export const cartStats = derived(cart, $cart => {
    const selectedItems = $cart.items.filter(
        i => i.selected && i.product.in_stock
    );

    const subtotal = selectedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const originalTotal = selectedItems.reduce(
        (sum, item) => sum + (item.product.original_price ?? item.product.price) * item.quantity,
        0
    );

    const discount = originalTotal - subtotal;

    return {
        // 购物车总商品数（所有商品）
        totalItems: $cart.items.reduce((sum, i) => sum + i.quantity, 0),
        // 选中的商品数量
        selectedCount: selectedItems.reduce((sum, i) => sum + i.quantity, 0),
        // 选中商品的小计
        subtotal,
        // 原价总计
        originalTotal,
        // 折扣金额
        discount,
        // 是否全选
        allSelected:
            $cart.items.length > 0 &&
            selectedItems.length === $cart.items.length,
        // 是否有不可用商品
        hasUnavailable: $cart.items.some(i => !i.product.in_stock),
        // 是否加载中
        loading: $cart.loading,
        // 错误信息
        error: $cart.error
    };
});