<!-- routes/checkout/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// SVG 图标
	const icons = {
		home: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
		building: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
		check: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
		edit: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
		add: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
		creditCard: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
		paypay: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M16.5,12c0,1.93-1.57,3.5-3.5,3.5S9.5,13.93,9.5,12 c0-1.93,1.57-3.5,3.5-3.5S16.5,10.07,16.5,12z"/></svg>`,
		convenience: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
		bank: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>`,
		lock: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
		shipping: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
		package: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
		user: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
		phone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`,
		mapPin: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		calendar: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
	};

	// 状态管理
	let selectedAddress = $state<number>(1);
	let selectedPayment = $state<string>('paypay');
	let step = $state<'address' | 'payment' | 'confirm'>('address');
	let isProcessing = $state<boolean>(false);
	
	// 地址数据
	const addresses = [
		{
			id: 1,
			name: '自宅',
			recipient: '山田 太郎',
			phone: '080-1234-5678',
			address: '〒150-0001 東京都渋谷区神宮前1-1-1',
			postalCode: '150-0001',
			isDefault: true
		},
		{
			id: 2,
			name: '会社',
			recipient: '山田 太郎',
			phone: '03-1234-5678',
			address: '〒100-0005 東京都千代田区丸の内1-1-1',
			postalCode: '100-0005',
			isDefault: false
		}
	];

	// 支付方式
	const paymentMethods = [
		{ 
			id: 'paypay', 
			name: 'PayPay', 
			icon: icons.paypay, 
			description: 'PayPay残高で決済', 
			fee: 0 
		},
		{ 
			id: 'credit', 
			name: 'クレジットカード', 
			icon: icons.creditCard, 
			description: 'VISA/Mastercard', 
			fee: 0 
		},
		{ 
			id: 'convenience', 
			name: 'コンビニ決済', 
			icon: icons.convenience, 
			description: 'ローソン/ファミマなど', 
			fee: 200 
		},
		{ 
			id: 'bank', 
			name: '銀行振込', 
			icon: icons.bank, 
			description: '三井住友/三菱UFJなど', 
			fee: 300 
		}
	];

	// 订单数据
	let orderItems = $state([
		{
			id: 1,
			name: 'ワイヤレスイヤホン Pro',
			image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
			price: 12800,
			quantity: 1,
			color: 'ブラック',
			seller: 'テックストア'
		},
		{
			id: 2,
			name: 'スマートウォッチ Series 5',
			image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
			price: 28900,
			quantity: 1,
			color: 'シルバー',
			size: '42mm',
			seller: 'ガジェット専門店'
		}
	]);

	// 计算价格
	let subtotal = $derived(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
	let shippingFee = $state(500);
	let paymentFee = $derived(paymentMethods.find(m => m.id === selectedPayment)?.fee || 0);
	let total = $derived(subtotal + shippingFee + paymentFee);

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
			step = 'payment';
		} else if (step === 'payment') {
			step = 'confirm';
		}
		// 滚动到顶部
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
		isProcessing = true;
		
		// 创建订单数据
		const orderData = {
			orderId: `ORD-${Date.now()}`,
			items: orderItems,
			address: addresses.find(a => a.id === selectedAddress),
			payment: paymentMethods.find(m => m.id === selectedPayment),
			subtotal,
			shippingFee,
			paymentFee,
			total,
			orderDate: new Date().toISOString()
		};

		// 保存到 localStorage 以便后续页面使用
		localStorage.setItem('currentOrder', JSON.stringify(orderData));

		// 模拟API调用
		await new Promise(resolve => setTimeout(resolve, 1500));

		// 根据支付方式跳转
		if (selectedPayment === 'paypay') {
			goto('/checkout/payment');
		} else if (selectedPayment === 'credit') {
			goto('/checkout/payment');
		} else {
			goto('/checkout/success');
		}
	}

	// 返回购物车
	function backToCart() {
		goto('/cart');
	}

	// 获取选中的地址
	const selectedAddressData = $derived(addresses.find(a => a.id === selectedAddress));
	
	// 获取选中的支付方式
	const selectedPaymentData = $derived(paymentMethods.find(m => m.id === selectedPayment));
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
					<div class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
						step === 'address' ? 'bg-gray-900 text-white' : 
						step === 'payment' || step === 'confirm' ? 'bg-green-500 text-white' : 
						'bg-gray-200 text-gray-500'
					}`}>
						{#if step === 'payment' || step === 'confirm'}
							{@html icons.check}
						{:else}
							1
						{/if}
					</div>
					<span class="hidden text-sm font-medium text-gray-900 sm:inline">お届け先</span>
				</div>
				
				<div class={`h-1 w-12 transition-colors sm:w-24 ${
					step === 'payment' || step === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
				}`}></div>
				
				<!-- 步骤2: 支付 -->
				<div class="flex items-center gap-2">
					<div class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
						step === 'payment' ? 'bg-gray-900 text-white' : 
						step === 'confirm' ? 'bg-green-500 text-white' : 
						'bg-gray-200 text-gray-500'
					}`}>
						{#if step === 'confirm'}
							{@html icons.check}
						{:else}
							2
						{/if}
					</div>
					<span class="hidden text-sm font-medium text-gray-900 sm:inline">お支払い方法</span>
				</div>
				
				<div class={`h-1 w-12 transition-colors sm:w-24 ${
					step === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
				}`}></div>
				
				<!-- 步骤3: 确认 -->
				<div class="flex items-center gap-2">
					<div class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
						step === 'confirm' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
					}`}>
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
							<button class="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900">
								{@html icons.add}
								<span>新しい住所を追加</span>
							</button>
						</div>

						<div class="space-y-4">
							{#each addresses as address}
								<label class="block cursor-pointer">
									<div class="rounded-lg border-2 p-4 transition-all hover:border-gray-400 {selectedAddress === address.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}">
										<div class="flex items-start gap-3">
											<input
												type="radio"
												name="address"
												value={address.id}
												bind:group={selectedAddress}
												class="mt-1"
											/>
											<div class="flex-1">
												<div class="mb-2 flex items-center gap-2">
													<span class="text-sm font-medium text-gray-900">{address.name}</span>
													{#if address.isDefault}
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
														<span>{address.address}</span>
													</div>
												</div>
											</div>
											<button class="flex items-center gap-1 text-gray-400 transition-colors hover:text-gray-600">
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
					</div>

				{:else if step === 'payment'}
					<!-- 支付方式选择 -->
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<h2 class="mb-6 text-lg font-semibold text-gray-900">お支払い方法</h2>

						<div class="space-y-4">
							{#each paymentMethods as method}
								<label class="block cursor-pointer">
									<div class="rounded-lg border-2 p-4 transition-all hover:border-gray-400 {selectedPayment === method.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}">
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
												<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
													<div class="flex items-center gap-3">
														<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
															{@html method.icon}
														</div>
														<div>
															<h3 class="font-medium text-gray-900">{method.name}</h3>
															<p class="text-sm text-gray-500">{method.description}</p>
														</div>
													</div>
													<div class="text-sm">
														{#if method.fee > 0}
															<span class="text-gray-500">手数料: {formatPrice(method.fee)}</span>
														{:else}
															<span class="text-green-600 font-medium">手数料無料</span>
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
										SSL暗号化により、お客様の決済情報は安全に保護されています。当社はクレジットカード情報を保持しません。
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
									onclick={() => step = 'address'}
									class="text-sm text-blue-600 transition-colors hover:text-blue-800"
								>
									変更
								</button>
							</div>
							{#if selectedAddressData}
								<div class="space-y-3 text-sm text-gray-600">
									<div class="flex items-center gap-2">
										{@html icons.user}
										<span class="font-medium text-gray-900">{selectedAddressData.recipient}</span>
									</div>
									<div class="flex items-center gap-2">
										{@html icons.phone}
										<span>{selectedAddressData.phone}</span>
									</div>
									<div class="flex items-start gap-2">
										{@html icons.mapPin}
										<span>{selectedAddressData.address}</span>
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
									onclick={() => step = 'payment'}
									class="text-sm text-blue-600 transition-colors hover:text-blue-800"
								>
									変更
								</button>
							</div>
							{#if selectedPaymentData}
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
											{@html selectedPaymentData.icon}
										</div>
										<div>
											<p class="text-sm font-medium text-gray-900">{selectedPaymentData.name}</p>
											<p class="text-xs text-gray-500">{selectedPaymentData.description}</p>
										</div>
									</div>
									<div class="text-sm">
										{#if selectedPaymentData.fee > 0}
											<span class="text-gray-500">手数料: {formatPrice(selectedPaymentData.fee)}</span>
										{:else}
											<span class="font-medium text-green-600">手数料無料</span>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<!-- 商品列表 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 class="mb-4 text-base font-semibold text-gray-900">注文商品</h3>
							<div class="space-y-4">
								{#each orderItems as item}
									<div class="flex items-center gap-4">
										<img
											src={item.image}
											alt={item.name}
											class="h-20 w-20 rounded-lg border border-gray-200 object-cover"
										/>
										<div class="flex-1">
											<p class="font-medium text-gray-900">{item.name}</p>
											<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
												{#if item.color}
													<span>カラー: {item.color}</span>
												{/if}
												{#if item.size}
													<span>サイズ: {item.size}</span>
												{/if}
												<span>販売元: {item.seller}</span>
											</div>
										</div>
										<div class="text-right">
											<p class="text-sm font-medium text-gray-900">
												{formatPrice(item.price)}
											</p>
											<p class="text-xs text-gray-500">数量: {item.quantity}</p>
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
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
						
						<!-- 商品预览（移动端隐藏） -->
						<div class="mb-4 hidden space-y-3 border-b border-gray-200 pb-4 lg:block">
							{#each orderItems.slice(0, 2) as item}
								<div class="flex items-center gap-3">
									<img
										src={item.image}
										alt={item.name}
										class="h-12 w-12 rounded border border-gray-200 object-cover"
									/>
									<div class="flex-1">
										<p class="text-xs text-gray-900">{item.name}</p>
										<p class="text-xs text-gray-500">×{item.quantity}</p>
									</div>
								</div>
							{/each}
							{#if orderItems.length > 2}
								<p class="text-xs text-gray-500">他 {orderItems.length - 2} 点</p>
							{/if}
						</div>

						<div class="space-y-3 text-sm">
							<div class="flex justify-between text-gray-600">
								<span>小計 ({orderItems.length}点)</span>
								<span class="font-medium">{formatPrice(subtotal)}</span>
							</div>
							<div class="flex justify-between text-gray-600">
								<span>送料</span>
								<span class="font-medium">{shippingFee === 0 ? '無料' : formatPrice(shippingFee)}</span>
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