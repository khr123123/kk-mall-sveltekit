<script lang="ts">
	import { onMount } from 'svelte';
	import type { RecordModel } from 'pocketbase';
	import { pb } from '$lib/services/PBConfig';
	import { settingsIcon, imagePlaceholder, starRatingSm, emptyProducts } from '$lib/icons/svgs';
	interface Product extends RecordModel {
		name: string;
		name_ja?: string;
		price: number;
		originalPrice?: number;
		image?: string;
		isNew?: boolean;
		discount?: number;
		rating?: number;
		reviews?: number;
		created: string;
	}

	let products = $state<Product[]>([]);
	let isLoading = $state(true);
	let sortBy = $state('newest');

	const sortOptions = [
		{ id: 'newest', name: '新着順' },
		{ id: 'price-low', name: '価格安い順' },
		{ id: 'price-high', name: '価格高い順' }
	];

	onMount(async () => {
		await loadNewProducts();
	});

	async function loadNewProducts() {
		try {
			isLoading = true;
			const result = await pb.collection('products').getList(1, 50, {
				filter: 'isNew = true && inStock = true',
				sort: getSortField(sortBy)
			});
			products = result.items as Product[];
		} catch (error) {
			console.error('新着商品読み込みエラー:', error);
		} finally {
			isLoading = false;
		}
	}

	function getSortField(sort: string): string {
		switch (sort) {
			case 'newest':
				return '-created';
			case 'price-low':
				return '+price';
			case 'price-high':
				return '-price';
			default:
				return '-created';
		}
	}

	async function handleSort(newSort: string) {
		sortBy = newSort;
		await loadNewProducts();
	}

	function getDaysAgo(dateString: string): string {
		const now = new Date();
		const created = new Date(dateString);
		const diffTime = Math.abs(now.getTime() - created.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return '本日';
		if (diffDays === 1) return '昨日';
		if (diffDays <= 7) return `${diffDays}日前`;
		return created.toLocaleDateString('ja-JP');
	}
</script>

<main class="min-h-screen bg-white">
	<!-- ヘッダー -->
	<section class="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center gap-3">
				<div class="h-10 w-10">
					{@html settingsIcon}
				</div>
				<div>
					<h1 class="mb-2 text-3xl font-bold">新着商品</h1>
					<p class="text-white/90">最新入荷の商品をいち早くチェック</p>
				</div>
			</div>
		</div>
	</section>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- ソートバー -->
		<div class="mb-6 flex items-center justify-between">
			<div class="text-sm text-gray-600">
				<span class="font-semibold">{products.length}</span> 件の新着商品
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
		{:else if products.length > 0}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each products as product}
					<a
						href="/product/{product.id}"
						class="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
					>
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
									{@html imagePlaceholder}
								</div>
							{/if}

							<!-- バッジ -->
							<div class="absolute top-2 left-2 flex flex-col gap-1">
								<span class="rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">
									NEW
								</span>
								{#if product.discount && product.discount > 0}
									<span class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
										-{product.discount}%
									</span>
								{/if}
							</div>

							<!-- 入荷日 -->
							<div class="absolute right-2 bottom-2">
								<div class="rounded bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
									{getDaysAgo(product.created)}
								</div>
							</div>
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
											<div class={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
												{@html starRatingSm}
											</div>
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
		{:else}
			<div class="py-16 text-center">
				<div class="mx-auto mb-4 h-16 w-16 text-gray-400">
					{@html emptyProducts}
				</div>
				<p class="text-gray-600">新着商品が見つかりませんでした</p>
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
