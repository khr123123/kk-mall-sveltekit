<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { categoryStore } from '$lib/stores/categoryStore';
	import type { RecordModel } from 'pocketbase';
	import PocketBase from 'pocketbase';
	let pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
	// 状态管理
	let mainId = $state('');
	let currentCategory = $state<RecordModel | null>(null);
	let subcategories = $state<RecordModel[]>([]);
	let products = $state<RecordModel[]>([]);
	let isLoading = $state(false);
	let sortBy = $state('newest');

	// 分页
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalItems = $state(0);
	let perPage = $state(20);

	// 筛选状态
	let priceRange = $state<string>('all');
	let selectedBrands = $state<string[]>([]);
	let availableBrands = $state<string[]>([]);
	let showOnlyInStock = $state(false);

	// 初始化
	onMount(async () => {
		await loadData();
	});

	// 监听路由变化
	afterNavigate(async (navigation) => {
		if (navigation.to?.params) {
			await loadData();
		}
	});

	async function loadData() {
		try {
			isLoading = true;

			// 等待store数据加载
			if (!$categoryStore.isLoaded) {
				await new Promise((resolve) => {
					const unsubscribe = categoryStore.subscribe((store) => {
						if (store.isLoaded) {
							resolve(true);
							unsubscribe();
						}
					});
				});
			}

			const mainIdParam = page.params.parentId;
			if (!mainIdParam) return;

			mainId = mainIdParam;

			// 从 store 获取分类信息
			const categories = $categoryStore.categories;
			currentCategory = categories.find((cat: any) => cat.id === mainIdParam) || null;

			if (!currentCategory) {
				console.error('分类未找到:', mainIdParam);
				return;
			}

			// 获取子分类
			subcategories = currentCategory.expand?.children || [];

			// 获取该分类下的品牌
			await loadBrands();

			// 加载商品
			await loadProducts();
		} catch (error) {
			console.error('加载数据失败:', error);
			currentCategory = null;
			subcategories = [];
			products = [];
		} finally {
			isLoading = false;
		}
	}

	async function loadBrands() {
		try {
			// 获取所有子分类ID
			const subcategoryIds = subcategories.map((sub) => sub.id);
			if (subcategoryIds.length === 0) {
				availableBrands = [];
				return;
			}

			// 查询所有子分类下的商品中的品牌
			let allBrands: string[] = [];

			// 使用分页查询所有商品
			let page = 1;
			let hasMore = true;

			while (hasMore) {
				const filter = subcategoryIds.map((id) => `category_id = "${id}"`).join(' || ');
				const result = await pb.collection('products').getList(page, 200, {
					filter,
					fields: 'brand'
				});

				// 收集品牌
				const brands = result.items
					.map((item) => item.brand)
					.filter((brand) => brand && brand.trim() !== '');

				allBrands = [...allBrands, ...brands];

				hasMore = result.page < result.totalPages;
				page++;
			}

			// 去重并排序
			availableBrands = [...new Set(allBrands)].sort((a, b) => a.localeCompare(b));
		} catch (error) {
			console.error('加载品牌失败:', error);
			availableBrands = [];
		}
	}

	async function loadProducts() {
		try {
			// 获取所有子分类ID
			const subcategoryIds = subcategories.map((sub) => sub.id);
			if (subcategoryIds.length === 0) {
				products = [];
				totalItems = 0;
				totalPages = 1;
				return;
			}

			// 构建筛选条件
			const subcategoryFilter = subcategoryIds.map((id) => `category_id = "${id}"`).join(' || ');
			let filter = `(${subcategoryFilter})`;

			// 价格筛选
			if (priceRange !== 'all') {
				const ranges: Record<string, [number, number]> = {
					'0-50000': [0, 50000],
					'50000-100000': [50000, 100000],
					'100000-200000': [100000, 200000],
					'200000+': [200000, 9999999]
				};
				const [min, max] = ranges[priceRange] || [0, 9999999];
				filter += ` && price >= ${min} && price <= ${max}`;
			}

			// 品牌筛选
			if (selectedBrands.length > 0) {
				const brandFilters = selectedBrands.map((brand) => `brand = "${brand}"`).join(' || ');
				filter += ` && (${brandFilters})`;
			}

			// 库存筛选
			if (showOnlyInStock) {
				filter += ` && inStock = true`;
			}

			// 构建排序
			let sort = '-created';
			switch (sortBy) {
				case 'price-low':
					sort = 'price';
					break;
				case 'price-high':
					sort = '-price';
					break;
				case 'popular':
					sort = '-reviews';
					break;
				case 'rating':
					sort = '-rating';
					break;
				default:
					sort = '-created'; // 新着順
			}

			// 获取商品数据
			const result = await pb.collection('products').getList(currentPage, perPage, {
				filter,
				sort
			});

			products = result.items;
			totalItems = result.totalItems;
			totalPages = result.totalPages;
		} catch (error) {
			console.error('加载商品失败:', error);
			products = [];
			totalItems = 0;
			totalPages = 1;
		}
	}

	// 格式化价格
	function formatPrice(price: number) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			maximumFractionDigits: 0
		}).format(price);
	}

	// 获取商品图片URL
	function getProductImageUrl(product: RecordModel) {
		if (product.image) {
			return product.image;
		} else if (product.images && product.images.length > 0) {
			return product.images[0];
		}
		return '/images/placeholder.jpg';
	}

	// 获取分类图片URL
	function getCategoryImageUrl(category: RecordModel) {
		if (category.icon) {
			return category.icon;
		}
		return '/icons/default-category.svg';
	}

	// 添加到购物车
	function addToCart(product: RecordModel, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('添加到购物车:', product.name_ja);
	}

	// 收藏商品
	function addToWishlist(product: RecordModel, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('收藏商品:', product.name_ja);
	}

	// 排序变化
	async function handleSortChange() {
		currentPage = 1;
		await loadProducts();
	}

	// 价格筛选变化
	async function handlePriceChange() {
		currentPage = 1;
		await loadProducts();
	}

	// 品牌筛选变化
	async function handleBrandChange() {
		currentPage = 1;
		await loadProducts();
	}

	// 库存筛选变化
	async function handleStockChange() {
		currentPage = 1;
		await loadProducts();
	}

	// 翻页
	async function goToPage(pageNum: number) {
		if (pageNum < 1 || pageNum > totalPages) return;
		currentPage = pageNum;
		await loadProducts();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div class="min-h-screen bg-white">
	<!-- 面包屑导航 -->
	<div class="border-b border-gray-200 bg-gray-50">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<nav class="py-3">
				<div class="flex items-center text-sm">
					<a href="/" class="text-gray-600 hover:text-gray-900">ホーム</a>
					<svg
						class="mx-2 h-3 w-3 text-gray-400"
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
					<span class="font-medium text-gray-900">{currentCategory?.name || 'カテゴリー'}</span>
				</div>
			</nav>
		</div>
	</div>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<!-- 页面头部 -->
		<div class="mb-8">
			<div class="mb-6 flex items-center gap-4">
				<div class="rounded-xl bg-gray-100 p-3">
					{#if currentCategory?.icon}
						<img
							src={getCategoryImageUrl(currentCategory)}
							alt={currentCategory.name}
							class="h-10 w-10 object-contain"
						/>
					{:else}
						<div class="flex h-10 w-10 items-center justify-center text-gray-400">
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
						</div>
					{/if}
				</div>
				<div class="flex-1">
					<h1 class="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
						{currentCategory?.name || '商品一覧'}
					</h1>
					<p class="text-gray-600">
						{currentCategory?.name}の人気商品をチェックしましょう
					</p>
				</div>
			</div>

			<!-- 子分类导航 -->
			{#if subcategories.length > 0}
				<div class="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
					<a
						href="/category/{mainId}"
						class="rounded-lg border px-4 py-2 whitespace-nowrap transition-colors {!page.params
							.childId
							? 'border-gray-900 bg-gray-900 text-white'
							: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
					>
						すべて
					</a>
					{#each subcategories as subcategory}
						<a
							href="/category/{mainId}/{subcategory.id}"
							class="rounded-lg border px-4 py-2 whitespace-nowrap transition-colors {page.params
								.childId === subcategory.id
								? 'border-gray-900 bg-gray-900 text-white'
								: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
						>
							{subcategory.name}
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex flex-col gap-8 lg:flex-row">
			<!-- 侧边栏筛选 -->
			<aside class="flex-shrink-0 lg:w-64">
				<div class="sticky top-6 space-y-6">
					<!-- 价格筛选 -->
					<div class="rounded-lg border border-gray-200 bg-white">
						<div class="border-b border-gray-200 p-4">
							<h3 class="font-semibold text-gray-900">価格帯</h3>
						</div>
						<div class="space-y-3 p-4">
							<label class="flex cursor-pointer items-center">
								<input
									type="radio"
									name="price"
									value="all"
									bind:group={priceRange}
									onchange={handlePriceChange}
									class="h-4 w-4 text-gray-900"
								/>
								<span class="ml-2 text-gray-700">すべて</span>
							</label>
							<label class="flex cursor-pointer items-center">
								<input
									type="radio"
									name="price"
									value="0-50000"
									bind:group={priceRange}
									onchange={handlePriceChange}
									class="h-4 w-4 text-gray-900"
								/>
								<span class="ml-2 text-gray-700">¥0 - ¥50,000</span>
							</label>
							<label class="flex cursor-pointer items-center">
								<input
									type="radio"
									name="price"
									value="50000-100000"
									bind:group={priceRange}
									onchange={handlePriceChange}
									class="h-4 w-4 text-gray-900"
								/>
								<span class="ml-2 text-gray-700">¥50,000 - ¥100,000</span>
							</label>
							<label class="flex cursor-pointer items-center">
								<input
									type="radio"
									name="price"
									value="100000-200000"
									bind:group={priceRange}
									onchange={handlePriceChange}
									class="h-4 w-4 text-gray-900"
								/>
								<span class="ml-2 text-gray-700">¥100,000 - ¥200,000</span>
							</label>
							<label class="flex cursor-pointer items-center">
								<input
									type="radio"
									name="price"
									value="200000+"
									bind:group={priceRange}
									onchange={handlePriceChange}
									class="h-4 w-4 text-gray-900"
								/>
								<span class="ml-2 text-gray-700">¥200,000以上</span>
							</label>
						</div>
					</div>

					<!-- 品牌筛选 -->
					{#if availableBrands.length > 0}
						<div class="rounded-lg border border-gray-200 bg-white">
							<div class="border-b border-gray-200 p-4">
								<h3 class="font-semibold text-gray-900">ブランド</h3>
							</div>
							<div class="max-h-80 space-y-3 overflow-y-auto p-4">
								{#each availableBrands as brand}
									<label class="flex cursor-pointer items-center">
										<input
											type="checkbox"
											value={brand}
											bind:group={selectedBrands}
											onchange={handleBrandChange}
											class="h-4 w-4 rounded border-gray-300 text-gray-900"
										/>
										<span class="ml-2 text-gray-700">{brand}</span>
									</label>
								{/each}
							</div>
						</div>
					{/if}

					<!-- 库存筛选 -->
					<div class="rounded-lg border border-gray-200 bg-white p-4">
						<label class="flex cursor-pointer items-center">
							<input
								type="checkbox"
								bind:checked={showOnlyInStock}
								onchange={handleStockChange}
								class="h-4 w-4 rounded border-gray-300 text-gray-900"
							/>
							<span class="ml-2 text-gray-700">在庫ありのみ表示</span>
						</label>
					</div>
				</div>
			</aside>

			<!-- 主内容区 -->
			<div class="flex-1">
				<!-- 排序和统计 -->
				<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div class="text-gray-600">
						{#if totalItems > 0}
							全 <span class="font-semibold">{totalItems}</span> 件の商品
						{/if}
					</div>
					<div class="flex items-center gap-3">
						<select
							bind:value={sortBy}
							onchange={handleSortChange}
							class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
						>
							<option value="newest">新着順</option>
							<option value="price-low">価格が安い順</option>
							<option value="price-high">価格が高い順</option>
							<option value="popular">人気順</option>
							<option value="rating">評価順</option>
						</select>
					</div>
				</div>

				<!-- 加载状态 -->
				{#if isLoading}
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each Array(8) as _}
							<div class="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
								<div class="mb-4 h-48 rounded-lg bg-gray-200"></div>
								<div class="mb-2 h-4 rounded bg-gray-200"></div>
								<div class="mb-4 h-3 w-3/4 rounded bg-gray-200"></div>
								<div class="h-6 w-1/2 rounded bg-gray-200"></div>
							</div>
						{/each}
					</div>
				{:else if products.length === 0}
					<div class="flex flex-col items-center justify-center py-20">
						<svg
							class="mb-4 h-24 w-24 text-gray-300"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1"
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
						<h3 class="mb-2 text-lg font-medium text-gray-900">商品が見つかりませんでした</h3>
						<p class="text-gray-600">フィルター条件を変更してみてください</p>
					</div>
				{:else}
					<!-- 商品网格 -->
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each products as product}
							<a
								href="/product/{product.id}"
								class="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg"
							>
								<!-- 商品图片 -->
								<div class="relative overflow-hidden bg-gray-100">
									<img
										src={getProductImageUrl(product)}
										alt={product.name_ja || product.name}
										class="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
										loading="lazy"
									/>

									<!-- 标签 -->
									<div class="absolute top-3 left-3 flex flex-col gap-2">
										{#if product.discount > 0}
											<span class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
												-{product.discount}%
											</span>
										{/if}
										{#if product.isNew}
											<span class="rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">
												NEW
											</span>
										{/if}
										{#if product.isHot}
											<span class="rounded bg-orange-600 px-2 py-1 text-xs font-bold text-white">
												HOT
											</span>
										{/if}
									</div>

									<!-- 收藏按钮 -->
									<button
										onclick={(e) => addToWishlist(product, e)}
										class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white"
										aria-label="お気に入りに追加"
									>
										<svg
											class="h-5 w-5 text-gray-600"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.5"
												d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
											/>
										</svg>
									</button>

									<!-- 缺货标记 -->
									{#if !product.inStock}
										<div class="absolute inset-0 flex items-center justify-center bg-black/50">
											<span class="text-sm font-semibold text-white">SOLD OUT</span>
										</div>
									{/if}
								</div>

								<!-- 商品信息 -->
								<div class="p-4">
									<!-- 品牌 -->
									{#if product.brand}
										<div class="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
											{product.brand}
										</div>
									{/if}

									<!-- 评价 -->
									<div class="mb-2 flex items-center gap-1">
										<div class="flex">
											{#each Array(5) as _, i}
												<svg
													class="h-4 w-4 {i < Math.floor(product.rating || 0)
														? 'fill-current text-yellow-400'
														: 'text-gray-300'}"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											{/each}
										</div>
										<span class="ml-1 text-sm text-gray-600"
											>{(product.rating || 0).toFixed(1)}</span
										>
										<span class="text-sm text-gray-400">({product.reviews || 0})</span>
									</div>

									<!-- 商品名 -->
									<h3 class="mb-2 line-clamp-2 font-medium text-gray-900 group-hover:text-gray-700">
										{product.name_ja || product.name}
									</h3>

									<!-- 价格 -->
									<div class="mb-4 flex items-center gap-2">
										<span class="text-lg font-bold text-gray-900">
											{formatPrice(product.price)}
										</span>
										{#if product.originalPrice > product.price}
											<span class="text-sm text-gray-500 line-through">
												{formatPrice(product.originalPrice)}
											</span>
										{/if}
									</div>

									<!-- 标签 -->
									{#if product.tags && product.tags.length > 0}
										<div class="mb-4 flex flex-wrap gap-1">
											{#each product.tags.slice(0, 3) as tag}
												<span
													class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
												>
													{tag}
												</span>
											{/each}
										</div>
									{/if}

									<!-- 添加到购物车按钮 -->
									<button
										onclick={(e) => addToCart(product, e)}
										class="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
										disabled={!product.inStock}
									>
										{#if product.inStock}
											カートに追加
										{:else}
											売り切れ
										{/if}
									</button>
								</div>
							</a>
						{/each}
					</div>

					<!-- 分页 -->
					{#if totalPages > 1}
						<div class="mt-8 flex justify-center">
							<nav class="flex items-center gap-2">
								<button
									onclick={() => goToPage(currentPage - 1)}
									disabled={currentPage === 1}
									class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

								{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
									if (totalPages <= 5) return i + 1;
									if (currentPage <= 3) return i + 1;
									if (currentPage >= totalPages - 2) return totalPages - 4 + i;
									return currentPage - 2 + i;
								}) as pageNum}
									<button
										onclick={() => goToPage(pageNum)}
										class="flex h-10 w-10 items-center justify-center rounded-lg font-medium transition-colors {currentPage ===
										pageNum
											? 'bg-gray-900 text-white'
											: 'border border-gray-300 text-gray-700 hover:bg-gray-50'}"
									>
										{pageNum}
									</button>
								{/each}

								<button
									onclick={() => goToPage(currentPage + 1)}
									disabled={currentPage === totalPages}
									class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
							</nav>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</main>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
