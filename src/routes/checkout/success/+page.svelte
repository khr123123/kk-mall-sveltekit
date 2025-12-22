<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// SVG 图标
	const icons = {
		checkCircle: `<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
		package: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
		truck: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
		email: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
		user: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
		phone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`,
		mapPin: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		calendar: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
		download: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
		print: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>`,
		share: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>`,
		heart: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
		star: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
	};

	// 状态管理
	let orderData = $state<any>(null);
	let showConfetti = $state(true);
	let estimatedDeliveryDate = $state('');

	// 格式化价格
	function formatPrice(price: number): string {
		return `¥${price.toLocaleString('ja-JP')}`;
	}

	// 格式化日期
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
	}

	// 计算预计配送日期
	function calculateDeliveryDate(): string {
		const date = new Date();
		date.setDate(date.getDate() + 3); // 3天后
		return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
	}

	// 查看订单详情
	function viewOrderDetails() {
		if (orderData) {
			goto(`/orders/${orderData.orderId}`);
		}
	}

	// 继续购物
	function continueShopping() {
		goto('/');
	}

	// 下载订单确认书
	function downloadReceipt() {
		// 实际应该生成PDF
		alert('領収書のダウンロード機能は実装中です');
	}

	// 打印订单
	function printOrder() {
		window.print();
	}

	// 推荐商品数据
	const recommendedProducts = [
		{
			id: 1,
			name: 'ワイヤレス充電器',
			image: 'https://images.unsplash.com/photo-1591290619762-c588f4cb4c89?w=400&h=400&fit=crop',
			price: 3980,
			rating: 4.5
		},
		{
			id: 2,
			name: 'スマホケース',
			image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400&h=400&fit=crop',
			price: 1980,
			rating: 4.8
		},
		{
			id: 3,
			name: 'Bluetoothスピーカー',
			image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
			price: 5980,
			rating: 4.6
		}
	];

	// 组件挂载时处理
	onMount(() => {
		// 从 localStorage 获取订单数据
		const savedOrder = localStorage.getItem('currentOrder');
		if (savedOrder) {
			orderData = JSON.parse(savedOrder);
		}

		// 计算预计配送日期
		estimatedDeliveryDate = calculateDeliveryDate();

		// 5秒后隐藏庆祝动画
		setTimeout(() => {
			showConfetti = false;
		}, 5000);

		// 清除购物车（实际应该调用API）
		localStorage.removeItem('cart');
	});
</script>

<svelte:head>
	<title>注文完了 - ありがとうございます</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 py-8">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<!-- 成功消息 -->
		<div class="mb-8 text-center">
			<div class="mb-4 flex justify-center">
				<div class="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 {showConfetti ? 'animate-bounce' : ''}">
					{@html icons.checkCircle}
				</div>
			</div>
			<h1 class="mb-2 text-3xl font-bold text-gray-900">ご注文ありがとうございます！</h1>
			<p class="text-gray-600">注文が正常に完了しました</p>
		</div>

		{#if orderData}
			<!-- 订单确认信息 -->
			<div class="mb-6 rounded-lg border border-green-200 bg-white p-6 shadow-sm">
				<div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
					<div>
						<h2 class="text-lg font-semibold text-gray-900">注文番号</h2>
						<p class="mt-1 font-mono text-2xl font-bold text-green-600">{orderData.orderId}</p>
					</div>
					<div class="flex gap-2">
						<button
							onclick={downloadReceipt}
							class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
							title="領収書をダウンロード"
						>
							{@html icons.download}
						</button>
						<button
							onclick={printOrder}
							class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
							title="印刷"
						>
							{@html icons.print}
						</button>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="rounded-lg bg-green-50 p-4">
						<div class="mb-2 flex items-center gap-2 text-green-900">
							{@html icons.email}
							<span class="font-medium">注文確認メール</span>
						</div>
						<p class="text-sm text-green-700">
							ご登録のメールアドレスに注文確認メールを送信しました。
						</p>
					</div>
					<div class="rounded-lg bg-blue-50 p-4">
						<div class="mb-2 flex items-center gap-2 text-blue-900">
							{@html icons.calendar}
							<span class="font-medium">お届け予定日</span>
						</div>
						<p class="text-sm text-blue-700">
							{estimatedDeliveryDate}（目安）
						</p>
					</div>
				</div>
			</div>

			<!-- 订单详情 -->
			<div class="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
				<!-- 配送信息 -->
				<div class="border-b border-gray-200 p-6">
					<h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
						{@html icons.truck}
						<span>配送先情報</span>
					</h3>
					{#if orderData.address}
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
					{/if}
				</div>

				<!-- 商品列表 -->
				<div class="border-b border-gray-200 p-6">
					<h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
						{@html icons.package}
						<span>注文商品</span>
					</h3>
					<div class="space-y-4">
						{#each orderData.items as item}
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
										<span>数量: {item.quantity}</span>
									</div>
								</div>
								<div class="text-right">
									<p class="font-medium text-gray-900">{formatPrice(item.price)}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- 价格明细 -->
				<div class="p-6">
					<h3 class="mb-4 text-base font-semibold text-gray-900">お支払い情報</h3>
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
							<div class="flex justify-between text-lg font-bold text-gray-900">
								<span>合計金額</span>
								<span>{formatPrice(orderData.total)}</span>
							</div>
						</div>
						<div class="flex justify-between text-sm text-gray-600">
							<span>お支払い方法</span>
							<span>{orderData.payment?.name}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- 操作按钮 -->
			<div class="mb-8 grid gap-3 sm:grid-cols-2">
				<button
					onclick={viewOrderDetails}
					class="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
				>
					注文詳細を表示
				</button>
				<button
					onclick={continueShopping}
					class="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
				>
					ショッピングを続ける
				</button>
			</div>
		{/if}

		<!-- 推荐商品 -->
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold text-gray-900">おすすめ商品</h3>
			<div class="grid gap-4 sm:grid-cols-3">
				{#each recommendedProducts as product}
					<a
						href={`/products/${product.id}`}
						class="group rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-md"
					>
						<img
							src={product.image}
							alt={product.name}
							class="mb-3 h-32 w-full rounded-lg object-cover"
						/>
						<h4 class="mb-2 text-sm font-medium text-gray-900 group-hover:text-blue-600">
							{product.name}
						</h4>
						<div class="flex items-center justify-between">
							<span class="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
							<div class="flex items-center gap-1">
								<div class="text-yellow-400">
									{@html icons.star}
								</div>
								<span class="text-xs text-gray-600">{product.rating}</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- 下一步提示 -->
		<div class="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-6">
			<h3 class="mb-4 text-lg font-semibold text-gray-900">次のステップ</h3>
			<div class="space-y-3">
				<div class="flex items-start gap-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
						1
					</div>
					<div>
						<p class="font-medium text-gray-900">注文確認メールをチェック</p>
						<p class="text-sm text-gray-600">ご登録のメールアドレスに詳細を送信しました</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
						2
					</div>
					<div>
						<p class="font-medium text-gray-900">発送準備</p>
						<p class="text-sm text-gray-600">商品の準備が整い次第、発送いたします</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
						3
					</div>
					<div>
						<p class="font-medium text-gray-900">配送状況の追跡</p>
						<p class="text-sm text-gray-600">マイページから配送状況を確認できます</p>
					</div>
				</div>
			</div>
		</div>

		<!-- 帮助信息 -->
		<div class="mt-6 text-center">
			<p class="text-sm text-gray-600">
				ご不明な点がございましたら、
				<a href="/support" class="text-blue-600 hover:underline">カスタマーサポート</a>
				までお問い合わせください。
			</p>
		</div>
	</div>
</div>

<style>
	@keyframes bounce {
		0%, 100% {
			transform: translateY(-25%);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
		}
		50% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
		}
	}

	.animate-bounce {
		animation: bounce 1s infinite;
	}

	@media print {
		.no-print {
			display: none;
		}
	}
</style>