<!-- routes/orders/[orderId]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// SVG 图标
	const icons = {
		arrowLeft: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>`,
		package: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
		truck: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
		check: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
		clock: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
		user: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
		phone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`,
		mapPin: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		creditCard: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
		download: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
		print: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>`,
		support: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
		cancel: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
		star: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
		heart: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`
	};

	// 状态管理
	let orderData = $state<any>(null);
	let trackingHistory = $state<any[]>([]);
	let orderId = $state<string>('');

	// 订单状态映射
	const statusMap = {
		pending: { text: '注文確認中', color: 'yellow', icon: icons.clock },
		processing: { text: '発送準備中', color: 'blue', icon: icons.package },
		shipped: { text: '配送中', color: 'purple', icon: icons.truck },
		delivered: { text: '配達完了', color: 'green', icon: icons.check },
		cancelled: { text: 'キャンセル', color: 'red', icon: icons.cancel }
	};

	// 格式化价格
	function formatPrice(price: number): string {
		return `¥${price.toLocaleString('ja-JP')}`;
	}

	// 格式化日期时间
	function formatDateTime(dateString: string): string {
		const date = new Date(dateString);
		return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
	}

	// 下载发票
	function downloadInvoice() {
		alert('領収書のダウンロード機能は実装中です');
	}

	// 打印订单
	function printOrder() {
		window.print();
	}

	// 联系客服
	function contactSupport() {
		goto('/support?order=' + orderId);
	}

	// 取消订单
	function cancelOrder() {
		if (confirm('本当に注文をキャンセルしますか？')) {
			alert('注文キャンセル機能は実装中です');
		}
	}

	// 再次购买
	function reorder() {
		alert('再注文機能は実装中です');
	}

	// 评价商品
	function rateProduct(productId: number) {
		goto(`/products/${productId}/review`);
	}

	// 返回订单列表
	function backToOrders() {
		goto('/orders');
	}

	// 组件挂载时处理
	onMount(() => {
		// 从URL获取订单ID
		orderId = $page.params.orderId || '';

		// 尝试从localStorage获取订单数据
		const savedOrder = localStorage.getItem('currentOrder');
		if (savedOrder) {
			const order = JSON.parse(savedOrder);
			if (order.orderId === orderId) {
				orderData = order;
			}
		}

		// 如果没有找到订单数据，使用模拟数据
		if (!orderData) {
			orderData = {
				orderId: orderId,
				orderDate: new Date().toISOString(),
				status: 'shipped',
				items: [
					{
						id: 1,
						name: 'ワイヤレスイヤホン Pro',
						image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
						price: 12800,
						quantity: 1,
						color: 'ブラック',
						seller: 'テックストア'
					}
				],
				address: {
					recipient: '山田 太郎',
					phone: '080-1234-5678',
					address: '〒150-0001 東京都渋谷区神宮前1-1-1'
				},
				payment: {
					name: 'クレジットカード',
					lastFour: '4242'
				},
				subtotal: 12800,
				shippingFee: 500,
				paymentFee: 0,
				total: 13300
			};
		}

		// 模拟物流追踪历史
		trackingHistory = [
			{
				status: '配達完了',
				description: '商品をお届けしました',
				timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
				location: '東京都渋谷区'
			},
			{
				status: '配達中',
				description: '配達員がお届けに向かっています',
				timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
				location: '東京都渋谷営業所'
			},
			{
				status: '輸送中',
				description: '最寄りの営業所に到着しました',
				timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
				location: '東京都千代田営業所'
			},
			{
				status: '発送済み',
				description: '商品を発送しました',
				timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
				location: '大阪物流センター'
			},
			{
				status: '発送準備中',
				description: '商品の発送準備を開始しました',
				timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
				location: '大阪物流センター'
			}
		];
	});
</script>

<svelte:head>
	<title>注文詳細 - {orderId}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		<!-- 返回按钮 -->
		<button
			onclick={backToOrders}
			class="mb-6 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
		>
			{@html icons.arrowLeft}
			<span>注文一覧に戻る</span>
		</button>

		{#if orderData}
			<!-- 订单标题 -->
			<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">注文詳細</h1>
					<p class="mt-1 font-mono text-sm text-gray-500">注文番号: {orderData.orderId}</p>
				</div>
				<div class="flex gap-2">
					<button
						onclick={downloadInvoice}
						class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
					>
						{@html icons.download}
						<span class="hidden sm:inline">領収書</span>
					</button>
					<button
						onclick={printOrder}
						class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
					>
						{@html icons.print}
						<span class="hidden sm:inline">印刷</span>
					</button>
					<button
						onclick={contactSupport}
						class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
					>
						{@html icons.support}
						<span class="hidden sm:inline">サポート</span>
					</button>
				</div>
			</div>

			<!-- 订单状态 -->
			<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          {#if orderData.status === 'pending'}
						<div class="mb-2 flex items-center gap-2">
							{@const status = statusMap[orderData.status as keyof typeof statusMap] || statusMap.pending}
							<div class="text-{status.color}-600">
								{@html status.icon}
							</div>
							<span class="text-lg font-semibold text-gray-900">{status.text}</span>
						</div>
						<p class="text-sm text-gray-600">
							注文日時: {formatDateTime(orderData.orderDate)}
						</p>
						<p class="text-sm text-gray-600">
							注文日時: {formatDateTime(orderData.orderDate)}
						</p>
					{/if}
					</div>
					{#if orderData.status === 'processing' || orderData.status === 'pending'}
						<button
							onclick={cancelOrder}
							class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
						>
							注文をキャンセル
						</button>
					{:else if orderData.status === 'delivered'}
						<button
							onclick={reorder}
							class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
						>
							再注文する
						</button>
					{/if}
				</div>
			</div>

			<div class="grid gap-6 lg:grid-cols-3">
				<!-- 左侧：主要内容 -->
				<div class="space-y-6 lg:col-span-2">
					<!-- 物流追踪 -->
					{#if orderData.status === 'shipped' || orderData.status === 'delivered'}
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
								{@html icons.truck}
								<span>配送状況</span>
							</h2>
							<div class="space-y-4">
								{#each trackingHistory as track, index}
									<div class="flex gap-4">
										<div class="flex flex-col items-center">
											<div class={`flex h-8 w-8 items-center justify-center rounded-full ${
												index === 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
											}`}>
												{#if index === 0}
													{@html icons.check}
												{:else}
													<div class="h-2 w-2 rounded-full bg-current"></div>
												{/if}
											</div>
											{#if index < trackingHistory.length - 1}
												<div class="h-full w-0.5 bg-gray-200"></div>
											{/if}
										</div>
										<div class="flex-1 pb-6">
											<p class="font-medium text-gray-900">{track.status}</p>
											<p class="text-sm text-gray-600">{track.description}</p>
											<div class="mt-1 flex flex-wrap gap-x-4 text-xs text-gray-500">
												<span>{formatDateTime(track.timestamp)}</span>
												<span>{track.location}</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- 商品列表 -->
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
							{@html icons.package}
							<span>注文商品</span>
						</h2>
						<div class="space-y-4">
							{#each orderData.items as item}
								<div class="flex gap-4 rounded-lg border border-gray-200 p-4">
									<img
										src={item.image}
										alt={item.name}
										class="h-24 w-24 rounded-lg object-cover"
									/>
									<div class="flex-1">
										<h3 class="font-medium text-gray-900">{item.name}</h3>
										<div class="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-gray-600">
											{#if item.color}
												<span>カラー: {item.color}</span>
											{/if}
											{#if item.size}
												<span>サイズ: {item.size}</span>
											{/if}
											<span>数量: {item.quantity}</span>
										</div>
										<p class="mt-2 text-sm text-gray-500">販売元: {item.seller}</p>
										{#if orderData.status === 'delivered'}
											<button
												onclick={() => rateProduct(item.id)}
												class="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline"
											>
												{@html icons.star}
												<span>商品を評価する</span>
											</button>
										{/if}
									</div>
									<div class="text-right">
										<p class="font-semibold text-gray-900">{formatPrice(item.price)}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- 右侧：信息摘要 -->
				<div class="lg:col-span-1">
					<div class="space-y-6">
						<!-- 价格明细 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 class="mb-4 text-base font-semibold text-gray-900">お支払い明細</h3>
							<div class="space-y-2 text-sm">
								<div class="flex justify-between text-gray-600">
									<span>小計</span>
									<span>{formatPrice(orderData.subtotal)}</span>
								</div>
								<div class="flex justify-between text-gray-600">
									<span>送料</span>
									<span>{formatPrice(orderData.shippingFee)}</span>
								</div>
								{#if orderData.paymentFee > 0}
									<div class="flex justify-between text-gray-600">
										<span>決済手数料</span>
										<span>{formatPrice(orderData.paymentFee)}</span>
									</div>
								{/if}
								<div class="border-t border-gray-200 pt-2">
									<div class="flex justify-between text-base font-bold text-gray-900">
										<span>合計</span>
										<span>{formatPrice(orderData.total)}</span>
									</div>
								</div>
							</div>
						</div>

						<!-- 配送地址 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 class="mb-4 text-base font-semibold text-gray-900">配送先</h3>
							<div class="space-y-2 text-sm">
								<div class="flex items-center gap-2 text-gray-600">
									{@html icons.user}
									<span class="font-medium text-gray-900">{orderData.address.recipient}</span>
								</div>
								<div class="flex items-center gap-2 text-gray-600">
									{@html icons.phone}
									<span>{orderData.address.phone}</span>
								</div>
								<div class="flex items-start gap-2 text-gray-600">
									{@html icons.mapPin}
									<span>{orderData.address.address}</span>
								</div>
							</div>
						</div>

						<!-- 支付方式 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 class="mb-4 text-base font-semibold text-gray-900">お支払い方法</h3>
							<div class="flex items-center gap-2 text-sm">
								{@html icons.creditCard}
								<span class="text-gray-900">{orderData.payment.name}</span>
								{#if orderData.payment.lastFour}
									<span class="text-gray-600">****{orderData.payment.lastFour}</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- 加载状态 -->
			<div class="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
				<div class="mb-4 flex justify-center">
					<svg class="h-8 w-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				</div>
				<p class="text-gray-600">注文情報を読み込んでいます...</p>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	@media print {
		button {
			display: none;
		}
	}
</style>