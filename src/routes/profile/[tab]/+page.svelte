<!-- routes/profile/[tab]/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { userStore } from '$lib/stores/userStore';
	import {
		profileService,
		type Order,
		type Address,
		type Favorite
	} from '$lib/services/profileService';
	import { onMount } from 'svelte';

	// 响应式监听路由变化
	let currentTab = $state('profile');
	let isLoading = $state(true);

	$effect(() => {
		currentTab = $page.params.tab ?? 'profile';
		loadTabData();
	});

	// 订阅用户状态
	let user = $state($userStore.user);
	let isLoggedIn = $state($userStore.isLoggedIn);

	$effect(() => {
		user = $userStore.user;
		isLoggedIn = $userStore.isLoggedIn;

		// 如果未登录,重定向到登录页
		if (!isLoggedIn && !$userStore.isLoading) {
			goto('/login');
		}
	});

	// 数据状态
	let orders: Order[] = $state([]);
	let addresses: Address[] = $state([]);
	let favorites: Favorite[] = $state([]);
	let userStats = $state({ totalOrders: 0, totalFavorites: 0, totalAddresses: 0 });

	// 模态框状态
	let showAddressModal = $state(false);
	let showAvatarModal = $state(false);
	let showRefundModal = $state(false);
	let editingAddress: Address | null = $state(null);

	// 表单数据
	let addressForm = $state({
		label: '',
		recipient: '',
		phone: '',
		postal_code: '',
		address: '',
		is_default: false
	});

	let avatarFile: File | null = $state(null);
	let avatarPreview: string | null = $state(null);

	// ============ 退款相关状态 ============
	let refundingOrder: Order | null = $state(null);
	let refundForm = $state({
		refundType: 'full', // 'full' 全额退款, 'partial' 部分退款
		refundReason: '',
		refundAmount: 0,
		returnGoods: false, // 是否退货
		trackingNumber: '' // 退货单号（已发货/已送达时需要）
	});
	let isRefunding = $state(false);

	// 退款理由选项
	const refundReasons = [
		'商品不符合描述',
		'商品質量問題',
		'誤って注文した',
		'サイズが合わない',
		'配送遅延',
		'その他'
	];

	// 加载标签页数据
	async function loadTabData() {
		if (!user?.id) return;

		isLoading = true;

		try {
			switch (currentTab) {
				case 'profile':
					await loadUserStats();
					break;
				case 'orders':
					await loadOrders();
					break;
				case 'addresses':
					await loadAddresses();
					break;
				case 'favorites':
					await loadFavorites();
					break;
			}
		} finally {
			isLoading = false;
		}
	}

	// 加载用户统计
	async function loadUserStats() {
		if (!user?.id) return;
		const result = await profileService.getUserStats(user.id);
		if (result.success) {
			userStats = result.stats!;
		}
	}

	// 加载订单
	async function loadOrders() {
		if (!user?.id) return;
		const result = await profileService.getOrders(user.id);
		if (result.success) {
			orders = (result.orders as unknown as Order[]) || [];
		}
	}

	// 加载地址
	async function loadAddresses() {
		if (!user?.id) return;
		const result = await profileService.getAddresses(user.id);
		if (result.success) {
			addresses = (result.addresses as unknown as Address[]) || [];
		}
	}

	function mapFavorites(items: any[] = []) {
		return items.map((item: any) => {
			const product = item.expand?.product_id;

			return {
				id: item.id,
				product_name: product?.name ?? '',
				product_price: product?.price ?? 0,
				product_image: product?.images?.[0] ?? ''
			};
		});
	}

	// 加载收藏
	async function loadFavorites() {
		if (!user?.id) return;
		const result = await profileService.getFavorites(user.id);
		if (result.success) {
			favorites = mapFavorites(result.favorites || []) as unknown as Favorite[];
		}
	}

	// ============ 地址管理 ============
	function openAddressModal(address: Address | null = null) {
		editingAddress = address;
		if (address) {
			addressForm = {
				label: address.label,
				recipient: address.recipient,
				phone: address.phone,
				postal_code: address.postal_code,
				address: address.address,
				is_default: address.is_default
			};
		} else {
			addressForm = {
				label: '',
				recipient: '',
				phone: '',
				postal_code: '',
				address: '',
				is_default: false
			};
		}
		showAddressModal = true;
	}

	function closeAddressModal() {
		showAddressModal = false;
		editingAddress = null;
	}

	async function saveAddress() {
		if (!user?.id) return;

		const result = editingAddress
			? await profileService.updateAddress(editingAddress.id, user.id, addressForm)
			: await profileService.createAddress(user.id, addressForm);

		if (result.success) {
			await loadAddresses();
			closeAddressModal();
		} else {
			alert(`住所の${editingAddress ? '更新' : '作成'}に失敗しました: ${result.error}`);
		}
	}

	async function deleteAddress(addressId: string) {
		if (!confirm('この住所を削除してもよろしいですか?')) return;

		const result = await profileService.deleteAddress(addressId);
		if (result.success) {
			await loadAddresses();
		} else {
			alert(`住所の削除に失敗しました: ${result.error}`);
		}
	}

	async function setDefaultAddress(addressId: string) {
		if (!user?.id) return;

		const result = await profileService.setDefaultAddress(addressId, user.id);
		if (result.success) {
			await loadAddresses();
		}
	}

	// ============ 收藏管理 ============
	async function removeFavorite(favoriteId: string) {
		const result = await profileService.removeFavorite(favoriteId);
		if (result.success) {
			await loadFavorites();
		}
	}

	async function clearAllFavorites() {
		if (!user?.id) return;
		if (!confirm('すべてのお気に入りを削除してもよろしいですか?')) return;

		const result = await profileService.clearFavorites(user.id);
		if (result.success) {
			await loadFavorites();
		}
	}

	// ============ 头像管理 ============
	function openAvatarModal() {
		showAvatarModal = true;
		avatarFile = null;
		avatarPreview = null;
	}

	function closeAvatarModal() {
		showAvatarModal = false;
		avatarFile = null;
		avatarPreview = null;
	}

	function handleAvatarSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			avatarFile = input.files[0];

			// 生成预览
			const reader = new FileReader();
			reader.onload = (e) => {
				avatarPreview = e.target?.result as string;
			};
			reader.readAsDataURL(avatarFile);
		}
	}

	async function uploadAvatar() {
		if (!user?.id || !avatarFile) return;

		const result = await profileService.updateAvatar(user.id, avatarFile);
		if (result.success) {
			// 更新用户 store
			await userStore.refresh();
			closeAvatarModal();
		} else {
			alert(`アバターのアップロードに失敗しました: ${result.error}`);
		}
	}

	// ============ 退款管理 ============

	// 判断订单是否可以退款
	function canRefund(order: Order): boolean {
		// pending(待处理) - 可以直接取消并退款
		// processing(处理中) - 可以申请退款
		// shipped(已发货) - 可以退货退款（需要退货单号）
		// delivered(已送达) - 可以退货退款（需要退货单号）
		// cancelled(已取消) - 不可退款
		return ['pending', 'processing', 'shipped', 'delivered'].includes(order.status);
	}

	// 判断是否需要退货单号
	function needsTrackingNumber(order: Order): boolean {
		// 已发货或已送达的订单需要填写退货单号
		return ['shipped', 'delivered'].includes(order.status);
	}

	// 获取退款类型文本
	function getRefundTypeText(order: Order): string {
		if (order.status === 'pending' || order.status === 'processing') {
			return '直接返金'; // 未发货，直接退款
		} else {
			return '返品返金'; // 已发货，需要退货
		}
	}

	// 打开退款模态框
	function openRefundModal(order: Order) {
		refundingOrder = order;
		refundForm = {
			refundType: 'full',
			refundReason: '',
			refundAmount: order.total_amount,
			returnGoods: needsTrackingNumber(order), // 已发货的订单自动设置为退货
			trackingNumber: ''
		};
		showRefundModal = true;
	}

	// 关闭退款模态框
	function closeRefundModal() {
		showRefundModal = false;
		refundingOrder = null;
		isRefunding = false;
	}

	// 更新退款金额
	function updateRefundAmount() {
		if (refundingOrder && refundForm.refundType === 'full') {
			refundForm.refundAmount = refundingOrder.total_amount;
		}
	}

	// 提交退款申请
	async function submitRefund() {
		if (!refundingOrder || !user?.id) return;

		// 验证退款理由
		if (!refundForm.refundReason) {
			alert('返金理由を選択してください');
			return;
		}

		// 验证退款金额
		if (refundForm.refundType === 'partial' && refundForm.refundAmount <= 0) {
			alert('返金金額を入力してください');
			return;
		}

		if (refundForm.refundAmount > refundingOrder.total_amount) {
			alert('返金金額が注文金額を超えています');
			return;
		}

		// 如果需要退货单号，验证是否填写
		if (needsTrackingNumber(refundingOrder) && refundForm.returnGoods && !refundForm.trackingNumber.trim()) {
			alert('返品追跡番号を入力してください');
			return;
		}

		// 确认退款
		const confirmMessage = needsTrackingNumber(refundingOrder)
			? `返品返金を申請しますか？\n金額: ¥${refundForm.refundAmount.toLocaleString('ja-JP')}\n追跡番号: ${refundForm.trackingNumber}`
			: `¥${refundForm.refundAmount.toLocaleString('ja-JP')} の返金を申請しますか？`;

		if (!confirm(confirmMessage)) {
			return;
		}

		isRefunding = true;

		try {
			// 生成唯一的退款ID
			const merchantRefundId = `REFUND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			let payload = {
				merchantRefundId: 'merchant_refund_id',
				paymentId: 'paypay_payment_id',
				amount: {
					amount: 1,
					currency: 'JPY',
				},
				reason: 'reason for refund',
			};
			// 调用退款 API（如果订单有 payment_id）
			if (refundingOrder.payment_id) {
				const refundResponse = await fetch('/api/paypay/refund', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						merchantRefundId: merchantRefundId,
						paymentId: refundingOrder.payment_id,
						amount: {
							amount: refundForm.refundAmount,
							currency: 'JPY'
						},
						reason: refundForm.refundReason,
						metadata: {
							orderId: refundingOrder.id,
							returnGoods: refundForm.returnGoods,
							trackingNumber: refundForm.trackingNumber
						}
					})
				});

				const refundResult = await refundResponse.json();

				if (!refundResult.success) {
					alert(`返金申請に失敗しました: ${refundResult.error}`);
					isRefunding = false;
					return;
				}
			}

			// 更新订单状态
			const newStatus = 'cancelled'; // 所有退款都设置为 cancelled 状态
			const statusResponse = await fetch(`/api/orders/${refundingOrder.id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					status: newStatus,
					trackingNumber: refundForm.trackingNumber || undefined
				})
			});

			const statusResult = await statusResponse.json();

			if (statusResult.success) {
				alert('返金申請が正常に送信されました');
				closeRefundModal();
				await loadOrders(); // 刷新订单列表
			} else {
				alert(`注文状態の更新に失敗しました: ${statusResult.error}`);
			}
		} catch (error) {
			console.error('Refund error:', error);
			alert('返金処理中にエラーが発生しました');
		} finally {
			isRefunding = false;
		}
	}

	// ============ 订单状态映射 ============
	function getStatusLabel(status: string): string {
		const statusMap: Record<string, string> = {
			pending: '処理待ち',
			processing: '処理中',
			shipped: '発送済み',
			delivered: '配送完了',
			cancelled: 'キャンセル済み'
		};
		return statusMap[status] || status;
	}

	function getStatusClass(status: string): string {
		const classMap: Record<string, string> = {
			pending: 'status-default',
			processing: 'status-info',
			shipped: 'status-info',
			delivered: 'status-success',
			cancelled: 'status-danger'
		};
		return classMap[status] || 'status-default';
	}

	// SVG 图标
	const icons = {
		profile: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
		orders: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`,
		addresses: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		favorites: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
		settings: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		support: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
		logout: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>`,
		edit: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
		add: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
		delete: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
		cart: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
		close: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
		arrow: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`,
		camera: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		refund: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>`,
		// 空状态图标
		emptyBox: `<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
		emptyLocation: `<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		emptyHeart: `<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`
	};

	// 导航菜单
	const menuItems = [
		{ id: 'profile', label: 'プロフィール', icon: icons.profile },
		{ id: 'orders', label: '注文履歴', icon: icons.orders },
		{ id: 'addresses', label: '住所管理', icon: icons.addresses },
		{ id: 'favorites', label: 'お気に入り', icon: icons.favorites },
		{ id: 'settings', label: '設定', icon: icons.settings }
	];

	// 导航切换
	function changeTab(itemId: string) {
		goto(`/profile/${itemId}`, {
			replaceState: false,
			noScroll: true,
			keepFocus: true
		});
	}

	// 组件挂载时加载数据
	onMount(() => {
		loadTabData();
	});
</script>

{#if !isLoggedIn}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-[#718096]">ログインしてください...</p>
	</div>
{:else if user}
	<div class="min-h-screen bg-[#f5f5f5] px-4 py-6 md:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl">
			<div class="flex flex-col gap-6 lg:flex-row">
				<!-- 左侧导航栏 -->
				<aside class="shrink-0 lg:w-64">
					<div class="sticky top-6 space-y-4">
						<!-- 用户信息卡片 -->
						<div class="rounded-lg border border-[#e0e0e0] bg-white p-5">
							<div class="mb-5 flex items-center gap-3">
								<div class="relative">
									<img
										src={user.avatar || '/logo.png'}
										alt={user.name}
										class="h-12 w-12 rounded-full border-2 border-[#e0e0e0] object-cover"
									/>
									<button
										onclick={openAvatarModal}
										class="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2d3748] text-white hover:bg-[#1a202c]"
										title="アバターを変更"
									>
										{@html icons.camera}
									</button>
								</div>
								<div class="flex-1 overflow-hidden">
									<h3 class="truncate font-semibold text-[#1a1a1a]">{user.name}</h3>
									<p class="truncate text-xs text-[#666]">{user.email}</p>
								</div>
							</div>

							<div class="rounded-md bg-[#2d3748] px-4 py-3 text-white">
								<div class="flex items-center justify-between">
									<div>
										<div class="text-xs text-[#a0aec0]">会員ランク</div>
										<div class="mt-0.5 text-sm font-semibold">
											{user.memberLevel || 'ゴールド会員'}
										</div>
									</div>
									<div class="text-right">
										<div class="text-xs text-[#a0aec0]">ポイント</div>
										<div class="mt-0.5 text-lg font-bold">
											{(user.points || 1250).toLocaleString('ja-JP')}
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- 导航菜单 -->
						<nav class="rounded-lg border border-[#e0e0e0] bg-white p-2">
							<div class="space-y-1">
								{#each menuItems as item}
									<button
										onclick={() => changeTab(item.id)}
										class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors
											{currentTab === item.id ? 'bg-[#2d3748] text-white' : 'text-[#4a5568] hover:bg-[#f7fafc]'}"
									>
										<span class="flex-shrink-0">{@html item.icon}</span>
										<span class="flex-1 text-left">{item.label}</span>
										{#if item.id === 'orders' && userStats.totalOrders > 0}
											<span class="rounded-full bg-[#718096] px-2 py-0.5 text-xs text-white">
												{userStats.totalOrders}
											</span>
										{/if}
										{#if item.id === 'favorites' && userStats.totalFavorites > 0}
											<span class="rounded-full bg-[#718096] px-2 py-0.5 text-xs text-white">
												{userStats.totalFavorites}
											</span>
										{/if}
									</button>
								{/each}
							</div>
						</nav>

						<!-- 底部快速链接 -->
						<div class="rounded-lg border border-[#e0e0e0] bg-white p-2">
							<a
								href="/support"
								class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#4a5568] no-underline transition-colors hover:bg-[#f7fafc]"
							>
								{@html icons.support}
								<span>サポート</span>
							</a>
							<button
								onclick={() => userStore.logout()}
								class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[#e53e3e] transition-colors hover:bg-[#fff5f5]"
							>
								{@html icons.logout}
								<span>ログアウト</span>
							</button>
						</div>
					</div>
				</aside>

				<!-- 右侧内容区域 -->
				<main class="flex-1">
					{#if isLoading}
						<div class="flex items-center justify-center py-12">
							<div class="text-[#718096]">読み込み中...</div>
						</div>
					{:else if currentTab === 'profile'}
						<!-- 个人资料 -->
						<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
							<div class="mb-6 flex items-center justify-between">
								<h2 class="text-xl font-semibold text-[#1a1a1a]">プロフィール</h2>
								<button class="btn-secondary">
									{@html icons.edit}
									<span>編集</span>
								</button>
							</div>

							<div class="space-y-6">
								<!-- 个人信息 -->
								<div class="grid gap-4 md:grid-cols-2">
									<div class="space-y-2">
										<label class="block text-sm font-medium text-[#4a5568]">お名前</label>
										<div class="input-display">{user.name}</div>
									</div>
									<div class="space-y-2">
										<label class="block text-sm font-medium text-[#4a5568]">メールアドレス</label>
										<div class="input-display">{user.email}</div>
									</div>
									<div class="space-y-2">
										<label class="block text-sm font-medium text-[#4a5568]">会員ランク</label>
										<div class="input-display flex items-center gap-2">
											<span class="rounded bg-[#2d3748] px-2 py-1 text-xs font-semibold text-white">
												{user.memberLevel || 'ゴールド会員'}
											</span>
											<span class="text-sm text-[#718096]">
												{(user.points || 1250).toLocaleString('ja-JP')} ポイント
											</span>
										</div>
									</div>
									<div class="space-y-2">
										<label class="block text-sm font-medium text-[#4a5568]">会員登録日</label>
										<div class="input-display">
											{new Date(user.created).toLocaleDateString('ja-JP')}
										</div>
									</div>
								</div>

								<!-- 统计数据 -->
								<div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
									<div class="stat-card">
										<div class="text-2xl font-bold text-[#1a1a1a]">{userStats.totalOrders}</div>
										<div class="text-sm text-[#718096]">総注文数</div>
									</div>
									<div class="stat-card">
										<div class="text-2xl font-bold text-[#1a1a1a]">{userStats.totalFavorites}</div>
										<div class="text-sm text-[#718096]">お気に入り</div>
									</div>
									<div class="stat-card">
										<div class="text-2xl font-bold text-[#1a1a1a]">{userStats.totalAddresses}</div>
										<div class="text-sm text-[#718096]">登録住所</div>
									</div>
									<div class="stat-card">
										<div class="text-2xl font-bold text-[#1a1a1a]">97%</div>
										<div class="text-sm text-[#718096]">配信成功率</div>
									</div>
								</div>
							</div>
						</div>
					{:else if currentTab === 'orders'}
						<!-- 订单历史 -->
						<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
							<h2 class="mb-6 text-xl font-semibold text-[#1a1a1a]">注文履歴</h2>

							{#if orders.length > 0}
								<div class="overflow-x-auto">
									<table class="w-full">
										<thead>
										<tr class="border-b border-[#e0e0e0]">
											<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
											>注文番号
											</th
											>
											<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
											>注文日
											</th
											>
											<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
											>商品数
											</th
											>
											<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
											>合計金額
											</th
											>
											<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
											>ステータス
											</th
											>
											<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
											>操作
											</th
											>
										</tr>
										</thead>
										<tbody>
										{#each orders as order}
											<tr class="border-b border-[#f0f0f0] transition-colors hover:bg-[#fafafa]">
												<td class="px-4 py-3">
													<div class="text-sm font-medium text-[#1a1a1a]">
														{order.order_number}
													</div>
												</td>
												<td class="px-4 py-3 text-sm text-[#718096]">
													{new Date(order.order_date).toLocaleDateString('ja-JP')}
												</td>
												<td class="px-4 py-3 text-sm text-[#718096]">{order.items_count}点</td>
												<td class="px-4 py-3">
													<div class="font-semibold text-[#1a1a1a]">
														¥{order.total_amount.toLocaleString('ja-JP')}
													</div>
												</td>
												<td class="px-4 py-3">
														<span class="status-badge {getStatusClass(order.status)}">
															{getStatusLabel(order.status)}
														</span>
												</td>
												<td class="px-4 py-3">
													<div class="flex gap-2">
														<button class="btn-link">詳細</button>
														{#if canRefund(order)}
															<button
																class="btn-link-danger"
																onclick={() => openRefundModal(order)}
															>
																{@html icons.refund}
																<span>{getRefundTypeText(order)}</span>
															</button>
														{/if}
													</div>
												</td>
											</tr>
										{/each}
										</tbody>
									</table>
								</div>
							{:else}
								<div class="py-12 text-center">
									<div class="mb-3 flex justify-center text-gray-300">
										{@html icons.emptyBox}
									</div>
									<p class="text-[#718096]">注文履歴がありません</p>
								</div>
							{/if}
						</div>
					{:else if currentTab === 'addresses'}
						<!-- 地址管理 -->
						<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
							<div class="mb-6 flex items-center justify-between">
								<h2 class="text-xl font-semibold text-[#1a1a1a]">住所管理</h2>
								<button class="btn-primary" onclick={() => openAddressModal()}>
									{@html icons.add}
									<span>新しい住所を追加</span>
								</button>
							</div>

							{#if addresses.length > 0}
								<div class="grid gap-4 md:grid-cols-2">
									{#each addresses as address}
										<div class="address-card">
											<div class="mb-4 flex items-start justify-between">
												<div class="flex items-center gap-2">
													<h3 class="font-semibold text-[#1a1a1a]">{address.label}</h3>
													{#if address.is_default}
														<span
															class="rounded bg-[#2d3748] px-2 py-0.5 text-xs font-medium text-white"
														>
															既定
														</span>
													{/if}
												</div>
												<div class="flex gap-1">
													<button class="icon-btn" onclick={() => openAddressModal(address)}>
														{@html icons.edit}
													</button>
													<button
														class="icon-btn text-[#e53e3e]"
														onclick={() => deleteAddress(address.id)}
													>
														{@html icons.delete}
													</button>
												</div>
											</div>
											<div class="space-y-1 text-sm text-[#4a5568]">
												<p class="font-medium text-[#1a1a1a]">{address.recipient}</p>
												<p>{address.phone}</p>
												<p>{address.postal_code}</p>
												<p class="leading-relaxed">{address.address}</p>
											</div>
											{#if !address.is_default}
												<button
													class="mt-3 w-full rounded-md border border-[#e0e0e0] px-3 py-1.5 text-xs text-[#4a5568] transition-colors hover:bg-[#f7fafc]"
													onclick={() => setDefaultAddress(address.id)}
												>
													既定に設定
												</button>
											{/if}
										</div>
									{/each}
								</div>
							{:else}
								<div class="py-12 text-center">
									<div class="mb-3 flex justify-center text-gray-300">
										{@html icons.emptyLocation}
									</div>
									<p class="text-[#718096]">登録された住所がありません</p>
								</div>
							{/if}
						</div>
					{:else if currentTab === 'favorites'}
						<!-- 收藏管理 -->
						<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
							<div class="mb-6 flex items-center justify-between">
								<h2 class="text-xl font-semibold text-[#1a1a1a]">お気に入り商品</h2>
								{#if favorites.length > 0}
									<button class="btn-secondary" onclick={clearAllFavorites}>
										{@html icons.delete}
										<span>すべて削除</span>
									</button>
								{/if}
							</div>

							{#if favorites.length > 0}
								<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
									{#each favorites as favorite}
										<div class="product-card">
											<img
												src={favorite.product_image || 'https://via.placeholder.com/200'}
												alt={favorite.product_name}
												class="mb-3 h-40 w-full rounded-md border border-[#e0e0e0] object-cover"
											/>
											<h3 class="mb-2 line-clamp-2 text-sm font-semibold text-[#1a1a1a]">
												{favorite.product_name}
											</h3>
											<div class="mb-3 text-lg font-bold text-[#1a1a1a]">
												¥{favorite.product_price.toLocaleString('ja-JP')}
											</div>
											<div class="flex gap-2">
												<button class="btn-primary flex-1">
													{@html icons.cart}
													<span>カートに入れる</span>
												</button>
												<button
													class="icon-btn text-[#e53e3e]"
													onclick={() => removeFavorite(favorite.id)}
												>
													{@html icons.close}
												</button>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="py-12 text-center">
									<div class="mb-3 flex justify-center text-gray-300">
										{@html icons.emptyHeart}
									</div>
									<p class="text-[#718096]">お気に入り商品がありません</p>
								</div>
							{/if}
						</div>
					{:else if currentTab === 'settings'}
						<!-- 设置 -->
						<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
							<h2 class="mb-6 text-xl font-semibold text-[#1a1a1a]">設定</h2>

							<div class="space-y-6">
								<!-- 通知设置 -->
								<div class="border-b border-[#e0e0e0] pb-6">
									<h3 class="mb-4 text-sm font-semibold text-[#1a1a1a]">通知設定</h3>
									<div class="space-y-2">
										<label class="setting-item">
											<span class="text-sm text-[#4a5568]">メール通知</span>
											<input type="checkbox" class="toggle" checked />
										</label>
										<label class="setting-item">
											<span class="text-sm text-[#4a5568]">SMS通知</span>
											<input type="checkbox" class="toggle" />
										</label>
										<label class="setting-item">
											<span class="text-sm text-[#4a5568]">新商品の通知</span>
											<input type="checkbox" class="toggle" checked />
										</label>
									</div>
								</div>

								<!-- プライバシー -->
								<div class="border-b border-[#e0e0e0] pb-6">
									<h3 class="mb-4 text-sm font-semibold text-[#1a1a1a]">プライバシー設定</h3>
									<div class="space-y-2">
										<button class="setting-btn">
											<span>パスワードを変更</span>
											{@html icons.arrow}
										</button>
										<button class="setting-btn">
											<span>2段階認証を設定</span>
											{@html icons.arrow}
										</button>
									</div>
								</div>

								<!-- データ管理 -->
								<div>
									<h3 class="mb-4 text-sm font-semibold text-[#1a1a1a]">データ管理</h3>
									<div class="space-y-2">
										<button class="setting-btn">
											<span>ダウンロードデータ</span>
											{@html icons.arrow}
										</button>
										<button class="setting-btn text-[#e53e3e] hover:bg-[#fff5f5]">
											<span>アカウントを削除</span>
											{@html icons.arrow}
										</button>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</main>
			</div>
		</div>
	</div>

	<!-- 地址编辑模态框 -->
	{#if showAddressModal}
		<div class="modal-overlay" onclick={closeAddressModal}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-semibold text-[#1a1a1a]">
						{editingAddress ? '住所を編集' : '新しい住所を追加'}
					</h3>
					<button class="icon-btn" onclick={closeAddressModal}>
						{@html icons.close}
					</button>
				</div>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						saveAddress();
					}}
					class="space-y-4"
				>
					<div>
						<label class="mb-1 block text-sm font-medium text-[#4a5568]">ラベル</label>
						<input
							type="text"
							bind:value={addressForm.label}
							placeholder="例: 自宅、会社"
							class="input-field"
							required
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-[#4a5568]">受取人</label>
						<input
							type="text"
							bind:value={addressForm.recipient}
							placeholder="山田 太郎"
							class="input-field"
							required
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-[#4a5568]">電話番号</label>
						<input
							type="tel"
							bind:value={addressForm.phone}
							placeholder="080-1234-5678"
							class="input-field"
							required
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-[#4a5568]">郵便番号</label>
						<input
							type="text"
							bind:value={addressForm.postal_code}
							placeholder="〒150-0001"
							class="input-field"
							required
						/>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-[#4a5568]">住所</label>
						<textarea
							bind:value={addressForm.address}
							placeholder="東京都渋谷区神宮前1-1-1"
							class="input-field"
							rows="3"
							required
						></textarea>
					</div>

					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={addressForm.is_default} class="checkbox" />
						<span class="text-sm text-[#4a5568]">既定の住所として設定</span>
					</label>

					<div class="flex gap-3 pt-2">
						<button type="button" class="btn-secondary flex-1" onclick={closeAddressModal}>
							キャンセル
						</button>
						<button type="submit" class="btn-primary flex-1">保存</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- 头像上传模态框 -->
	{#if showAvatarModal}
		<div class="modal-overlay" onclick={closeAvatarModal}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-semibold text-[#1a1a1a]">アバターを変更</h3>
					<button class="icon-btn" onclick={closeAvatarModal}>
						{@html icons.close}
					</button>
				</div>

				<div class="space-y-4">
					<!-- 预览区域 -->
					<div class="flex justify-center">
						<img
							src={avatarPreview || user.avatar || '/logo.png'}
							alt="プレビュー"
							class="h-32 w-32 rounded-full border-2 border-[#e0e0e0] object-cover"
						/>
					</div>

					<!-- 文件选择 -->
					<div>
						<label
							class="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#cbd5e0] bg-[#f7fafc] px-4 py-8 transition-colors hover:border-[#2d3748] hover:bg-[#edf2f7]"
						>
							{@html icons.camera}
							<span class="text-sm text-[#4a5568]">
								{avatarFile ? avatarFile.name : 'クリックして画像を選択'}
							</span>
							<input
								type="file"
								accept="image/jpeg,image/png,image/gif,image/webp"
								onchange={handleAvatarSelect}
								class="hidden"
							/>
						</label>
						<p class="mt-2 text-xs text-[#718096]">JPG、PNG、GIF、WebP形式、最大5MB</p>
					</div>

					<!-- 操作按钮 -->
					<div class="flex gap-3">
						<button type="button" class="btn-secondary flex-1" onclick={closeAvatarModal}>
							キャンセル
						</button>
						<button
							type="button"
							class="btn-primary flex-1"
							onclick={uploadAvatar}
							disabled={!avatarFile}
						>
							アップロード
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- 退款模态框 -->
	{#if showRefundModal && refundingOrder}
		<div class="modal-overlay" onclick={closeRefundModal}>
			<div class="modal-content max-w-md" onclick={(e) => e.stopPropagation()}>
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-semibold text-[#1a1a1a]">返金申請</h3>
					<button class="icon-btn" onclick={closeRefundModal} disabled={isRefunding}>
						{@html icons.close}
					</button>
				</div>

				<!-- 订单信息 -->
				<div class="mb-4 rounded-lg bg-[#f7fafc] p-4">
					<div class="mb-3 flex items-center justify-between">
						<span class="text-sm text-[#718096]">注文番号</span>
						<span class="font-medium text-[#1a1a1a]">{refundingOrder.order_number}</span>
					</div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-sm text-[#718096]">注文金額</span>
						<span class="text-lg font-bold text-[#1a1a1a]">
							¥{refundingOrder.total_amount.toLocaleString('ja-JP')}
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-[#718096]">返金タイプ</span>
						<span class="rounded bg-[#2d3748] px-2 py-1 text-xs font-semibold text-white">
							{getRefundTypeText(refundingOrder)}
						</span>
					</div>
				</div>

				<form onsubmit={(e) => { e.preventDefault(); submitRefund(); }} class="space-y-4">
					<!-- 退款类型 -->
					<div>
						<label class="mb-2 block text-sm font-medium text-[#4a5568]">返金金額</label>
						<div class="flex gap-3">
							<label class="refund-type-option flex-1">
								<input
									type="radio"
									bind:group={refundForm.refundType}
									value="full"
									onchange={updateRefundAmount}
									disabled={isRefunding}
									class="sr-only"
								/>
								<div class="option-content">
									<div class="font-medium">全額返金</div>
									<div class="text-xs text-[#718096]">全額返金</div>
								</div>
							</label>
							<label class="refund-type-option flex-1">
								<input
									type="radio"
									bind:group={refundForm.refundType}
									value="partial"
									disabled={isRefunding}
									class="sr-only"
								/>
								<div class="option-content">
									<div class="font-medium">一部返金</div>
									<div class="text-xs text-[#718096]">金額を指定</div>
								</div>
							</label>
						</div>
					</div>

					<!-- 退款金额（部分退款时显示） -->
					{#if refundForm.refundType === 'partial'}
						<div>
							<label class="mb-1 block text-sm font-medium text-[#4a5568]">
								返金金額
							</label>
							<div class="relative">
								<span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]">¥</span>
								<input
									type="number"
									bind:value={refundForm.refundAmount}
									min="1"
									max={refundingOrder.total_amount}
									disabled={isRefunding}
									class="input-field pl-8"
									placeholder="金額を入力"
									required
								/>
							</div>
							<p class="mt-1 text-xs text-[#718096]">
								最大: ¥{refundingOrder.total_amount.toLocaleString('ja-JP')}
							</p>
						</div>
					{/if}

					<!-- 退款理由 -->
					<div>
						<label class="mb-2 block text-sm font-medium text-[#4a5568]">
							返金理由 <span class="text-[#e53e3e]">*</span>
						</label>
						<div class="space-y-2">
							{#each refundReasons as reason}
								<label class="refund-reason-option">
									<input
										type="radio"
										bind:group={refundForm.refundReason}
										value={reason}
										disabled={isRefunding}
										class="sr-only"
									/>
									<div class="option-content">
										<span class="text-sm">{reason}</span>
									</div>
								</label>
							{/each}
						</div>
					</div>

					<!-- 退货单号（已发货/已送达时显示） -->
					{#if needsTrackingNumber(refundingOrder)}
						<div class="rounded-lg border-2 border-[#fbbf24] bg-[#fffbeb] p-4">
							<div class="mb-3 flex items-start gap-2">
								<svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#f59e0b]" fill="none" stroke="currentColor"
										 viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
								<div class="flex-1">
									<h4 class="mb-1 font-semibold text-[#92400e]">返品が必要です</h4>
									<p class="text-xs text-[#78350f]">
										商品が既に発送されているため、返品追跡番号の入力が必要です。
									</p>
								</div>
							</div>

							<div>
								<label class="mb-1 block text-sm font-medium text-[#92400e]">
									返品追跡番号 <span class="text-[#e53e3e]">*</span>
								</label>
								<input
									type="text"
									bind:value={refundForm.trackingNumber}
									placeholder="例: 1234-5678-9012"
									disabled={isRefunding}
									class="input-field"
									required
								/>
								<p class="mt-1 text-xs text-[#78350f]">
									配送業者から受け取った追跡番号を入力してください
								</p>
							</div>
						</div>
					{/if}

					<!-- 是否退货（未发货时显示） -->
					{#if !needsTrackingNumber(refundingOrder)}
						<div class="rounded-lg border border-[#e2e8f0] bg-[#f7fafc] p-4">
							<label class="flex items-start gap-3">
								<input
									type="checkbox"
									bind:checked={refundForm.returnGoods}
									disabled={isRefunding}
									class="checkbox mt-0.5"
								/>
								<div class="flex-1">
									<div class="font-medium text-[#1a1a1a]">商品を返品する</div>
									<p class="mt-1 text-xs text-[#718096]">
										商品を返品する場合は、チェックしてください。商品がまだ発送されていないため、直接返金されます。
									</p>
								</div>
							</label>
						</div>
					{/if}

					<!-- 操作按钮 -->
					<div class="flex gap-3 pt-2">
						<button
							type="button"
							class="btn-secondary flex-1"
							onclick={closeRefundModal}
							disabled={isRefunding}
						>
							キャンセル
						</button>
						<button
							type="submit"
							class="btn-primary flex-1"
							disabled={isRefunding}
						>
							{#if isRefunding}
								<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								処理中...
							{:else}
								返金申請を送信
							{/if}
						</button>
					</div>
				</form>

				<!-- 注意事项 -->
				<div class="mt-4 rounded-lg bg-[#fffaf0] p-3">
					<div class="flex items-start gap-2">
						<svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c05621]" fill="none" stroke="currentColor"
								 viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p class="text-xs text-[#744210]">
							返金申請後、2-5営業日以内に処理されます。返金は元の支払い方法に戻されます。
							{#if needsTrackingNumber(refundingOrder)}
								返品された商品が確認された後、返金が処理されます。
							{/if}
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
    /* 按钮样式 */
    .btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: white;
        background-color: #2d3748;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
        background-color: #1a202c;
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #4a5568;
        background-color: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-secondary:hover {
        background-color: #edf2f7;
        border-color: #cbd5e0;
    }

    .btn-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #4a5568;
        background-color: transparent;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-link:hover {
        background-color: #f7fafc;
        border-color: #cbd5e0;
    }

    .btn-link-danger {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #e53e3e;
        background-color: transparent;
        border: 1px solid #fc8181;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-link-danger:hover {
        background-color: #fff5f5;
        border-color: #e53e3e;
    }

    .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        color: #718096;
        background-color: transparent;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .icon-btn:hover:not(:disabled) {
        background-color: #f7fafc;
    }

    .icon-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* 输入框样式 */
    .input-display {
        padding: 0.625rem 0.75rem;
        font-size: 0.875rem;
        color: #1a1a1a;
        background-color: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
    }

    .input-field {
        width: 100%;
        padding: 0.625rem 0.75rem;
        font-size: 0.875rem;
        color: #1a1a1a;
        background-color: white;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        transition: border-color 0.2s;
    }

    .input-field:focus {
        outline: none;
        border-color: #2d3748;
    }

    .input-field:disabled {
        background-color: #f7fafc;
        cursor: not-allowed;
        opacity: 0.6;
    }

    .checkbox {
        width: 1rem;
        height: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .checkbox:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    /* 统计卡片 */
    .stat-card {
        padding: 1rem;
        background-color: #fafafa;
        border: 1px solid #e0e0e0;
        border-radius: 0.5rem;
    }

    /* 状态徽章 */
    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 9999px;
    }

    .status-success {
        color: #22543d;
        background-color: #c6f6d5;
    }

    .status-info {
        color: #2c5282;
        background-color: #bee3f8;
    }

    .status-default {
        color: #4a5568;
        background-color: #edf2f7;
    }

    .status-danger {
        color: #742a2a;
        background-color: #fed7d7;
    }

    /* 地址卡片 */
    .address-card {
        padding: 1.25rem;
        border: 1px solid #e0e0e0;
        border-radius: 0.5rem;
        transition: border-color 0.2s;
    }

    .address-card:hover {
        border-color: #cbd5e0;
    }

    /* 商品卡片 */
    .product-card {
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 0.5rem;
        transition: box-shadow 0.2s;
    }

    .product-card:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    /* 设置项 */
    .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background-color: #fafafa;
        border: 1px solid #e0e0e0;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .setting-item:hover {
        background-color: #f0f0f0;
    }

    .setting-btn {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: #4a5568;
        text-align: left;
        background-color: #fafafa;
        border: 1px solid #e0e0e0;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .setting-btn:hover {
        background-color: #f0f0f0;
    }

    /* 开关样式 */
    .toggle {
        position: relative;
        width: 44px;
        height: 24px;
        -webkit-appearance: none;
        background: #cbd5e0;
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .toggle:checked {
        background: #2d3748;
    }

    .toggle:before {
        content: '';
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        top: 3px;
        left: 3px;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s;
    }

    .toggle:checked:before {
        transform: translateX(20px);
    }

    /* 模态框样式 */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 50;
    }

    .modal-content {
        background-color: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-content.max-w-md {
        max-width: 28rem;
    }

    /* 退款选项卡片 */
    .refund-type-option {
        cursor: pointer;
    }

    .refund-type-option input:checked + .option-content {
        background-color: #2d3748;
        color: white;
        border-color: #2d3748;
    }

    .refund-type-option input:disabled + .option-content {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .option-content {
        padding: 0.75rem;
        text-align: center;
        border: 2px solid #e2e8f0;
        border-radius: 0.5rem;
        transition: all 0.2s;
    }

    .option-content:hover {
        border-color: #cbd5e0;
    }

    /* 退款理由选项 */
    .refund-reason-option {
        display: block;
        cursor: pointer;
    }

    .refund-reason-option input:checked + .option-content {
        background-color: #edf2f7;
        border-color: #2d3748;
    }

    .refund-reason-option input:disabled + .option-content {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .refund-reason-option .option-content {
        padding: 0.75rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        transition: all 0.2s;
    }

    .refund-reason-option .option-content:hover {
        background-color: #f7fafc;
        border-color: #cbd5e0;
    }

    /* 隐藏单选按钮 */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }

    /* 文字截断 */
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
    }

    /* 加载动画 */
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    a {
        text-decoration: none;
    }

    /* SVG 图标大小 */
    :global(.w-5) {
        width: 1.25rem;
    }

    :global(.h-5) {
        height: 1.25rem;
    }

    :global(.w-4) {
        width: 1rem;
    }

    :global(.h-4) {
        height: 1rem;
    }

    :global(.w-16) {
        width: 4rem;
    }

    :global(.h-16) {
        height: 4rem;
    }
</style>