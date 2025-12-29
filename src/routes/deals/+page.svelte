<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { RecordModel } from 'pocketbase';
	import { pb } from '$lib/services/PBConfig';
	import { boltIcon, imagePlaceholder, starRatingSm, warningIcon, clockIconSm, arrowRight } from '$lib/icons/svgs';

	interface FlashSaleProduct extends RecordModel {
		flash_sale_id: string;
		product_id: string[];
		salePrice: number;
		stockLimit: number;
		soldCount: number;
		maxPerUser: number;
		isActive: boolean;
		expand?: {
			product_id?: Array<{
				id: string;
				name: string;
				name_ja?: string;
				image?: string;
				price: number;
				originalPrice?: number;
				rating?: number;
				reviews?: number;
				inStock?: boolean;
			}>;
			flash_sale_id?: {
				id: string;
				title: string;
				description?: string;
				startTime: string;
				endTime: string;
				isActive: boolean;
			};
		};
	}

	let flashSaleProducts = $state<FlashSaleProduct[]>([]);
	let isLoading = $state(true);
	let timeRemaining: { [key: string]: string } = $state({});
	let countdownInterval: number;

	onMount(async () => {
		await loadFlashSaleProducts();
		startCountdown();
	});

	onDestroy(() => {
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}
	});

	// 获取当前时间戳
	function getNow(): number {
		return Date.now();
	}

	// 将PocketBase时间字符串转换为时间戳
	function parsePocketBaseTime(timeString: string): number {
		try {
			return new Date(timeString).getTime();
		} catch (error) {
			console.error('时间解析错误:', error);
			return 0;
		}
	}

	async function loadFlashSaleProducts() {
		try {
			isLoading = true;

			const result = await pb.collection('flash_sale_products').getList(1, 50, {
				filter: 'isActive = true',
				expand: 'product_id,flash_sale_id',
				sort: '-created'
			});

			console.log('获取到的闪购数据:', result.items);

			const now = getNow();
			flashSaleProducts = result.items.filter((item: any) => {
				const flashSale = item.expand?.flash_sale_id;
				if (!flashSale || !flashSale.isActive) return false;

				const startTime = parsePocketBaseTime(flashSale.startTime);
				const endTime = parsePocketBaseTime(flashSale.endTime);

				return now >= startTime && now <= endTime;
			}) as FlashSaleProduct[];

			console.log('过滤后的闪购商品:', flashSaleProducts);
		} catch (error) {
			console.error('セール商品読み込みエラー:', error);
		} finally {
			isLoading = false;
		}
	}

	function startCountdown() {
		updateCountdown();
		countdownInterval = window.setInterval(updateCountdown, 1000);
	}

	function updateCountdown() {
		const now = getNow();
		const newTimeRemaining: { [key: string]: string } = {};

		flashSaleProducts.forEach((item) => {
			const flashSale = item.expand?.flash_sale_id;
			if (!flashSale) {
				newTimeRemaining[item.id] = '終了';
				return;
			}

			const endTime = parsePocketBaseTime(flashSale.endTime);
			const diff = endTime - now;

			if (diff <= 0) {
				newTimeRemaining[item.id] = '終了';
				return;
			}

			const hours = Math.floor(diff / 3600000);
			const minutes = Math.floor((diff % 3600000) / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);

			newTimeRemaining[item.id] =
				`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		});

		timeRemaining = newTimeRemaining;
	}

	function getStockPercentage(item: FlashSaleProduct): number {
		if (item.stockLimit <= 0) return 0;
		const remaining = item.stockLimit - item.soldCount;
		return Math.min(100, Math.max(0, (remaining / item.stockLimit) * 100));
	}

	// 计算折扣百分比
	function getDiscountPercentage(item: FlashSaleProduct, productPrice: number): number {
		if (!productPrice || productPrice <= 0) return 0;
		return Math.round(((productPrice - item.salePrice) / productPrice) * 100);
	}

	// 购买按钮点击处理
	async function handlePurchase(item: FlashSaleProduct, productId: string) {
		try {
			console.log('购买闪购商品:', productId, '价格:', item.salePrice);
			window.location.href = `/product/${productId}`;
		} catch (error) {
			console.error('购买错误:', error);
		}
	}
</script>

<main class="min-h-screen bg-gradient-to-b from-red-50 to-white">
	<!-- ヘッダー -->
	<section class="bg-gradient-to-r from-red-600 to-orange-500 text-white">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
				<div class="relative">
					<div class="h-10 w-10 sm:h-12 sm:w-12">
						{@html boltIcon}
					</div>
					<div
						class="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-yellow-400"
					></div>
				</div>
				<div class="text-center sm:text-left">
					<h1 class="text-2xl font-bold sm:text-3xl">タイムセール</h1>
					<p class="text-white/90">期間限定の特別価格！お見逃しなく</p>
				</div>
				<div class="mt-2 sm:mt-0 sm:ml-auto">
					<div class="rounded-lg bg-white/20 px-3 py-1 backdrop-blur-sm">
						<div class="text-center text-sm">開催中</div>
						<div class="text-center text-xl font-bold">
							{flashSaleProducts.reduce(
								(total, item) => total + (item.expand?.product_id?.length || 0),
								0
							)}
						</div>
						<div class="text-center text-xs">商品</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
		{#if isLoading}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#each Array(8) as _}
					<div class="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
						<div class="aspect-square bg-gray-200"></div>
						<div class="space-y-2 p-3">
							<div class="h-3 rounded bg-gray-200"></div>
							<div class="h-3 w-2/3 rounded bg-gray-200"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if flashSaleProducts.length > 0}
			<!-- 闪购活动信息 -->
			{#each flashSaleProducts as flashSaleItem}
				{@const flashSale = flashSaleItem.expand?.flash_sale_id}
				{@const products = flashSaleItem.expand?.product_id}

				{#if flashSale && products && products.length > 0}
					<div class="mb-6 rounded-lg bg-gradient-to-r from-red-100 to-orange-100 p-4">
						<div class="flex flex-col items-start justify-between sm:flex-row sm:items-center">
							<div>
								<h2 class="mb-1 text-lg font-bold text-gray-900">{flashSale.title}</h2>
								<p class="text-sm text-gray-600">
									残り時間: {timeRemaining[flashSaleItem.id] || '00:00:00'}
								</p>
							</div>
							<div class="mt-2 sm:mt-0">
								<div class="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
									タイムセール中
								</div>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{#each products as product}
							<div
								class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-red-300 hover:shadow-lg"
							>
								<!-- 折扣标签 -->
								<div class="absolute top-2 left-2 z-10">
									<div class="bg-red-600 px-2 py-1 text-xs font-bold text-white">
										{getDiscountPercentage(flashSaleItem, product.originalPrice || product.price)}%
										OFF
									</div>
								</div>

								<!-- 缺货标签 -->
								{#if product.inStock === false}
									<div class="absolute top-2 right-2 z-10">
										<div class="rounded bg-gray-800 px-2 py-1 text-xs font-bold text-white">
											売り切れ
										</div>
									</div>
								{/if}

								<a href="/product/{product.id}" class="block">
									<!-- 商品画像 -->
									<div class="relative aspect-square overflow-hidden bg-gray-100">
										{#if product.image}
											<img
												src={product.image}
												alt={product.name_ja || product.name}
												class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
												loading="lazy"
											/>
										{:else}
											<div class="flex h-full items-center justify-center text-gray-400">
												{@html imagePlaceholder}
											</div>
										{/if}
									</div>

									<!-- 商品情報 -->
									<div class="p-3">
										<h3
											class="mb-2 line-clamp-2 text-sm font-medium text-gray-900 hover:text-red-600"
										>
											{product.name_ja || product.name}
										</h3>

										<!-- 価格 -->
										<div class="mb-2">
											<div class="flex items-baseline gap-1">
												<span class="text-base font-bold text-red-600"
													>¥{flashSaleItem.salePrice.toLocaleString()}</span
												>
												{#if product.originalPrice && product.originalPrice > flashSaleItem.salePrice}
													<span class="text-xs text-gray-400 line-through"
														>¥{product.originalPrice.toLocaleString()}</span
													>
												{/if}
											</div>
										</div>

										<!-- 在庫状況 -->
										<div class="mb-2">
											<div class="mb-1 text-xs text-gray-600">
												残り {flashSaleItem.stockLimit - flashSaleItem.soldCount}個
											</div>
											<div class="h-1 overflow-hidden rounded-full bg-gray-200">
												<div
													class="h-full rounded-full {getStockPercentage(flashSaleItem) > 50
														? 'bg-green-500'
														: getStockPercentage(flashSaleItem) > 20
															? 'bg-yellow-500'
															: 'bg-red-500'}"
													style="width: {getStockPercentage(flashSaleItem)}%"
												></div>
											</div>
										</div>

										<!-- 評価 -->
										{#if product.rating}
											<div class="flex items-center gap-1 text-xs">
												<div class="flex">
													{#each Array(5) as _, i}
														<div class={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
															{@html starRatingSm}
														</div>
													{/each}
												</div>
												<span class="text-gray-600">{product.rating.toFixed(1)}</span>
											</div>
										{/if}
									</div>
								</a>

								<!-- 購入ボタン -->
								<div class="border-t border-gray-100 p-3">
									<button
										on:click={() => handlePurchase(flashSaleItem, product.id)}
										class="w-full rounded-md py-2 text-sm font-medium text-white transition-colors {product.inStock ===
										false
											? 'cursor-not-allowed bg-gray-400'
											: 'bg-red-600 hover:bg-red-700'}"
										disabled={product.inStock === false}
									>
										{#if product.inStock === false}
											売り切れ
										{:else}
											今すぐ購入
										{/if}
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/each}

			<!-- 促销提醒 -->
			<div class="mt-6 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 p-4 text-center">
				<div class="flex items-center justify-center gap-2">
					<div class="h-6 w-6 text-red-600">
						{@html warningIcon}
					</div>
					<p class="text-sm text-gray-700">セール終了間近！在庫が少ない商品もあります</p>
				</div>
			</div>
		{:else}
			<div class="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
				<div class="mx-auto mb-4 h-12 w-12 text-gray-400">
					{@html clockIconSm}
				</div>
				<h3 class="mb-2 text-lg font-bold text-gray-700">現在開催中のタイムセールはありません</h3>
				<p class="mb-4 text-gray-600">次のタイムセールをお楽しみに！</p>
				<a
					href="/products"
					class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
				>
					<span>全ての商品を見る</span>
					{@html arrowRight}
				</a>
			</div>
		{/if}
	</div>
</main>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
