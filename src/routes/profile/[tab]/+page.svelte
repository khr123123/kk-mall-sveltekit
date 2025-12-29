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
	import { onMount, untrack } from 'svelte';
	import {
		spinnerSm,
		infoIcon,
		warningIcon,
		camera,
		profile,
		orders as aordersIcon,
		addresses as addressesIcon,
		favorites as favoritesIcon,
		settings,
		support,
		logout,
		editProfile,
		addrPofile,
		deleteProfile,
		cart,
		arrow,
		close,
		refund,
		emptyBox,
		emptyLocation,
		emptyHeart,
		checkCircle,
		cancelIcon
	} from '$lib/icons/svgs';
	import { pb } from '$lib/services/PBConfig';

	// 响应式监听路由变化
	let currentTab = $state('profile');
	let isLoading = $state(true);

	// ============ 数据缓存和加载状态 ============
	let dataCache = $state<Record<string, any>>({
		profile: null,
		orders: null,
		addresses: null,
		favorites: null
	});
	let loadingTabs = $state<Record<string, boolean>>({});

	// 优化的 effect，避免多次触发
	$effect(() => {
		const newTab = $page.params.tab ?? 'profile';

		// 只有当 tab 真正改变时才更新
		if (currentTab !== newTab) {
			currentTab = newTab;
			// 使用 untrack 避免触发其他 effect
			untrack(() => {
				loadTabData();
			});
		}
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
		refundType: 'full',
		refundReason: '',
		refundAmount: 0,
		returnGoods: false,
		trackingNumber: ''
	});
	let isRefunding = $state(false);

	const refundReasons = [
		'商品不符合描述',
		'商品質量問題',
		'誤って注文した',
		'サイズが合わない',
		'配送遅延',
		'その他'
	];

	// ============ 自定义确认对话框状态 ============
	let showConfirmDialog = $state(false);
	let confirmDialogData = $state({
		title: '',
		message: '',
		type: 'warning' as 'warning' | 'danger' | 'info',
		confirmText: '確認',
		cancelText: 'キャンセル',
		onConfirm: () => {},
		onCancel: () => {}
	});

	// ============ 自定义提示对话框状态 ============
	let showAlertDialog = $state(false);
	let alertDialogData = $state({
		title: '',
		message: '',
		type: 'error' as 'error' | 'success' | 'info'
	});

	// ============ 自定义对话框函数 ============
	function showConfirm(options: {
		title: string;
		message: string;
		type?: 'warning' | 'danger' | 'info';
		confirmText?: string;
		cancelText?: string;
	}): Promise<boolean> {
		return new Promise((resolve) => {
			confirmDialogData = {
				title: options.title,
				message: options.message,
				type: options.type || 'warning',
				confirmText: options.confirmText || '確認',
				cancelText: options.cancelText || 'キャンセル',
				onConfirm: () => {
					showConfirmDialog = false;
					resolve(true);
				},
				onCancel: () => {
					showConfirmDialog = false;
					resolve(false);
				}
			};
			showConfirmDialog = true;
		});
	}

	function showAlert(options: {
		title: string;
		message: string;
		type?: 'error' | 'success' | 'info';
	}) {
		alertDialogData = {
			title: options.title,
			message: options.message,
			type: options.type || 'error'
		};
		showAlertDialog = true;
	}

	function closeAlertDialog() {
		showAlertDialog = false;
	}

	// ============ 优化的数据加载函数 ============
	async function loadTabData() {
		if (!user?.id) return;

		// 防止并发加载
		if (loadingTabs[currentTab]) {
			console.log(`Tab ${currentTab} is already loading, skipping...`);
			return;
		}

		// 如果数据已缓存，直接使用
		if (dataCache[currentTab]) {
			console.log(`Using cached data for tab: ${currentTab}`);
			restoreFromCache(currentTab);
			return;
		}

		loadingTabs[currentTab] = true;
		isLoading = true;

		try {
			console.log(`Loading data for tab: ${currentTab}`);

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
			loadingTabs[currentTab] = false;
		}
	}

	// 从缓存恢复数据
	function restoreFromCache(tab: string) {
		const cached = dataCache[tab];
		if (!cached) return;

		switch (tab) {
			case 'profile':
				userStats = cached;
				break;
			case 'orders':
				orders = cached;
				break;
			case 'addresses':
				addresses = cached;
				break;
			case 'favorites':
				favorites = cached;
				break;
		}

		isLoading = false;
	}

	// 加载用户统计
	async function loadUserStats() {
		if (!user?.id) return;
		const result = await profileService.getUserStats(user.id);
		if (result.success) {
			userStats = result.stats!;
			dataCache.profile = userStats;
		}
	}

	// 加载订单
	async function loadOrders() {
		if (!user?.id) return;
		const result = await profileService.getOrders(user.id);
		if (result.success) {
			orders = (result.orders as unknown as Order[]) || [];
			dataCache.orders = orders;
		}
	}

	// 加载地址
	async function loadAddresses() {
		if (!user?.id) return;
		const result = await profileService.getAddresses(user.id);
		if (result.success) {
			addresses = (result.addresses as unknown as Address[]) || [];
			dataCache.addresses = addresses;
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
			dataCache.favorites = favorites;
		}
	}

	// 清除缓存的辅助函数
	function clearCache(tab: string) {
		dataCache[tab] = null;
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
			clearCache('addresses');
			await loadAddresses();
			closeAddressModal();
		} else {
			showAlert({
				title: 'エラー',
				message: `住所の${editingAddress ? '更新' : '作成'}に失敗しました: ${result.error}`,
				type: 'error'
			});
		}
	}

	async function deleteAddress(addressId: string) {
		const confirmed = await showConfirm({
			title: '確認',
			message: 'この住所を削除してもよろしいですか?',
			type: 'danger',
			confirmText: '削除',
			cancelText: 'キャンセル'
		});

		if (!confirmed) return;

		const result = await profileService.deleteAddress(addressId);
		if (result.success) {
			clearCache('addresses');
			await loadAddresses();
		} else {
			showAlert({
				title: 'エラー',
				message: `住所の削除に失敗しました: ${result.error}`,
				type: 'error'
			});
		}
	}

	async function setDefaultAddress(addressId: string) {
		if (!user?.id) return;

		const result = await profileService.setDefaultAddress(addressId, user.id);
		if (result.success) {
			clearCache('addresses');
			await loadAddresses();
		}
	}

	// ============ 收藏管理 ============
	async function removeFavorite(favoriteId: string) {
		const result = await profileService.removeFavorite(favoriteId);
		if (result.success) {
			clearCache('favorites');
			await loadFavorites();
		}
	}

	async function clearAllFavorites() {
		if (!user?.id) return;

		const confirmed = await showConfirm({
			title: '確認',
			message: 'すべてのお気に入りを削除してもよろしいですか?',
			type: 'warning',
			confirmText: '削除',
			cancelText: 'キャンセル'
		});

		if (!confirmed) return;

		const result = await profileService.clearFavorites(user.id);
		if (result.success) {
			clearCache('favorites');
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
			await userStore.refresh();
			closeAvatarModal();
		} else {
			showAlert({
				title: 'エラー',
				message: `アバターのアップロードに失敗しました: ${result.error}`,
				type: 'error'
			});
		}
	}

	// ============ 退款管理 ============
	function canRefund(order: Order): boolean {
		return ['pending', 'processing', 'shipped', 'delivered'].includes(order.status);
	}

	function needsTrackingNumber(order: Order): boolean {
		return ['shipped', 'delivered'].includes(order.status);
	}

	function getRefundTypeText(order: Order): string {
		if (order.status === 'pending' || order.status === 'processing') {
			return '直接返金';
		} else {
			return '返品返金';
		}
	}

	function openRefundModal(order: Order) {
		refundingOrder = order;
		refundForm = {
			refundType: 'full',
			refundReason: '',
			refundAmount: order.total_amount,
			returnGoods: needsTrackingNumber(order),
			trackingNumber: ''
		};
		showRefundModal = true;
	}

	function closeRefundModal() {
		showRefundModal = false;
		refundingOrder = null;
		isRefunding = false;
	}

	function updateRefundAmount() {
		if (refundingOrder && refundForm.refundType === 'full') {
			refundForm.refundAmount = refundingOrder.total_amount;
		}
	}

	async function submitRefund() {
		if (!refundingOrder || !user?.id) return;

		if (!refundForm.refundReason) {
			showAlert({
				title: '入力エラー',
				message: '返金理由を選択してください',
				type: 'error'
			});
			return;
		}

		if (refundForm.refundType === 'partial' && refundForm.refundAmount <= 0) {
			showAlert({
				title: '入力エラー',
				message: '返金金額を入力してください',
				type: 'error'
			});
			return;
		}

		if (refundForm.refundAmount > refundingOrder.total_amount) {
			showAlert({
				title: '入力エラー',
				message: '返金金額が注文金額を超えています',
				type: 'error'
			});
			return;
		}

		if (
			needsTrackingNumber(refundingOrder) &&
			refundForm.returnGoods &&
			!refundForm.trackingNumber.trim()
		) {
			showAlert({
				title: '入力エラー',
				message: '返品追跡番号を入力してください',
				type: 'error'
			});
			return;
		}

		const confirmMessage = needsTrackingNumber(refundingOrder)
			? `返品返金を申請しますか？\n金額: ¥${refundForm.refundAmount.toLocaleString('ja-JP')}\n追跡番号: ${refundForm.trackingNumber}`
			: `¥${refundForm.refundAmount.toLocaleString('ja-JP')} の返金を申請しますか？`;

		const confirmed = await showConfirm({
			title: '返金申請の確認',
			message: confirmMessage,
			type: 'warning',
			confirmText: '申請する',
			cancelText: 'キャンセル'
		});

		if (!confirmed) return;

		isRefunding = true;

		try {
			const needPayPalRefund =
				refundingOrder.payment_id &&
				refundingOrder.status !== 'pending' &&
				refundingOrder.payment_method === 'paypay';

			const merchantRefundId = `REFUND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			if (needPayPalRefund) {
				const refundResponse = await fetch('/api/paypay/refund', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						merchantRefundId: merchantRefundId,
						paymentId: refundingOrder.payment_id,
						amount: refundingOrder.amount,
						reason: refundForm.refundReason
					})
				});
				const refundResult = await refundResponse.json();
				if (!refundResult.success) {
					showAlert({
						title: 'エラー',
						message: `返金申請に失敗しました: ${refundResult.error}`,
						type: 'error'
					});
					isRefunding = false;
					return;
				}
			}

			const statusResponse = await fetch(`/api/paypay/refundStatus/${merchantRefundId}`);
			const statusResult = await statusResponse.json();

			if (statusResult.success) {
				await pb.collection('orders').update(refundingOrder.id, {
					status: 'cancelled'
				});
				showAlert({
					title: '成功',
					message: needPayPalRefund ? '返金申請が正常に送信されました' : '注文をキャンセルしました',
					type: 'success'
				});
				closeRefundModal();
				clearCache('orders');
				await loadOrders();
			} else {
				showAlert({
					title: 'エラー',
					message: `注文状態の更新に失敗しました: ${statusResult.error}`,
					type: 'error'
				});
			}
		} catch (error) {
			console.error('Refund error:', error);
			showAlert({
				title: 'エラー',
				message: '返金処理中にエラーが発生しました',
				type: 'error'
			});
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

	const menuItems = [
		{ id: 'profile', label: 'プロフィール', icon: profile },
		{ id: 'orders', label: '注文履歴', icon: aordersIcon },
		{ id: 'addresses', label: '住所管理', icon: addressesIcon },
		{ id: 'favorites', label: 'お気に入り', icon: favoritesIcon },
		{ id: 'settings', label: '設定', icon: settings }
	];

	function changeTab(itemId: string) {
		goto(`/profile/${itemId}`, {
			replaceState: false,
			noScroll: true,
			keepFocus: true
		});
	}

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
										{@html camera}
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
								{@html support}
								<span>サポート</span>
							</a>
							<button
								onclick={() => userStore.logout()}
								class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[#e53e3e] transition-colors hover:bg-[#fff5f5]"
							>
								{@html logout}
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
									{@html editProfile}
									<span>編集</span>
								</button>
							</div>

							<div class="space-y-6">
								<!-- 个人信息 -->
								<div class="grid gap-4 md:grid-cols-2">
									<div class="space-y-2">
										<!-- svelte-ignore a11y_label_has_associated_control -->
										<label class="block text-sm font-medium text-[#4a5568]">お名前</label>
										<div class="input-display">{user.name}</div>
									</div>
									<div class="space-y-2">
										<!-- svelte-ignore a11y_label_has_associated_control -->
										<label class="block text-sm font-medium text-[#4a5568]">メールアドレス</label>
										<div class="input-display">{user.email}</div>
									</div>
									<!-- svelte-ignore a11y_label_has_associated_control -->
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
										<!-- svelte-ignore a11y_label_has_associated_control -->
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
												</th>
												<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
													>注文日
												</th>
												<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
													>商品数
												</th>
												<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
													>合計金額
												</th>
												<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
													>ステータス
												</th>
												<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
													>操作
												</th>
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
																	{@html refund}
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
										{@html emptyBox}
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
									{@html addrPofile}
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
														{@html editProfile}
													</button>
													<button
														class="icon-btn text-[#e53e3e]"
														onclick={() => deleteAddress(address.id)}
													>
														{@html deleteProfile}
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
										{@html emptyLocation}
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
										{@html deleteProfile}
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
													{@html cart}
													<span>カートに入れる</span>
												</button>
												<button
													class="icon-btn text-[#e53e3e]"
													onclick={() => removeFavorite(favorite.id)}
												>
													{@html close}
												</button>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="py-12 text-center">
									<div class="mb-3 flex justify-center text-gray-300">
										{@html emptyHeart}
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
											{@html arrow}
										</button>
										<button class="setting-btn">
											<span>2段階認証を設定</span>
											{@html arrow}
										</button>
									</div>
								</div>

								<!-- データ管理 -->
								<div>
									<h3 class="mb-4 text-sm font-semibold text-[#1a1a1a]">データ管理</h3>
									<div class="space-y-2">
										<button class="setting-btn">
											<span>ダウンロードデータ</span>
											{@html arrow}
										</button>
										<button class="setting-btn text-[#e53e3e] hover:bg-[#fff5f5]">
											<span>アカウントを削除</span>
											{@html arrow}
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
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	{#if showAddressModal}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={closeAddressModal}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-semibold text-[#1a1a1a]">
						{editingAddress ? '住所を編集' : '新しい住所を追加'}
					</h3>
					<button class="icon-btn" onclick={closeAddressModal}>
						{@html close}
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
						<!-- svelte-ignore a11y_label_has_associated_control -->
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
						<!-- svelte-ignore a11y_label_has_associated_control -->
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
						<!-- svelte-ignore a11y_label_has_associated_control -->
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
						<!-- svelte-ignore a11y_label_has_associated_control -->
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
						<!-- svelte-ignore a11y_label_has_associated_control -->
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
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	{#if showAvatarModal}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={closeAvatarModal}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-semibold text-[#1a1a1a]">アバターを変更</h3>
					<button class="icon-btn" onclick={closeAvatarModal}>
						{@html close}
					</button>
				</div>

				<div class="space-y-4">
					<div class="flex justify-center">
						<img
							src={avatarPreview || user.avatar || '/logo.png'}
							alt="プレビュー"
							class="h-32 w-32 rounded-full border-2 border-[#e0e0e0] object-cover"
						/>
					</div>

					<div>
						<label
							class="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#cbd5e0] bg-[#f7fafc] px-4 py-8 transition-colors hover:border-[#2d3748] hover:bg-[#edf2f7]"
						>
							{@html camera}
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

	<!-- ✨ 优化后的退款模态框 -->
	{#if showRefundModal && refundingOrder}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="refund-modal-overlay" onclick={closeRefundModal}>
			<div class="refund-modal-content" onclick={(e) => e.stopPropagation()}>
				<!-- 头部 -->
				<div class="refund-modal-header">
					<div class="flex items-center gap-3">
						<div class="refund-icon-wrapper">
							{@html refund}
						</div>
						<div>
							<h3 class="text-xl font-bold text-[#1a1a1a]">返金申請</h3>
							<p class="text-xs text-[#718096]">以下の内容をご確認ください</p>
						</div>
					</div>
					<button class="icon-btn" onclick={closeRefundModal} disabled={isRefunding}>
						{@html close}
					</button>
				</div>

				<!-- 订单信息卡片 -->
				<div class="refund-order-info">
					<div class="order-info-header">
						<span class="text-xs font-semibold tracking-wide text-[#718096] uppercase"
							>注文情報</span
						>
						<span class="status-badge {getStatusClass(refundingOrder.status)}">
							{getStatusLabel(refundingOrder.status)}
						</span>
					</div>

					<div class="order-info-details">
						<div class="order-info-row">
							<span class="text-sm">注文番号</span>
							<span class="font-mono text-sm font-semibold">
								{refundingOrder.order_number}
							</span>
						</div>
						<div class="order-info-row">
							<span class="text-sm">注文金額</span>
							<span class="text-2xl font-bold">
								¥{refundingOrder.total_amount.toLocaleString('ja-JP')}
							</span>
						</div>
						<div class="order-info-row">
							<span class="text-sm">返金タイプ</span>
							<span class="refund-type-badge">
								{getRefundTypeText(refundingOrder)}
							</span>
						</div>
					</div>
				</div>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						submitRefund();
					}}
					class="refund-form"
				>
					<!-- 退款类型选择 -->
					<div class="form-section">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="form-label">返金金額</label>
						<div class="refund-type-grid">
							<label class="refund-type-card {refundForm.refundType === 'full' ? 'active' : ''}">
								<input
									type="radio"
									bind:group={refundForm.refundType}
									value="full"
									onchange={updateRefundAmount}
									disabled={isRefunding}
									class="sr-only"
								/>
								<div class="refund-type-content">
									<div class="refund-type-title">全額返金</div>
									<div class="refund-type-desc">全額を返金します</div>
								</div>
								<div class="refund-type-check">
									{@html checkCircle}
								</div>
							</label>

							<label class="refund-type-card {refundForm.refundType === 'partial' ? 'active' : ''}">
								<input
									type="radio"
									bind:group={refundForm.refundType}
									value="partial"
									disabled={isRefunding}
									class="sr-only"
								/>
								<div class="refund-type-content">
									<div class="refund-type-title">一部返金</div>
									<div class="refund-type-desc">金額を指定します</div>
								</div>
								<div class="refund-type-check">
									{@html checkCircle}
								</div>
							</label>
						</div>
					</div>

					<!-- 部分退款金额输入 -->
					{#if refundForm.refundType === 'partial'}
						<div class="form-section partial-amount-section">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="form-label">返金金額を入力</label>
							<div class="amount-input-wrapper">
								<span class="amount-currency">¥</span>
								<input
									type="number"
									bind:value={refundForm.refundAmount}
									min="1"
									max={refundingOrder.total_amount}
									disabled={isRefunding}
									class="amount-input"
									placeholder="金額を入力"
									required
								/>
							</div>
							<div class="amount-range">
								<span class="text-xs text-[#718096]">最小: ¥1</span>
								<span class="text-xs font-semibold text-[#2d3748]">
									最大: ¥{refundingOrder.total_amount.toLocaleString('ja-JP')}
								</span>
							</div>
						</div>
					{/if}

					<!-- 退款理由 -->
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<div class="form-section">
						<label class="form-label">
							返金理由 <span class="text-[#e53e3e]">*</span>
						</label>
						<div class="reason-grid">
							{#each refundReasons as reason}
								<label class="reason-option {refundForm.refundReason === reason ? 'active' : ''}">
									<input
										type="radio"
										bind:group={refundForm.refundReason}
										value={reason}
										disabled={isRefunding}
										class="sr-only"
									/>
									<span class="reason-text">{reason}</span>
									<span class="reason-check">
										{@html checkCircle}
									</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- 退货单号（已发货时） -->
					{#if needsTrackingNumber(refundingOrder)}
						<div class="tracking-notice">
							<div class="tracking-notice-header">
								<div class="tracking-notice-icon">
									{@html warningIcon}
								</div>
								<div>
									<h4 class="tracking-notice-title">返品が必要です</h4>
									<p class="tracking-notice-desc">
										商品が既に発送されているため、返品追跡番号の入力が必要です。
									</p>
								</div>
							</div>

							<div class="tracking-input-section">
								<!-- svelte-ignore a11y_label_has_associated_control -->
								<label class="form-label-dark">
									返品追跡番号 <span class="text-[#e53e3e]">*</span>
								</label>
								<input
									type="text"
									bind:value={refundForm.trackingNumber}
									placeholder="例: 1234-5678-9012"
									disabled={isRefunding}
									class="tracking-input"
									required
								/>
								<p class="tracking-hint">配送業者から受け取った追跡番号を入力してください</p>
							</div>
						</div>
					{/if}

					<!-- 是否退货（未发货时） -->
					{#if !needsTrackingNumber(refundingOrder)}
						<div class="return-goods-notice">
							<label class="return-goods-option">
								<input
									type="checkbox"
									bind:checked={refundForm.returnGoods}
									disabled={isRefunding}
									class="return-goods-checkbox"
								/>
								<div class="return-goods-content">
									<div class="return-goods-title">商品を返品する</div>
									<p class="return-goods-desc">
										商品を返品する場合は、チェックしてください。商品がまだ発送されていないため、直接返金されます。
									</p>
								</div>
							</label>
						</div>
					{/if}

					<!-- 操作按钮 -->
					<div class="modal-actions">
						<button
							type="button"
							class="btn-cancel"
							onclick={closeRefundModal}
							disabled={isRefunding}
						>
							<span>キャンセル</span>
						</button>
						<button type="submit" class="btn-submit" disabled={isRefunding}>
							{#if isRefunding}
								<div class="btn-spinner">
									{@html spinnerSm}
								</div>
								処理中...
							{:else}
								<span>返金申請を送信</span>
								<span class="btn-arrow">→</span>
							{/if}
						</button>
					</div>
				</form>

				<!-- 注意事项 -->
				<div class="refund-notice">
					<div class="refund-notice-icon">
						{@html infoIcon}
					</div>
					<div class="refund-notice-content">
						<p class="refund-notice-text">
							返金申請後、<strong>2-5営業日以内</strong
							>に処理されます。返金は元の支払い方法に戻されます。
							{#if needsTrackingNumber(refundingOrder)}
								返品された商品が確認された後、返金が処理されます。
							{/if}
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- 自定义确认对话框 -->
	{#if showConfirmDialog}
		<div class="confirm-dialog-overlay">
			<div class="confirm-dialog-content {confirmDialogData.type}">
				<div class="confirm-dialog-header">
					<div class="confirm-dialog-icon">
						{#if confirmDialogData.type === 'danger'}
							{@html cancelIcon}
						{:else if confirmDialogData.type === 'warning'}
							{@html warningIcon}
						{:else}
							{@html infoIcon}
						{/if}
					</div>
					<h3 class="confirm-dialog-title">{confirmDialogData.title}</h3>
				</div>
				<p class="confirm-dialog-message">{confirmDialogData.message}</p>
				<div class="confirm-dialog-actions">
					<button class="confirm-btn-cancel" onclick={confirmDialogData.onCancel}>
						{confirmDialogData.cancelText}
					</button>
					<button class="confirm-btn-confirm" onclick={confirmDialogData.onConfirm}>
						{confirmDialogData.confirmText}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- 自定义提示对话框 -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	{#if showAlertDialog}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="alert-dialog-overlay" onclick={closeAlertDialog}>
			<div class="alert-dialog-content {alertDialogData.type}" onclick={(e) => e.stopPropagation()}>
				<div class="alert-dialog-header">
					<div class="alert-dialog-icon">
						{#if alertDialogData.type === 'error'}
							{@html cancelIcon}
						{:else if alertDialogData.type === 'success'}
							{@html checkCircle}
						{:else}
							{@html infoIcon}
						{/if}
					</div>
					<h3 class="alert-dialog-title">{alertDialogData.title}</h3>
				</div>
				<p class="alert-dialog-message">{alertDialogData.message}</p>
				<button class="alert-btn-close" onclick={closeAlertDialog}>閉じる</button>
			</div>
		</div>
	{/if}
{/if}

<style>
	/* ==================== 基础样式 ==================== */
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

	.stat-card {
		padding: 1rem;
		background-color: #fafafa;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
	}

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

	.address-card {
		padding: 1.25rem;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		transition: border-color 0.2s;
	}

	.address-card:hover {
		border-color: #cbd5e0;
	}

	.product-card {
		padding: 1rem;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		transition: box-shadow 0.2s;
	}

	.product-card:hover {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

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

	.toggle {
		position: relative;
		width: 44px;
		height: 24px;
		-webkit-appearance: none;
		appearance: none;
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

	/* 原有模态框样式 */
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

	/* ==================== 退款模态框专属样式 ==================== */

	/* 背景遮罩 - 降低透明度 */
	.refund-modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 50;
		animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* 模态框容器 */
	.refund-modal-content {
		background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
		border-radius: 1rem;
		padding: 0;
		max-width: 560px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/* 模态框头部 */
	.refund-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 2px solid #e2e8f0;
		background: white;
		border-radius: 1rem 1rem 0 0;
	}

	.refund-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%);
		border-radius: 0.75rem;
		color: white;
	}

	/* 订单信息卡片 */
	.refund-order-info {
		margin: 1.5rem;
		background: linear-gradient(135deg, #1a202c 0%, #1a202c 100%);
		border-radius: 0.75rem;
		overflow: hidden;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.order-info-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.order-info-details {
		padding: 1.25rem;
	}

	.order-info-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		color: white;
	}

	.order-info-row:last-child {
		border-bottom: none;
	}

	.refund-type-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: rgba(252, 129, 129, 0.2);
		color: #fed7d7;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 9999px;
		border: 1px solid rgba(252, 129, 129, 0.3);
	}

	/* 表单部分 */
	.refund-form {
		padding: 0 1.5rem 1.5rem;
	}

	.form-section {
		margin-bottom: 1.5rem;
	}

	.form-label {
		display: block;
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #2d3748;
	}

	/* 退款类型选择卡片 */
	.refund-type-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.refund-type-card {
		position: relative;
		cursor: pointer;
		border: 2px solid #e2e8f0;
		border-radius: 0.75rem;
		background: white;
		overflow: hidden;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.refund-type-card:hover {
		border-color: #cbd5e0;
		transform: translateY(-2px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.refund-type-card.active {
		border-color: #2d3748;
		background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
		box-shadow: 0 4px 12px -2px rgba(45, 55, 72, 0.4);
	}

	.refund-type-card.active .refund-type-content {
		color: white;
	}

	.refund-type-content {
		padding: 1.25rem;
		text-align: center;
	}

	.refund-type-icon {
		display: flex;
		justify-content: center;
		margin-bottom: 0.5rem;
		color: inherit;
	}

	.refund-type-title {
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.refund-type-desc {
		font-size: 0.75rem;
		opacity: 0.75;
	}

	.refund-type-check {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background: #48bb78;
		color: white;
		border-radius: 9999px;
		opacity: 0;
		transform: scale(0);
		transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.refund-type-card.active .refund-type-check {
		opacity: 1;
		transform: scale(1);
	}

	/* 部分退款金额输入 */
	.partial-amount-section {
		animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.amount-input-wrapper {
		position: relative;
		margin-bottom: 0.5rem;
	}

	.amount-currency {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.125rem;
		font-weight: 600;
		color: #4a5568;
		pointer-events: none;
	}

	.amount-input {
		width: 100%;
		padding: 0.875rem 1rem 0.875rem 2.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: #1a1a1a;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.amount-input:focus {
		outline: none;
		border-color: #2d3748;
		box-shadow: 0 0 0 3px rgba(45, 55, 72, 0.1);
	}

	.amount-input:disabled {
		background-color: #f7fafc;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.amount-range {
		display: flex;
		justify-content: space-between;
		padding: 0 0.25rem;
	}

	/* 退款理由网格 */
	.reason-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	.reason-option {
		position: relative;
		display: flex;
		align-items: center;
		padding: 0.875rem 1rem;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.reason-option:hover {
		border-color: #cbd5e0;
		background: #f7fafc;
	}

	.reason-option.active {
		border-color: #2d3748;
		background: #edf2f7;
	}

	.reason-text {
		flex: 1;
		font-size: 0.8125rem;
		color: #4a5568;
		font-weight: 500;
	}

	.reason-option.active .reason-text {
		color: #1a1a1a;
		font-weight: 600;
	}

	.reason-check {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		color: #48bb78;
		opacity: 0;
		transform: scale(0);
		transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.reason-option.active .reason-check {
		opacity: 1;
		transform: scale(1);
	}

	/* 退货单号提示框 */
	.tracking-notice {
		padding: 1.25rem;
		background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
		border: 2px solid #fbbf24;
		border-radius: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.tracking-notice-header {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.tracking-notice-icon {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #f59e0b;
	}

	.tracking-notice-title {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #92400e;
		margin-bottom: 0.25rem;
	}

	.tracking-notice-desc {
		font-size: 0.8125rem;
		color: #78350f;
		line-height: 1.5;
	}

	.tracking-input-section {
		margin-top: 1rem;
	}

	.form-label-dark {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #92400e;
	}

	.tracking-input {
		width: 100%;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #1a1a1a;
		background: white;
		border: 2px solid #fbbf24;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.tracking-input:focus {
		outline: none;
		border-color: #f59e0b;
		box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
	}

	.tracking-input:disabled {
		background-color: #fef3c7;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.tracking-hint {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: #78350f;
	}

	/* 未发货退货选项 */
	.return-goods-notice {
		padding: 1rem;
		background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
		border: 2px solid #0ea5e9;
		border-radius: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.return-goods-option {
		display: flex;
		gap: 0.75rem;
		cursor: pointer;
	}

	.return-goods-checkbox {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.125rem;
		border: 2px solid #0ea5e9;
		border-radius: 0.25rem;
		cursor: pointer;
		appearance: none;
		background: white;
		transition: all 0.2s;
	}

	.return-goods-checkbox:checked {
		background: #0ea5e9;
		border-color: #0ea5e9;
	}

	.return-goods-checkbox:checked::after {
		content: '✓';
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.return-goods-content {
		flex: 1;
	}

	.return-goods-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #075985;
		margin-bottom: 0.375rem;
	}

	.return-goods-desc {
		font-size: 0.8125rem;
		color: #0c4a6e;
		line-height: 1.5;
	}

	/* 操作按钮 */
	.modal-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.btn-cancel {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #4a5568;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-cancel:hover:not(:disabled) {
		background: #f7fafc;
		border-color: #cbd5e0;
	}

	.btn-cancel:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-submit {
		flex: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: white;
		background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 6px -1px rgba(229, 62, 62, 0.3);
	}

	.btn-submit:hover:not(:disabled) {
		background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
		transform: translateY(-2px);
		box-shadow: 0 6px 12px -2px rgba(229, 62, 62, 0.4);
	}

	.btn-submit:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.btn-icon {
		display: inline-flex;
		width: 1.125rem;
		height: 1.125rem;
	}

	.btn-spinner {
		display: inline-flex;
		animation: spin 1s linear infinite;
	}

	.btn-arrow {
		display: inline-flex;
		transition: transform 0.2s;
	}

	.btn-submit:hover:not(:disabled) .btn-arrow {
		transform: translateX(4px);
	}

	/* 底部提示 */
	.refund-notice {
		display: flex;
		gap: 0.75rem;
		margin: 1.5rem;
		padding: 1rem;
		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
		border: 1px solid #93c5fd;
		border-radius: 0.75rem;
	}

	.refund-notice-icon {
		flex-shrink: 0;
		width: 1.5rem;
		height: 1.5rem;
		color: #3b82f6;
	}

	.refund-notice-content {
		flex: 1;
	}

	.refund-notice-text {
		font-size: 0.8125rem;
		color: #1e40af;
		line-height: 1.6;
	}

	.refund-notice-text strong {
		font-weight: 700;
		color: #1e3a8a;
	}

	/* ==================== 自定义确认对话框样式 ==================== */
	.confirm-dialog-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 60;
		animation: fadeIn 0.2s ease-out;
	}

	.confirm-dialog-content {
		background: white;
		border-radius: 0.75rem;
		padding: 1.5rem;
		max-width: 420px;
		width: 100%;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
		animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.confirm-dialog-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.confirm-dialog-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 9999px;
	}

	.confirm-dialog-content.warning .confirm-dialog-icon {
		background: #fef3c7;
		color: #f59e0b;
	}

	.confirm-dialog-content.danger .confirm-dialog-icon {
		background: #fee2e2;
		color: #ef4444;
	}

	.confirm-dialog-content.info .confirm-dialog-icon {
		background: #dbeafe;
		color: #3b82f6;
	}

	.confirm-dialog-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1a1a1a;
		text-align: center;
	}

	.confirm-dialog-message {
		color: #4a5568;
		text-align: center;
		line-height: 1.6;
		margin-bottom: 1.5rem;
		white-space: pre-line;
	}

	.confirm-dialog-actions {
		display: flex;
		gap: 0.75rem;
	}

	.confirm-btn-cancel {
		flex: 1;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #4a5568;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.confirm-btn-cancel:hover {
		background: #f7fafc;
		border-color: #cbd5e0;
	}

	.confirm-btn-confirm {
		flex: 1;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: white;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.confirm-dialog-content.warning .confirm-btn-confirm {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	}

	.confirm-dialog-content.danger .confirm-btn-confirm {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	}

	.confirm-dialog-content.info .confirm-btn-confirm {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	}

	.confirm-btn-confirm:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.2);
	}

	/* ==================== 自定义提示对话框样式 ==================== */
	.alert-dialog-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 60;
		animation: fadeIn 0.2s ease-out;
	}

	.alert-dialog-content {
		background: white;
		border-radius: 0.75rem;
		padding: 1.5rem;
		max-width: 380px;
		width: 100%;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
		animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.alert-dialog-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.alert-dialog-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 9999px;
	}

	.alert-dialog-content.error .alert-dialog-icon {
		background: #fee2e2;
		color: #ef4444;
	}

	.alert-dialog-content.success .alert-dialog-icon {
		background: #d1fae5;
		color: #10b981;
	}

	.alert-dialog-content.info .alert-dialog-icon {
		background: #dbeafe;
		color: #3b82f6;
	}

	.alert-dialog-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1a1a1a;
		text-align: center;
	}

	.alert-dialog-message {
		color: #4a5568;
		text-align: center;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.alert-btn-close {
		width: 100%;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: white;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.alert-dialog-content.error .alert-btn-close {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	}

	.alert-dialog-content.success .alert-btn-close {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	}

	.alert-dialog-content.info .alert-btn-close {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	}

	.alert-btn-close:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.2);
	}

	/* ==================== 动画定义 ==================== */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			max-height: 0;
		}
		to {
			opacity: 1;
			max-height: 500px;
		}
	}

	@keyframes scaleUp {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* ==================== 其他样式 ==================== */
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

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	a {
		text-decoration: none;
	}

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
