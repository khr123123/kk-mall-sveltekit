<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import PocketBase from 'pocketbase';
	import type { RecordModel } from 'pocketbase';

	interface Product extends RecordModel {
		name: string;
		name_ja?: string;
		description: string;
		price: number;
		originalPrice?: number;
		category_id: string;
		brand?: string;
		image?: string;
		images?: string[];
		inStock?: boolean;
		stock?: number;
		isHot?: boolean;
		isNew?: boolean;
		discount?: number;
		rating?: number;
		reviews?: number;
		tags?: string[];
		specs?: Record<string, string | number>;
	}
	//fuck
	const pb = new PocketBase('http://localhost:8090');

	// 主轮播图数据
	const mainBanners = [
		{
			id: 1,
			image:
				'https://plus.unsplash.com/premium_photo-1664201889922-66bc3c778c1e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
			title: '新年セール',
			subtitle: '全品50%OFF〜',
			link: '/sale'
		},
		{
			id: 2,
			image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=400&fit=crop',
			title: '家電・デジタル',
			subtitle: '最新ガジェット',
			link: '/electronics'
		},
		{
			id: 3,
			image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
			title: 'ファッション',
			subtitle: '春の新作',
			link: '/fashion'
		},
		{
			id: 4,
			image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
			title: 'ホーム&リビング',
			subtitle: '暮らしを豊かに',
			link: '/home'
		}
	];

	// 状态变量
	let products = $state<Product[]>([]);
	let categories = $state<any[]>([]);
	let isLoading = $state(true);
	let currentPage = $state(1);
	let totalPages = $state(1);
	let sortBy = $state('default');
	let loadingMore = $state(false);
	let hasMore = $state(true);
	let lazyLoadCount = $state(0);
	const MAX_LAZY_LOAD = 3;

	// 轮播图相关状态
	let currentMainBanner = $state(0);
	let autoPlayInterval: number;

	const sortOptions = [
		{ id: 'default', name: 'おすすめ順' },
		{ id: 'sales', name: '売れ筋順' },
		{ id: 'price-low', name: '価格安い順' },
		{ id: 'price-high', name: '価格高い順' },
		{ id: 'rating', name: '評価順' }
	];

	onMount(async () => {
		await Promise.all([loadProducts(), loadCategories()]);
		startAutoPlay();
	});

	function startAutoPlay() {
		autoPlayInterval = window.setInterval(() => {
			currentMainBanner = (currentMainBanner + 1) % mainBanners.length;
		}, 5000);
		window.addEventListener('scroll', handleScroll);
	}

	function handleScroll() {
		if (loadingMore || !hasMore || lazyLoadCount >= MAX_LAZY_LOAD) return;

		const scrollTop = window.scrollY || document.documentElement.scrollTop;
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;

		if (scrollTop + windowHeight >= documentHeight - 500) {
			loadMore();
		}
	}

	async function loadProducts() {
		try {
			isLoading = true;
			const resultList = await pb.collection('products').getList(currentPage, 20, {
				filter: 'inStock = true',
				expand: 'category_id',
				sort: getSortField(sortBy)
			});

			if (currentPage === 1) {
				products = resultList.items as Product[];
			} else {
				products = [...products, ...resultList.items] as Product[];
			}

			totalPages = resultList.totalPages;
			hasMore = currentPage < resultList.totalPages;
		} catch (error) {
			console.error('商品読み込みエラー:', error);
		} finally {
			isLoading = false;
			loadingMore = false;
		}
	}

	async function loadCategories() {
		try {
			const result = await pb.collection('category').getFullList({
				sort: 'created'
			});
			categories = result.slice(0, 10);
		} catch (error) {
			console.error('カテゴリ読み込みエラー:', error);
		}
	}

	async function loadMore() {
		if (loadingMore || !hasMore || lazyLoadCount >= MAX_LAZY_LOAD) return;

		loadingMore = true;
		currentPage++;
		lazyLoadCount++;
		await loadProducts();
	}

	function getSortField(sort: string): string {
		switch (sort) {
			case 'sales':
				return '-reviews';
			case 'price-low':
				return '+price';
			case 'price-high':
				return '-price';
			case 'rating':
				return '-rating';
			default:
				return '-created';
		}
	}

	async function handleSort(newSort: string) {
		sortBy = newSort;
		currentPage = 1;
		hasMore = true;
		lazyLoadCount = 0;
		await loadProducts();
	}

	function nextMainBanner() {
		currentMainBanner = (currentMainBanner + 1) % mainBanners.length;
		resetAutoPlay();
	}

	function prevMainBanner() {
		currentMainBanner = (currentMainBanner - 1 + mainBanners.length) % mainBanners.length;
		resetAutoPlay();
	}

	function goToMainBanner(index: number) {
		currentMainBanner = index;
		resetAutoPlay();
	}

	function resetAutoPlay() {
		clearInterval(autoPlayInterval);
		autoPlayInterval = window.setInterval(() => {
			currentMainBanner = (currentMainBanner + 1) % mainBanners.length;
		}, 5000);
	}

	function cleanup() {
		if (autoPlayInterval) clearInterval(autoPlayInterval);
		window.removeEventListener('scroll', handleScroll);
	}

	onDestroy(() => {
		cleanup();
	});
</script>

<main class="min-h-screen bg-gray-50">
	<!-- 桌面端布局 -->
	<div class="hidden lg:block">
		<section class="">
			<div class="relative mx-auto max-w-7xl px-0 py-0 sm:px-6 lg:px-0">
				<div class="grid grid-cols-12 gap-6">
					<!-- 左侧：轮播图 -->
					<div class="col-span-8">
						<div class="relative h-80 overflow-hidden rounded-xl">
							{#each mainBanners as banner, index}
								<div
									class="absolute inset-0 transition-all duration-700 ease-in-out {index ===
									currentMainBanner
										? 'translate-x-0 opacity-100'
										: index < currentMainBanner
											? '-translate-x-full opacity-0'
											: 'translate-x-full opacity-0'}"
								>
									<a
										href={banner.link}
										class="group relative block h-full w-full overflow-hidden no-underline"
									>
										<img
											src={banner.image}
											alt={banner.title}
											class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
											loading="lazy"
										/>
										<div class="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent">
											<div class="flex h-full items-center">
												<div class="ml-20 max-w-xl text-white">
													<h2 class="mb-2 text-2xl font-bold">{banner.title}</h2>
													<p class="mb-4 text-lg text-gray-200">{banner.subtitle}</p>
												</div>
											</div>
										</div>
									</a>
								</div>
							{/each}

							<!-- 轮播控制按钮 -->
							<button
								class="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:scale-110 hover:bg-white"
								on:click={prevMainBanner}
								aria-label="前のバナー"
							>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<button
								class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:scale-110 hover:bg-white"
								on:click={nextMainBanner}
								aria-label="次のバナー"
							>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>

							<!-- 轮播指示器 -->
							<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
								{#each mainBanners as _, index}
									<button
										class="h-1.5 rounded-full transition-all {index === currentMainBanner
											? 'w-6 bg-white'
											: 'w-1.5 bg-white/50'}"
										on:click={() => goToMainBanner(index)}
										aria-label="バナー {index + 1} へ"
									></button>
								{/each}
							</div>
						</div>
					</div>

					<!-- 右侧：分类区域和小卡片 -->
					<div class="col-span-4">
						<div class="h-full space-y-6">
							<!-- 分类区域 -->
							<div class="rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-9 shadow-lg">
								<h2 class="mb-4 text-lg font-bold">商品カテゴリー</h2>
								{#if categories.length > 0}
									<div class="grid grid-cols-5 gap-1">
										{#each categories as category}
											<a
												href="/category/{category.id}"
												class="group flex flex-col items-center rounded-lg p-2 transition-all hover:scale-105 hover:bg-gray-700/50"
											>
												<div
													class="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 group-hover:bg-gray-100"
												>
													{#if category.icon}
														<img
															src={category.icon}
															alt={category.name}
															class="h-6 w-6 object-cover"
														/>
													{:else}
														<svg
															class="h-5 w-5 text-gray-300"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="1.5"
																d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
															/>
														</svg>
													{/if}
												</div>
												<span
													class="text-center font-mono text-xs text-gray-700 group-hover:text-white"
													>{category.name}</span
												>
											</a>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>

	<!-- 移动端布局 -->
	<div class="lg:hidden">
		<!-- 轮播图 -->
		<section class="bg-gray-900">
			<div class="relative">
				<div class="relative h-64 sm:h-80">
					{#each mainBanners as banner, index}
						<div
							class="absolute inset-0 transition-all duration-700 ease-in-out {index ===
							currentMainBanner
								? 'translate-x-0 opacity-100'
								: index < currentMainBanner
									? '-translate-x-full opacity-0'
									: 'translate-x-full opacity-0'}"
						>
							<a
								href={banner.link}
								class="group relative block h-full w-full overflow-hidden no-underline"
							>
								<img
									src={banner.image}
									alt={banner.title}
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
									loading="lazy"
								/>
								<div class="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent">
									<div class="flex h-full items-center">
										<div class="ml-6 max-w-lg text-white sm:ml-8">
											<h2 class="mb-2 text-2xl font-bold sm:text-3xl">{banner.title}</h2>
											<p class="mb-4 text-lg text-gray-200">{banner.subtitle}</p>
										</div>
									</div>
								</div>
							</a>
						</div>
					{/each}

					<button
						class="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow transition-all hover:scale-110 hover:bg-white sm:left-4 sm:p-2"
						on:click={prevMainBanner}
						aria-label="前のバナー"
					>
						<svg
							class="h-4 w-4 sm:h-5 sm:w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<button
						class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow transition-all hover:scale-110 hover:bg-white sm:right-4 sm:p-2"
						on:click={nextMainBanner}
						aria-label="次のバナー"
					>
						<svg
							class="h-4 w-4 sm:h-5 sm:w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					<div
						class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2"
					>
						{#each mainBanners as _, index}
							<button
								class="h-1.5 rounded-full transition-all {index === currentMainBanner
									? 'w-5 bg-white sm:w-6'
									: 'w-1.5 bg-white/50'}"
								on:click={() => goToMainBanner(index)}
								aria-label="バナー {index + 1} へ"
							></button>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
			<!-- 移动端分类 -->
			{#if categories.length > 0}
				<section class="mb-6">
					<div class="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm">
						<h2 class="mb-4 text-lg font-bold text-gray-900">商品カテゴリー</h2>
						<div class="grid grid-cols-5 gap-2">
							{#each categories as category}
								<a
									href="/category/{category.id}"
									class="group flex flex-col items-center rounded-lg p-2 transition-all hover:scale-105 hover:bg-white hover:shadow-md"
								>
									<div
										class="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-gray-300 group-hover:to-gray-400"
									>
										{#if category.icon}
											<img src={category.icon} alt={category.name} class="h-6 w-6 object-cover" />
										{:else}
											<svg
												class="h-5 w-5 text-gray-700"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
												/>
											</svg>
										{/if}
									</div>
									<span class="text-center text-xs font-medium text-gray-700">{category.name}</span>
								</a>
							{/each}
						</div>
					</div>
				</section>
			{/if}
		</div>
	</div>

	<!-- 商品列表区域 -->
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- ソートバー -->
		<div class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
			<div class="flex items-center gap-4">
				<span class="text-lg font-bold text-gray-900">商品一覧</span>
				<div class="text-sm text-gray-600">
					<span class="font-semibold">{products.length}</span> 件の商品
				</div>
			</div>

			<div class="flex items-center gap-2">
				<div class="hidden items-center gap-2 sm:flex">
					{#each sortOptions as option}
						<button
							on:click={() => handleSort(option.id)}
							class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-all hover:border-gray-900 hover:bg-gray-50 hover:shadow-sm {sortBy ===
							option.id
								? 'bg-gray-900 text-white hover:bg-gray-800'
								: 'bg-white text-gray-700'}"
						>
							{option.name}
						</button>
					{/each}
				</div>

				<select
					bind:value={sortBy}
					on:change={(e) => handleSort(e.currentTarget.value)}
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-colors hover:border-gray-400 sm:hidden"
				>
					{#each sortOptions as option}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- 商品グリッド -->
		{#if isLoading && currentPage === 1}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each Array(10) as _}
					<div
						class="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
					>
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
						class="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
					>
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

							<div class="absolute top-2 left-2 flex flex-col gap-1">
								{#if product.isNew}
									<span class="rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white shadow">
										NEW
									</span>
								{/if}
								{#if product.discount && product.discount > 0}
									<span class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white shadow">
										-{product.discount}%
									</span>
								{/if}
							</div>
						</div>

						<div class="p-3">
							<h3 class="mb-2 line-clamp-2 text-sm font-medium text-gray-900">
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

			{#if loadingMore}
				<div class="mt-8 flex justify-center">
					<div class="flex items-center gap-3 rounded-lg bg-gray-50 px-6 py-3 shadow-sm">
						<svg class="h-5 w-5 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
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
						<span class="text-sm text-gray-600"
							>読み込み中... ({lazyLoadCount}/{MAX_LAZY_LOAD})</span
						>
					</div>
				</div>
			{/if}

			{#if lazyLoadCount >= MAX_LAZY_LOAD}
				<div
					class="mt-8 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 py-6 text-center shadow-sm"
				>
					<div class="mx-auto max-w-md">
						<svg
							class="mx-auto mb-3 h-12 w-12 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
							/>
						</svg>
						<p class="mb-2 text-gray-700">これ以上の商品は従来のページネーションをご利用ください</p>
						<p class="text-sm text-gray-500">
							最大 {MAX_LAZY_LOAD} 回の自動読み込みを制限しています
						</p>
					</div>
				</div>
			{:else if !hasMore && products.length > 0}
				<div class="mt-8 rounded-lg bg-gray-50 py-4 text-center text-sm text-gray-600">
					すべて表示しました
				</div>
			{/if}
		{:else}
			<div class="rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
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
						d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
					/>
				</svg>
				<p class="text-gray-600">商品が見つかりませんでした</p>
			</div>
		{/if}
	</div>

	<div class="h-8"></div>
</main>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
