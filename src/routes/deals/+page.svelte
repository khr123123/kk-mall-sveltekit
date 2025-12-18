<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import PocketBase from 'pocketbase';
	import type { RecordModel } from 'pocketbase';

	interface FlashSaleProduct extends RecordModel {
		flash_sale_id: string;
		product_id: string;
		salePrice: number;
		stockLimit: number;
		soldCount: number;
		maxPerUser: number;
		isActive: boolean;
		expand?: {
			product_id?: {
				id: string;
				name: string;
				name_ja?: string;
				image?: string;
				price: number;
				originalPrice?: number;
				rating?: number;
				reviews?: number;
			};
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

	const pb = new PocketBase('http://localhost:8090');

	let flashSaleProducts = $state<FlashSaleProduct[]>([]);
	let isLoading = $state(true);
	let timeRemaining: { [key: string]: string } = {};
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

	async function loadFlashSaleProducts() {
		try {
			isLoading = true;
			const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
			const nowTime = new Date(now).getTime();
			const result = await pb.collection('flash_sale_products').getList(1, 50, {
				filter: `isActive = true && flash_sale_id.isActive = true && flash_sale_id.startTime <= "${nowTime}" && flash_sale_id.endTime >= "${nowTime}"`,
				expand: 'product_id,flash_sale_id',
				sort: '-created'
			});
			flashSaleProducts = result.items as FlashSaleProduct[];
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
		const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
		const nowTime = new Date(now).getTime();
		flashSaleProducts.forEach((item) => {
			if (!item.expand?.flash_sale_id) return;

			const endTime = new Date(item.expand.flash_sale_id.endTime).getTime();
			const diff = endTime - nowTime;

			if (diff <= 0) {
				timeRemaining[item.id] = '終了';
				return;
			}

			const hours = Math.floor(diff / 3600000);
			const minutes = Math.floor((diff % 3600000) / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);

			timeRemaining[item.id] =
				`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		});
	}

	function getStockPercentage(item: FlashSaleProduct): number {
		const remaining = item.stockLimit - item.soldCount;
		return (remaining / item.stockLimit) * 100;
	}
</script>

<main class="min-h-screen bg-white">
	<!-- ヘッダー -->
	<section class="bg-gradient-to-r from-red-600 to-orange-500 text-white">
		<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<div class="flex items-center gap-3">
				<svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
				<div>
					<h1 class="mb-2 text-3xl font-bold">タイムセール</h1>
					<p class="text-white/90">期間限定の特別価格！お見逃しなく</p>
				</div>
			</div>
		</div>
	</section>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{#if isLoading}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _}
					<div class="animate-pulse overflow-hidden rounded-lg border border-gray-200">
						<div class="aspect-square bg-gray-200"></div>
						<div class="space-y-3 p-4">
							<div class="h-4 rounded bg-gray-200"></div>
							<div class="h-4 w-2/3 rounded bg-gray-200"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if flashSaleProducts.length > 0}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each flashSaleProducts as item}
					{@const product = item.expand?.product_id}
					{@const flashSale = item.expand?.flash_sale_id}
					{#if product && flashSale}
						<div
							class="group overflow-hidden rounded-lg border-2 border-red-200 bg-white transition-shadow hover:shadow-xl"
						>
							<a href="/product/{product.id}" class="block">
								<!-- 商品画像 -->
								<div class="relative aspect-square overflow-hidden bg-gray-100">
									{#if product.image}
										<img
											src={product.image}
											alt={product.name_ja || product.name}
											class="h-full w-full object-cover transition-transform group-hover:scale-105"
											loading="lazy"
										/>
									{:else}
										<div class="flex h-full items-center justify-center text-gray-400">
											<svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
									{/if}

									<!-- セールバッジ -->
									<div class="absolute top-3 left-3">
										<div class="rounded bg-red-600 px-3 py-1 text-xs font-bold text-white">
											タイムセール
										</div>
									</div>

									<!-- 割引率 -->
									{#if product.originalPrice && product.originalPrice > item.salePrice}
										<div class="absolute top-3 right-3">
											<div class="rounded bg-red-600 px-3 py-1 text-xs font-bold text-white">
												-{Math.round(
													((product.originalPrice - item.salePrice) / product.originalPrice) * 100
												)}%
											</div>
										</div>
									{/if}

									<!-- カウントダウン -->
									<div class="absolute right-0 bottom-0 left-0 bg-black/70 px-4 py-3">
										<div class="flex items-center justify-center gap-2 text-white">
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											<span class="text-sm font-bold">
												{timeRemaining[item.id] || '00:00:00'}
											</span>
										</div>
									</div>
								</div>

								<!-- 商品情報 -->
								<div class="p-4">
									<h3 class="mb-3 line-clamp-2 text-base font-medium text-gray-900">
										{product.name_ja || product.name}
									</h3>

									<!-- 価格 -->
									<div class="mb-3 flex items-center gap-2">
										<span class="text-xl font-bold text-red-600"
											>¥{item.salePrice.toLocaleString()}</span
										>
										{#if product.originalPrice && product.originalPrice > item.salePrice}
											<span class="text-sm text-gray-500 line-through"
												>¥{product.originalPrice.toLocaleString()}</span
											>
										{/if}
									</div>

									<!-- 在庫状況 -->
									<div class="mb-3">
										<div class="mb-1 flex items-center justify-between text-xs text-gray-600">
											<span>残り {item.stockLimit - item.soldCount} 個</span>
											<span>{item.soldCount} 個販売済み</span>
										</div>
										<div class="h-2 overflow-hidden rounded-full bg-gray-200">
											<div
												class="h-full rounded-full transition-all {getStockPercentage(item) > 50
													? 'bg-green-500'
													: getStockPercentage(item) > 20
														? 'bg-yellow-500'
														: 'bg-red-500'}"
												style="width: {getStockPercentage(item)}%"
											></div>
										</div>
									</div>

									<!-- 評価 -->
									{#if product.rating}
										<div class="flex items-center gap-2 text-sm">
											<div class="flex">
												{#each Array(5) as _, i}
													<svg
														class="h-4 w-4 {i < Math.floor(product.rating)
															? 'text-yellow-400'
															: 'text-gray-300'}"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
														/>
													</svg>
												{/each}
											</div>
											<span class="text-gray-600">{product.rating.toFixed(1)}</span>
											<span class="text-gray-400">({product.reviews || 0}件)</span>
										</div>
									{/if}
								</div>
							</a>

							<!-- 購入ボタン -->
							<div class="border-t border-gray-100 p-4">
								<button
									class="w-full rounded-lg bg-red-600 py-3 font-bold text-white transition-colors hover:bg-red-700"
								>
									今すぐ購入
								</button>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="py-16 text-center">
				<svg
					class="mx-auto mb-4 h-16 w-16 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p class="text-gray-600">現在開催中のタイムセールはありません</p>
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
