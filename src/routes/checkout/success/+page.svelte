<script lang="ts">
	import { goto } from '$app/navigation';
	import { cart } from '$lib/stores/cartStore';
	import { onMount } from 'svelte';
	import {
		calendar,
		checkCircle,
		download,
		email,
		mapPin,
		packageBox as packageIcon,
		phone,
		print,
		starFill as star,
		truck,
		user
	} from '$lib/icons/svgs';
	import { pb } from '\$lib/services/PBConfig';

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
	let recommendedProducts = $state<any[]>([]);

	// 从 pb 获取推荐商品
	async function fetchRecommendedProducts() {
		try {
			const result = await pb.collection('products').getList(1, 3, {
				sort: '-created'
			});

			recommendedProducts = result.items;
		} catch (error) {
			console.error('获取推荐商品出错:', error);
		}
	}

	// 在组件挂载时获取推荐商品
	onMount(async () => {
		// ... 原有的 onMount 逻辑 ...
		await fetchRecommendedProducts();
	});

	// 组件挂载时处理
	onMount(async () => {
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

		await cart.clearCart();
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
				<div
					class="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 {showConfetti
						? 'animate-bounce'
						: ''}"
				>
					{@html checkCircle}
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
							{@html download}
						</button>
						<button
							onclick={printOrder}
							class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
							title="印刷"
						>
							{@html print}
						</button>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="rounded-lg bg-green-50 p-4">
						<div class="mb-2 flex items-center gap-2 text-green-900">
							{@html email}
							<span class="font-medium">注文確認メール</span>
						</div>
						<p class="text-sm text-green-700">
							ご登録のメールアドレスに注文確認メールを送信しました。
						</p>
					</div>
					<div class="rounded-lg bg-blue-50 p-4">
						<div class="mb-2 flex items-center gap-2 text-blue-900">
							{@html calendar}
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
						{@html truck}
						<span>配送先情報</span>
					</h3>
					{#if orderData.address}
						<div class="space-y-2 text-sm">
							<div class="flex items-center gap-2 text-gray-600">
								{@html user}
								<span class="font-medium text-gray-900">{orderData.address.recipient}</span>
							</div>
							<div class="flex items-center gap-2 text-gray-600">
								{@html phone}
								<span>{orderData.address.phone}</span>
							</div>
							<div class="flex items-start gap-2 text-gray-600">
								{@html mapPin}
								<span>{orderData.address.address}</span>
							</div>
						</div>
					{/if}
				</div>

				<!-- 商品列表 -->
				<div class="border-b border-gray-200 p-6">
					<h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
						{@html packageIcon}
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
									<div
										class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500"
									>
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
						href={`/product/${product.id}`}
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
									{@html star}
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
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600"
					>
						1
					</div>
					<div>
						<p class="font-medium text-gray-900">注文確認メールをチェック</p>
						<p class="text-sm text-gray-600">ご登録のメールアドレスに詳細を送信しました</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600"
					>
						2
					</div>
					<div>
						<p class="font-medium text-gray-900">発送準備</p>
						<p class="text-sm text-gray-600">商品の準備が整い次第、発送いたします</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600"
					>
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
				<a class="text-blue-600 hover:underline" href="/support">カスタマーサポート</a>
				までお問い合わせください。
			</p>
		</div>
	</div>
</div>

<style>
	@keyframes bounce {
		0%,
		100% {
			transform: translateY(-25%);
			animation:-timing-function cubic-bezier(0.8, 0, 1, 1);
		}
		50% {
			transform: translateY(0);
			animation:-timing-function cubic-bezier(0, 0, 0.2, 1);
		}
	}

	.animate-bounce {
		animation: bounce 1s infinite;
	}
</style>
