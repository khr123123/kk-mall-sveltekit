<script lang="ts">
	import { onMount } from 'svelte';
	import PocketBase from 'pocketbase';
	import type { RecordModel } from 'pocketbase';

	interface Product extends RecordModel {
		name: string;
		name_ja?: string;
		price: number;
		originalPrice?: number;
		image?: string;
		isHot?: boolean;
		discount?: number;
		rating?: number;
		reviews?: number;
		stock?: number;
	}

	const pb = new PocketBase('http://localhost:8090');

	let products = $state<Product[]>([]);
	let isLoading = $state(true);
	let sortBy = $state('rating');

	const sortOptions = [
		{ id: 'rating', name: '評価順' },
		{ id: 'reviews', name: 'レビュー数順' },
		{ id: 'price-low', name: '価格安い順' },
		{ id: 'price-high', name: '価格高い順' }
	];

	onMount(async () => {
		await loadHotProducts();
	});

	async function loadHotProducts() {
		try {
			isLoading = true;
			const result = await pb.collection('products').getList(1, 50, {
				filter: 'isHot = true && inStock = true',
				sort: getSortField(sortBy)
			});
			products = result.items as Product[];
		} catch (error) {
			console.error('人気商品読み込みエラー:', error);
		} finally {
			isLoading = false;
		}
	}

	function getSortField(sort: string): string {
		switch (sort) {
			case 'rating':
				return '-rating';
			case 'reviews':
				return '-reviews';
			case 'price-low':
				return '+price';
			case 'price-high':
				return '-price';
			default:
				return '-rating';
		}
	}

	async function handleSort(newSort: string) {
		sortBy = newSort;
		await loadHotProducts();
	}
</script>

<main class="min-h-screen bg-white">
	<!-- ヘッダー -->
	<section class="bg-gradient-to-r from-orange-600 to-red-600 text-white">
		<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<div class="flex items-center gap-3">
				<svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
					/>
				</svg>
				<div>
					<h1 class="mb-2 text-3xl font-bold">人気商品ランキング</h1>
					<p class="text-white/90">今、最も人気のある商品をチェック</p>
				</div>
			</div>
		</div>
	</section>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- ソートバー -->
		<div class="mb-6 flex items-center justify-between">
			<div class="text-sm text-gray-600">
				<span class="font-semibold">{products.length}</span> 件の人気商品
			</div>

			<div class="flex items-center gap-2">
				{#each sortOptions as option}
					<button
						on:click={() => handleSort(option.id)}
						class="hidden rounded-lg border px-4 py-2 text-sm font-medium transition-colors sm:block {sortBy ===
						option.id
							? 'border-gray-900 bg-gray-900 text-white'
							: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
					>
						{option.name}
					</button>
				{/each}

				<select
					bind:value={sortBy}
					on:change={(e) => handleSort(e.currentTarget.value)}
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 sm:hidden"
				>
					{#each sortOptions as option}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- TOP3 ハイライト -->
		{#if !isLoading && products.length >= 3}
			<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each products.slice(0, 3) as product, index}
					<div
						class="relative overflow-hidden rounded-xl border-2 {index === 0
							? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
							: index === 1
								? 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100'
								: 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50'}"
					>
						<!-- ランクバッジ -->
						<div class="absolute top-2 left-2 z-10">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full {index === 0
									? 'bg-gradient-to-br from-yellow-400 to-orange-500'
									: index === 1
										? 'bg-gradient-to-br from-gray-400 to-gray-600'
										: 'bg-gradient-to-br from-orange-400 to-red-500'} text-white shadow-lg"
							>
								<span class="text-2xl font-bold">{index + 1}</span>
							</div>
						</div>

						<a href="/product/{product.id}" class="block p-6">
							<div class="flex gap-6">
								<!-- 商品画像 -->
								<div class="ml-6 h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-white">
									{#if product.image}
										<img
											src={product.image}
											alt={product.name_ja || product.name}
											class="h-full w-full object-cover"
										/>
									{:else}
										<div class="flex h-full items-center justify-center text-gray-400">
											<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
									{/if}
								</div>

								<!-- 商品情報 -->
								<div class="flex-1">
									<h3 class="mb-2 line-clamp-2 font-semibold text-gray-900">
										{product.name_ja || product.name}
									</h3>

									{#if product.rating}
										<div class="mb-3 flex items-center gap-2">
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
											<span class="text-sm font-medium">{product.rating.toFixed(1)}</span>
										</div>
									{/if}

									<div class="flex items-center gap-2">
										<span class="text-lg font-bold text-gray-900"
											>¥{product.price.toLocaleString()}</span
										>
										{#if product.discount && product.discount > 0}
											<span class="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
												-{product.discount}%
											</span>
										{/if}
									</div>
								</div>
							</div>
						</a>
					</div>
				{/each}
			</div>
		{/if}

		<!-- 商品グリッド -->
		{#if isLoading}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each Array(10) as _}
					<div class="animate-pulse overflow-hidden rounded-lg border border-gray-200">
						<div class="aspect-square bg-gray-200"></div>
						<div class="space-y-3 p-4">
							<div class="h-4 rounded bg-gray-200"></div>
							<div class="h-4 w-2/3 rounded bg-gray-200"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if products.length > 3}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each products.slice(3) as product, index}
					<a
						href="/product/{product.id}"
						class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
					>
						<!-- ランク番号 -->
						<div class="absolute top-2 left-2 z-10">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white"
							>
								{index + 4}
							</div>
						</div>

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
									<svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								</div>
							{/if}

							{#if product.discount && product.discount > 0}
								<div class="absolute top-2 right-2">
									<span class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
										-{product.discount}%
									</span>
								</div>
							{/if}
						</div>

						<!-- 商品情報 -->
						<div class="p-3">
							<h3 class="mb-2 line-clamp-2 text-sm text-gray-900">
								{product.name_ja || product.name}
							</h3>

							{#if product.rating}
								<div class="mb-2 flex items-center gap-1">
									<div class="flex">
										{#each Array(5) as _, i}
											<svg
												class="h-3 w-3 {i < Math.floor(product.rating)
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
									<span class="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
								</div>
							{/if}

							<div class="flex items-baseline gap-2">
								<span class="text-base font-bold text-gray-900"
									>¥{product.price.toLocaleString()}</span
								>
								{#if product.originalPrice && product.originalPrice > product.price}
									<span class="text-xs text-gray-400 line-through"
										>¥{product.originalPrice.toLocaleString()}</span
									>
								{/if}
							</div>
						</div>
					</a>
				{/each}
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
