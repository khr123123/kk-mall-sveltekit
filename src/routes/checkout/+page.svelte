<!-- src/routes/checkout/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { cart, cartStats } from '$lib/stores/cartStore';
	import { addressStore } from '$lib/stores/addressStore';
	import { currentUser } from '$lib/stores/userStore';
	import { pb } from '$lib/services/categoryService';

	// SVG 图标
	const icons = {
		home: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
		check: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
		edit: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
		add: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
		user: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
		phone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`,
		mapPin: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		calendar: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
		lock: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
		shipping: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
		package: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`
	};

	// 状态管理
	let selectedAddressId = $state<string | null>(null);
	let selectedPayment = $state<string>('paypay');
	let step = $state<'address' | 'payment' | 'confirm'>('address');
	let isProcessing = $state<boolean>(false);

	// 支付方式
	const paymentMethods = [
		{
			id: 'paypay',
			name: 'PayPay',
			description: 'PayPay残高で決済',
			fee: 0
		},
		{
			id: 'credit',
			name: 'クレジットカード',
			description: 'VISA/Mastercard',
			fee: 0
		},
		{
			id: 'convenience',
			name: 'コンビニ決済',
			description: 'ローソン/ファミマなど',
			fee: 200
		},
		{
			id: 'bank',
			name: '銀行振込',
			description: '三井住友/三菱UFJなど',
			fee: 300
		}
	];

	// 计算价格
	let shippingFee = $state(500);
	let paymentFee = $derived(paymentMethods.find((m) => m.id === selectedPayment)?.fee || 0);
	let total = $derived($cartStats.subtotal + shippingFee + paymentFee);

	// 格式化价格
	function formatPrice(price: number): string {
		return `¥${price.toLocaleString('ja-JP')}`;
	}

	// 选择支付方式
	function selectPayment(methodId: string) {
		selectedPayment = methodId;
	}

	// 步骤导航
	function nextStep() {
		if (step === 'address') {
			if (!selectedAddressId) {
				alert('配送先住所を選択してください');
				return;
			}
			step = 'payment';
		} else if (step === 'payment') {
			step = 'confirm';
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function prevStep() {
		if (step === 'payment') {
			step = 'address';
		} else if (step === 'confirm') {
			step = 'payment';
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// 确认订单
	async function confirmOrder() {
		if (!$currentUser || !selectedAddressId) {
			alert('ログイン情報または配送先が不足しています');
			return;
		}

		isProcessing = true;

		try {
			const selectedAddress = $addressStore.addresses.find((a) => a.id === selectedAddressId);
			const selectedPaymentData = paymentMethods.find((m) => m.id === selectedPayment);

			if (!selectedAddress || !selectedPaymentData) {
				throw new Error('配送先または支払い方法が見つかりません');
			}

			// 准备订单商品列表
			const orderItems = $cart.items
				.filter((item) => item.selected)
				.map((item) => ({
					id: item.product.id,
					name: item.product.name,
					price: item.product.price,
					quantity: item.quantity,
					image: item.product.image
				}));

			if (orderItems.length === 0) {
				throw new Error('カートに商品がありません');
			}

			// 生成订单号
			const orderId = `ORD-${Date.now()}`;

			// ✅ 创建订单记录 - 添加 payment_method 字段
			const orderRecord = await pb.collection('orders').create({
				user: $currentUser.id,
				order_number: orderId,
				items: JSON.stringify(orderItems),
				address: selectedAddress.id,
				total_amount: total,
				status: 'pending',
				item_count: orderItems.length,
				order_date: new Date().toISOString(),
				payment_method: selectedPayment,  // 🆕 保存支付方式
				payment_id: null  // 🆕 初始为空，支付成功后更新
			});

			// 保存订单数据到 localStorage
			const orderData = {
				orderId: orderId,
				recordId: orderRecord.id,  // 🆕 添加记录ID
				items: orderItems,
				address: selectedAddress,
				payment: selectedPaymentData,
				subtotal: $cartStats.subtotal,
				shippingFee,
				paymentFee,
				total,
				orderDate: new Date().toISOString()
			};


			localStorage.setItem('currentOrder', JSON.stringify(orderData));

			// 模拟API调用延迟
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// 根据支付方式跳转
			if (selectedPayment === 'paypay' || selectedPayment === 'credit') {
				goto('/checkout/payment');
			} else {
				// 其他支付方式直接跳转成功页面
				goto('/checkout/success');
			}
		} catch (error) {
			console.error('注文作成エラー:', error);
			alert('注文の作成に失敗しました。もう一度お試しください。');
		} finally {
			isProcessing = false;
		}
	}

	// 返回购物车
	function backToCart() {
		goto('/cart');
	}

	// 获取选中的地址
	const selectedAddress = $derived($addressStore.addresses.find((a) => a.id === selectedAddressId));

	// 获取选中的支付方式
	const selectedPaymentData = $derived(paymentMethods.find((m) => m.id === selectedPayment));

	// 组件挂载
	onMount(async () => {
		// 检查登录状态
		if (!$currentUser) {
			alert('ログインが必要です');
			goto('/login');
			return;
		}

		// 加载地址和购物车
		await Promise.all([addressStore.load(), cart.loadCart()]);

		// 自动选择默认地址
		const defaultAddress = $addressStore.addresses.find((a) => a.is_default);
		if (defaultAddress) {
			selectedAddressId = defaultAddress.id;
		} else if ($addressStore.addresses.length > 0) {
			selectedAddressId = $addressStore.addresses[0].id;
		}

		// 检查购物车是否为空
		if ($cart.items.length === 0) {
			alert('カートに商品がありません');
			goto('/cart');
		}
	});
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- 页面标题 -->
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">購入手続き</h1>
			<p class="mt-1 text-sm text-gray-500">注文の詳細を確認してください</p>
		</div>

		<!-- 步骤指示器 -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<!-- 步骤1: 地址 -->
				<div class="flex items-center gap-2">
					<div
						class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
							step === 'address'
								? 'bg-gray-900 text-white'
								: step === 'payment' || step === 'confirm'
									? 'bg-green-500 text-white'
									: 'bg-gray-200 text-gray-500'
						}`}
					>
						{#if step === 'payment' || step === 'confirm'}
							{@html icons.check}
						{:else}
							1
						{/if}
					</div>
					<span class="hidden text-sm font-medium text-gray-900 sm:inline">お届け先</span>
				</div>

				<div
					class={`h-1 w-12 transition-colors sm:w-24 ${
						step === 'payment' || step === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
					}`}
				></div>

				<!-- 步骤2: 支付 -->
				<div class="flex items-center gap-2">
					<div
						class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
							step === 'payment'
								? 'bg-gray-900 text-white'
								: step === 'confirm'
									? 'bg-green-500 text-white'
									: 'bg-gray-200 text-gray-500'
						}`}
					>
						{#if step === 'confirm'}
							{@html icons.check}
						{:else}
							2
						{/if}
					</div>
					<span class="hidden text-sm font-medium text-gray-900 sm:inline">お支払い方法</span>
				</div>

				<div
					class={`h-1 w-12 transition-colors sm:w-24 ${
						step === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
					}`}
				></div>

				<!-- 步骤3: 确认 -->
				<div class="flex items-center gap-2">
					<div
						class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
							step === 'confirm' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
						}`}
					>
						3
					</div>
					<span class="hidden text-sm font-medium text-gray-900 sm:inline">確認</span>
				</div>
			</div>
		</div>

		<div class="grid gap-8 lg:grid-cols-3">
			<!-- 左侧：主要内容 -->
			<div class="lg:col-span-2">
				{#if step === 'address'}
					<!-- 地址选择 -->
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<div class="mb-6 flex items-center justify-between">
							<h2 class="text-lg font-semibold text-gray-900">お届け先住所</h2>
							<button
								class="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900"
								onclick={() => goto('/account/addresses/new')}
							>
								{@html icons.add}
								<span>新しい住所を追加</span>
							</button>
						</div>

						{#if $addressStore.loading}
							<div class="flex justify-center py-12">
								<div class="text-gray-400">読み込み中...</div>
							</div>
						{:else if $addressStore.addresses.length === 0}
							<div class="py-12 text-center">
								<p class="mb-4 text-gray-600">配送先住所が登録されていません</p>
								<button
									class="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
									onclick={() => goto('/account/addresses/new')}
								>
									住所を追加する
								</button>
							</div>
						{:else}
							<div class="space-y-4">
								{#each $addressStore.addresses as address (address.id)}
									<label class="block cursor-pointer">
										<div
											class="rounded-lg border-2 p-4 transition-all hover:border-gray-400 {selectedAddressId ===
											address.id
												? 'border-gray-900 bg-gray-50'
												: 'border-gray-200'}"
										>
											<div class="flex items-start gap-3">
												<input
													type="radio"
													name="address"
													value={address.id}
													bind:group={selectedAddressId}
													class="mt-1"
												/>
												<div class="flex-1">
													<div class="mb-2 flex items-center gap-2">
														<span class="text-sm font-medium text-gray-900">{address.label}</span>
														{#if address.is_default}
															<span class="rounded bg-gray-900 px-2 py-0.5 text-xs text-white">
																既定
															</span>
														{/if}
													</div>
													<div class="space-y-1 text-sm text-gray-600">
														<div class="flex items-center gap-2">
															{@html icons.user}
															<span>{address.recipient}</span>
														</div>
														<div class="flex items-center gap-2">
															{@html icons.phone}
															<span>{address.phone}</span>
														</div>
														<div class="flex items-start gap-2">
															{@html icons.mapPin}
															<span>〒{address.postal_code} {address.address}</span>
														</div>
													</div>
												</div>
												<button
													class="flex items-center gap-1 text-gray-400 transition-colors hover:text-gray-600"
													onclick={() => goto(`/account/addresses/${address.id}/edit`)}
												>
													{@html icons.edit}
												</button>
											</div>
										</div>
									</label>
								{/each}
							</div>

							<div class="mt-6 flex justify-end">
								<button
									onclick={nextStep}
									class="rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
								>
									次へ進む
								</button>
							</div>
						{/if}
					</div>
				{:else if step === 'payment'}
					<!-- 支付方式选择 -->
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<h2 class="mb-6 text-lg font-semibold text-gray-900">お支払い方法</h2>

						<div class="space-y-4">
							{#each paymentMethods as method}
								<label class="block cursor-pointer">
									<div
										class="rounded-lg border-2 p-4 transition-all hover:border-gray-400 {selectedPayment ===
										method.id
											? 'border-gray-900 bg-gray-50'
											: 'border-gray-200'}"
									>
										<div class="flex items-start gap-3">
											<input
												type="radio"
												name="payment"
												value={method.id}
												bind:group={selectedPayment}
												onchange={() => selectPayment(method.id)}
												class="mt-1"
											/>
											<div class="flex-1">
												<div
													class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
												>
													<div class="flex items-center gap-3">
														<div>
															<h3 class="font-medium text-gray-900">{method.name}</h3>
															<p class="text-sm text-gray-500">{method.description}</p>
														</div>
													</div>
													<div class="text-sm">
														{#if method.fee > 0}
															<span class="text-gray-500">手数料: {formatPrice(method.fee)}</span>
														{:else}
															<span class="font-medium text-green-600">手数料無料</span>
														{/if}
													</div>
												</div>
											</div>
										</div>
									</div>
								</label>
							{/each}
						</div>

						<!-- 安全提示 -->
						<div class="mt-6 rounded-lg bg-blue-50 p-4">
							<div class="flex items-start gap-3">
								<div class="text-blue-600">
									{@html icons.lock}
								</div>
								<div>
									<h4 class="text-sm font-medium text-blue-900">安全な決済</h4>
									<p class="mt-1 text-xs text-blue-700">
										SSL暗号化により、お客様の決済情報は安全に保護されています。
									</p>
								</div>
							</div>
						</div>

						<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
							<button
								onclick={prevStep}
								class="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
							>
								戻る
							</button>
							<button
								onclick={nextStep}
								class="rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
							>
								次へ進む
							</button>
						</div>
					</div>
				{:else if step === 'confirm'}
					<!-- 订单确认 -->
					<div class="space-y-6">
						<!-- 配送信息 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-base font-semibold text-gray-900">配送情報</h3>
								<button
									onclick={() => (step = 'address')}
									class="text-sm text-blue-600 transition-colors hover:text-blue-800"
								>
									変更
								</button>
							</div>
							{#if selectedAddress}
								<div class="space-y-3 text-sm text-gray-600">
									<div class="flex items-center gap-2">
										{@html icons.user}
										<span class="font-medium text-gray-900">{selectedAddress.recipient}</span>
									</div>
									<div class="flex items-center gap-2">
										{@html icons.phone}
										<span>{selectedAddress.phone}</span>
									</div>
									<div class="flex items-start gap-2">
										{@html icons.mapPin}
										<span>〒{selectedAddress.postal_code} {selectedAddress.address}</span>
									</div>
									<div class="flex items-center gap-2">
										{@html icons.calendar}
										<span>通常1-3営業日でお届け</span>
									</div>
								</div>
							{/if}
						</div>

						<!-- 支付信息 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-base font-semibold text-gray-900">お支払い方法</h3>
								<button
									onclick={() => (step = 'payment')}
									class="text-sm text-blue-600 transition-colors hover:text-blue-800"
								>
									変更
								</button>
							</div>
							{#if selectedPaymentData}
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div>
											<p class="text-sm font-medium text-gray-900">{selectedPaymentData.name}</p>
											<p class="text-xs text-gray-500">{selectedPaymentData.description}</p>
										</div>
									</div>
									<div class="text-sm">
										{#if selectedPaymentData.fee > 0}
											<span class="text-gray-500"
											>手数料: {formatPrice(selectedPaymentData.fee)}</span
											>
										{:else}
											<span class="font-medium text-green-600">手数料無料</span>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<!-- 商品列表 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
								{@html icons.package}
								<span>注文商品</span>
							</h3>
							<div class="space-y-4">
								{#each $cart.items.filter((item) => item.selected) as item}
									<div class="flex items-center gap-4">
										<img
											src={item.product.image}
											alt={item.product.name}
											class="h-20 w-20 rounded-lg border border-gray-200 object-cover"
										/>
										<div class="flex-1">
											<p class="font-medium text-gray-900">{item.product.name}</p>
											<div
												class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500"
											>
												<span>数量: {item.quantity}</span>
											</div>
										</div>
										<div class="text-right">
											<p class="text-sm font-medium text-gray-900">
												{formatPrice(item.product.price)}
											</p>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- 操作按钮 -->
						<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
							<button
								onclick={prevStep}
								disabled={isProcessing}
								class="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								戻る
							</button>
							<button
								onclick={confirmOrder}
								disabled={isProcessing}
								class="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if isProcessing}
									<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									<span>処理中...</span>
								{:else}
									<span>注文を確定する</span>
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- 右侧：订单摘要 -->
			<div class="lg:col-span-1">
				<div class="sticky top-4">
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<h3 class="mb-4 text-base font-semibold text-gray-900">注文概要</h3>

						<div class="space-y-3 text-sm">
							<div class="flex justify-between text-gray-600">
								<span>小計 ({$cartStats.selectedCount}点)</span>
								<span class="font-medium">{formatPrice($cartStats.subtotal)}</span>
							</div>
							<div class="flex justify-between text-gray-600">
								<span>送料</span>
								<span class="font-medium"
								>{shippingFee === 0 ? '無料' : formatPrice(shippingFee)}</span
								>
							</div>
							{#if paymentFee > 0}
								<div class="flex justify-between text-gray-600">
									<span>決済手数料</span>
									<span class="font-medium">{formatPrice(paymentFee)}</span>
								</div>
							{/if}
							<div class="border-t border-gray-200 pt-3">
								<div class="flex justify-between text-lg font-bold text-gray-900">
									<span>合計金額</span>
									<span>{formatPrice(total)}</span>
								</div>
								<p class="mt-1 text-xs text-gray-500">（税込み）</p>
							</div>
						</div>

						<button
							onclick={backToCart}
							class="mt-6 w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
						>
							カートに戻る
						</button>
					</div>

					<!-- 安全保证 -->
					<div class="mt-4 rounded-lg bg-gray-50 p-4">
						<div class="space-y-3">
							<div class="flex items-start gap-3">
								<div class="text-gray-600">
									{@html icons.lock}
								</div>
								<div class="text-xs text-gray-600">
									<span class="font-medium text-gray-900">SSL暗号化通信</span>
									<p class="mt-0.5">すべての通信は暗号化されています</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<div class="text-gray-600">
									{@html icons.shipping}
								</div>
								<div class="text-xs text-gray-600">
									<span class="font-medium text-gray-900">配送保証</span>
									<p class="mt-0.5">商品未着時は全額返金保証</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<div class="text-gray-600">
									{@html icons.package}
								</div>
								<div class="text-xs text-gray-600">
									<span class="font-medium text-gray-900">品質保証</span>
									<p class="mt-0.5">30日間返品保証</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
    input[type='radio'] {
        accent-color: #111827;
    }

    .sticky {
        position: sticky;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>
