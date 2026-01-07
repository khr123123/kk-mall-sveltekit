<!-- routes/orders/[orderId]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		arrowLeft,
		packageIcon,
		truckIcon,
		checkIconSm,
		clockIcon,
		userIcon,
		phoneIcon,
		mapPinIcon,
		creditCardIcon,
		downloadIcon,
		printIcon,
		supportIcon,
		cancelIcon,
		starIcon,
		heartIcon
	} from '$lib/icons/svgs';

	// SVG 图标
	const icons = {
		arrowLeft,
		package: packageIcon,
		truck: truckIcon,
		check: checkIconSm,
		clock: clockIcon,
		user: userIcon,
		phone: phoneIcon,
		mapPin: mapPinIcon,
		creditCard: creditCardIcon,
		download: downloadIcon,
		print: printIcon,
		support: supportIcon,
		cancel: cancelIcon,
		star: starIcon,
		heart: heartIcon
	};

	// 状态管理
	let orderData: any = null;
	let trackingHistory: any[] = [];
	let orderId = '';

	// 订单状态映射
	const statusMap = {
		pending: {
			text: '注文確認中',
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-100',
			icon: icons.clock
		},
		processing: {
			text: '発送準備中',
			color: 'text-blue-600',
			bgColor: 'bg-blue-100',
			icon :icons.package
		},
		shipped: {
			text: '配送中',
			color: 'text-purple-600',
			bgColor: 'bg-purple-100',
			icon :icons.truck
		},
		delivered: {
			text: '配達完了',
			color: 'text-green-600',
			bgColor: 'bg-green-100',
			icon: icons.check
		},
		cancelled: {
			text: 'キャンセル',
			color: 'text-red-600',
			bgColor: 'bg-red-100',
			icon: icons.cancel
		}
	};

	// 获取订单状态信息
	function getOrderStatus(status: keyof typeof statusMap) {
		return statusMap[status] || statusMap.pending;
	}

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
						image:
							'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
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
				description :'商品をお届けしました',
				timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
				location :'東京都渋谷区'
			},
			{
				status: '配達中',
				description :'配達員がお届けに向かっています',
				timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
				location :'東京都渋谷営業所'
			},
			{
				status: '輸送中',
				description :'最寄りの営業所に到着しました',
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
				description :'商品の発送準備を開始しました',
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
			<!-- 获取订单状态 -->
			{@const status = getOrderStatus(orderData.status)}

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
					<div class="flex items-center gap-4">
						<div
							class={`flex h-12 w-12 items-center justify-center rounded-full ${status.bgColor} ${status.color}`}
						>
							{@html status.icon}
						</div>
						<div>
							<h2 class="text-lg font-semibold text-gray-900">{status.text}</h2>
							<p class="text-sm text-gray-600">
								注文日時: {formatDateTime(orderData.orderDate)}
							</p>
						</div>
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
								{#each trackingHistory as track, index (track.timestamp)}
									{@const isFirst = index === 0}
									<div class="flex gap-4">
										<div class="flex flex-col items-center">
											<div
												class={`flex h-8 w-8 items-center justify-center rounded-full ${
													isFirst ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
												}`}
											>
												{#if isFirst}
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
							{#each orderData.items as item (item.id)}
								<div class="flex gap-4 rounded-lg border border-gray-200 p-4">
									<img src={item.image} alt={item.name} class="h-24 w-24 rounded-lg object-cover" />
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
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
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
			display: none !important;
		}
	}
</style>
