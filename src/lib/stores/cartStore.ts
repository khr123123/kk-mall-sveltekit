import { writable, derived, get } from 'svelte/store';
import { cartAPI, couponAPI } from '$lib/services/cartService';
import { pb } from '$lib/services/PBConfig';
import { currentUser } from '$lib/stores/userStore';

/* =======================
   类型定义
======================= */

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

interface CartState {
	items: CartItem[];
	loading: boolean;
	error: string | null;
}

/* =======================
   Cart Store
======================= */

function createCartStore() {
	const { subscribe, set, update } = writable<CartState>({
		items: [],
		loading: false,
		error: null
	});

	/* ---------- 加载购物车 ---------- */
	async function loadCart() {
		const user = pb.authStore.model;
		if (!user) {
			set({ items: [], loading: false, error: null });
			return;
		}

		update(s => ({ ...s, loading: true, error: null }));

		try {
			const records = await cartAPI.getCartItems(user.id);

			const items: CartItem[] = records
				.filter(r => r.expand?.product)
				.map(r => ({
					id: r.id,
					quantity: r.quantity,
					selected: r.selected,
					product: {
						id: r.expand!.product.id,
						name: r.expand!.product.name,
						price: r.expand!.product.price,
						original_price: r.expand!.product.originalPrice,
						image: r.expand!.product.image,
						tags: r.expand!.product.tags,
						in_stock: r.expand!.product.inStock
					}
				}));

			set({ items, loading: false, error: null });
		} catch (e) {
			console.error('Cart load failed:', e);
			set({ items: [], loading: false, error: 'カートの読み込みに失敗しました' });
		}
	}

	/* ---------- 添加商品 ---------- */
	async function addItem(productId: string, quantity = 1) {
		const user = pb.authStore.model;
		if (!user) throw new Error('ログインが必要です');

		await cartAPI.addToCart(user.id, productId, quantity);
		await loadCart();
	}

	/* ---------- 更新数量（本地优先） ---------- */
	async function updateQuantity(itemId: string, delta: number) {
		update(state => {
			const item = state.items.find(i => i.id === itemId);
			if (!item) return state;

			const newQuantity = item.quantity + delta;
			if (newQuantity <= 0) {
				removeItem(itemId);
				return state;
			}

			cartAPI.updateCartItem(itemId, newQuantity).catch(console.error);

			return {
				...state,
				items: state.items.map(i =>
					i.id === itemId ? { ...i, quantity: newQuantity } : i
				)
			};
		});
	}

	/* ---------- 删除商品 ---------- */
	async function removeItem(itemId: string) {
		await cartAPI.removeCartItem(itemId);
		update(s => ({
			...s,
			items: s.items.filter(i => i.id !== itemId)
		}));
	}

	/* ---------- 切换选中 ---------- */
	async function toggleSelect(itemId: string) {
		update(state => {
			const item = state.items.find(i => i.id === itemId);
			if (!item) return state;

			const selected = !item.selected;
			cartAPI.toggleSelectItem(itemId, selected).catch(console.error);

			return {
				...state,
				items: state.items.map(i =>
					i.id === itemId ? { ...i, selected } : i
				)
			};
		});
	}

	/* ---------- 全选 / 取消全选 ---------- */
	async function toggleSelectAll(selected: boolean) {
		const items = get({ subscribe }).items;

		await Promise.all(
			items.map(item =>
				cartAPI.toggleSelectItem(item.id, selected)
			)
		);

		update(s => ({
			...s,
			items: s.items.map(i => ({ ...i, selected }))
		}));
	}

	/* ---------- 清空购物车 ---------- */
	async function clearCart() {
		const user = pb.authStore.model;
		if (!user) return;

		await cartAPI.clearCart(user.id);
		set({ items: [], loading: false, error: null });
	}

	/* ---------- 监听登录状态 ---------- */
	currentUser.subscribe((user: any) => {
		if (user) loadCart();
		else set({ items: [], loading: false, error: null });
	});

	return {
		subscribe,
		loadCart,
		refresh: loadCart,
		addItem,
		updateQuantity,
		removeItem,
		toggleSelect,
		toggleSelectAll,
		clearCart
	};
}

export const cart = createCartStore();

/* =======================
   Cart 统计（derived）
======================= */

export const cartStats = derived(cart, $cart => {
	const selectedItems = $cart.items.filter(
		i => i.selected && i.product.in_stock
	);

	return {
		totalItems: $cart.items.reduce((s, i) => s + i.quantity, 0),
		selectedCount: selectedItems.reduce((s, i) => s + i.quantity, 0),
		subtotal: selectedItems.reduce(
			(s, i) => s + i.product.price * i.quantity,
			0
		),
		allSelected:
			$cart.items.length > 0 &&
			selectedItems.length === $cart.items.length
	};
});

/* =======================
   Coupon Store
======================= */

function createCouponStore() {
	const { subscribe, set } = writable({
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
			set({ code: '', discount: 0, type: '', applied: false });
		}
	};
}

export const coupon = createCouponStore();
