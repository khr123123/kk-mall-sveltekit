<script lang="ts">
	import { onMount } from 'svelte';
	import { categoryStore } from '$lib/stores/categoryStore';
	import CategoryService from '$lib/services/categoryService';
	import { searchIcon, imagePlaceholder, starRating, emptyState } from '$lib/icons/svgs';
	import { pb } from '$lib/services/PBConfig';

	// 过滤条件接口
	interface Filters {
		search: string;
		category: string; // 存储分类ID
		minPrice: number | null;
		maxPrice: number | null;
		inStockOnly: boolean;
		sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'name';
	}

	// 状态变量
	let filters: Filters = {
		search: '',
		category: 'all',
		minPrice: null,
		maxPrice: null,
		inStockOnly: false,
		sortBy: 'newest'
	};

	let products: any[] = [];
	let brands: any[] = [];
	let allBrands: any[] = [];
	let isLoading = false;
	let currentPage = 1;
	const itemsPerPage = 8;

	// 分类数据
	let quickCategories: any[] = [];

	// 加载分类数据
	async function loadCategories() {
		try {
			if (!$categoryStore.isLoaded) {
				quickCategories = await CategoryService.getAllCategories();
				categoryStore.setCategories(quickCategories);
			} else {
				quickCategories = $categoryStore.categories;
			}
		} catch (error) {
			console.error('カテゴリーデータの読み込みに失敗:', error);
			quickCategories = [];
		}
	}

	// 从PocketBase加载商品和品牌数据
	async function loadData() {
		try {
			isLoading = true;

			// 构建商品查询条件
			let productFilterParts = [];

			// 搜索过滤
			if (filters.search.trim()) {
				const escapedSearch = filters.search.replace(/"/g, '\\"');
				productFilterParts.push(`(name ~ "${escapedSearch}" || description ~ "${escapedSearch}")`);
			}

			// 分类过滤 (基于分类ID)
			if (filters.category !== 'all') {
				// 这里使用 category_id 字段进行过滤
				productFilterParts.push(`category_id = "${filters.category}"`);
			}

			// 库存过滤
			if (filters.inStockOnly) {
				productFilterParts.push('stock > 0');
			}

			// 价格范围过滤
			if (filters.minPrice !== null) {
				productFilterParts.push(`price >= ${filters.minPrice}`);
			}
			if (filters.maxPrice !== null) {
				productFilterParts.push(`price <= ${filters.maxPrice}`);
			}

			// 构建完整过滤条件
			const productFilter = productFilterParts.length > 0 ? productFilterParts.join(' && ') : '';

			// 加载商品
			const productParams: any = {
				sort: getSortField(filters.sortBy)
			};

			if (productFilter) {
				productParams.filter = productFilter;
			}

			// 使用 getList 替代 getFullList 以支持分页
			const productResult = await pb
				.collection('products')
				.getList(currentPage, itemsPerPage, productParams);
			products = productResult.items;

			// 构建品牌搜索条件
			if (filters.search.trim()) {
				const escapedSearch = filters.search.replace(/"/g, '\\"');
				const brandFilter = `name ~ "${escapedSearch}" || description ~ "${escapedSearch}"`;

				brands = await pb.collection('brands').getFullList({
					filter: brandFilter,
					sort: '-followers'
				});
			} else {
				brands = [];
			}

			// 加载所有品牌用于展示
			if (allBrands.length === 0) {
				allBrands = await pb.collection('brands').getFullList({
					sort: '-followers',
					perPage: 10
				});
			}
		} catch (error) {
			console.error('データの読み込みに失敗:', error);
		} finally {
			isLoading = false;
		}
	}

	// 获取排序字段
	function getSortField(sortBy: string): string {
		switch (sortBy) {
			case 'price_asc':
				return 'price';
			case 'price_desc':
				return '-price';
			case 'rating':
				return '-rating';
			case 'name':
				return 'name';
			case 'newest':
			default:
				return '-created';
		}
	}

	// 高亮关键词
	function highlightText(text: string, searchTerm: string): string {
		if (!searchTerm || !text) return text || '';

		const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
		return text.replace(regex, '<span class="highlight-text">$1</span>');
	}

	// 转义正则表达式特殊字符
	function escapeRegExp(string: string): string {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	// 计算折扣百分比
	function getDiscountPercentage(original: number, current: number): number {
		if (!original || original <= current) return 0;
		return Math.round(((original - current) / original) * 100);
	}

	// 获取分类名称
	function getCategoryName(categoryId: string): string {
		if (categoryId === 'all') return 'すべて';
		const category = quickCategories.find((cat) => cat.id === categoryId);
		return category ? category.name || category.id : categoryId;
	}

	// 搜索处理
	async function handleSearch() {
		currentPage = 1;

		// 更新URL参数
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams();
			if (filters.search) params.set('q', filters.search);
			if (filters.category !== 'all') params.set('category', filters.category);
			if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy);
			if (filters.minPrice !== null) params.set('minPrice', filters.minPrice.toString());
			if (filters.maxPrice !== null) params.set('maxPrice', filters.maxPrice.toString());
			if (filters.inStockOnly) params.set('inStockOnly', 'true');

			const newUrl = `${window.location.pathname}?${params.toString()}`;
			window.history.pushState({}, '', newUrl);
		}

		await loadData();
	}

	// 重置过滤条件
	async function resetFilters() {
		filters = {
			search: '',
			category: 'all',
			minPrice: null,
			maxPrice: null,
			inStockOnly: false,
			sortBy: 'newest'
		};
		currentPage = 1;

		if (typeof window !== 'undefined') {
			const newUrl = window.location.pathname;
			window.history.pushState({}, '', newUrl);
		}

		await loadData();
	}

	// 从URL读取参数
	function loadFiltersFromURL() {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);

			const urlSearch = params.get('q');
			const urlCategory = params.get('category');
			const urlSort = params.get('sort') as Filters['sortBy'];
			const urlMinPrice = params.get('minPrice');
			const urlMaxPrice = params.get('maxPrice');
			const urlInStockOnly = params.get('inStockOnly');

			if (urlSearch !== null) filters.search = urlSearch;
			if (urlCategory !== null) filters.category = urlCategory;
			if (urlSort !== null) filters.sortBy = urlSort;
			if (urlMinPrice !== null) filters.minPrice = parseFloat(urlMinPrice);
			if (urlMaxPrice !== null) filters.maxPrice = parseFloat(urlMaxPrice);
			if (urlInStockOnly !== null) filters.inStockOnly = urlInStockOnly === 'true';
		}
	}

	// 初始化
	onMount(async () => {
		await loadCategories();
		loadFiltersFromURL();
		await loadData();
	});
	// 监听过滤条件变化自动搜索
	$: {
		const categoryChanged = filters.category;
		const sortChanged = filters.sortBy;
		const stockChanged = filters.inStockOnly;

		// 只有在这些条件改变时才重新搜索
		if (categoryChanged || sortChanged || stockChanged) {
			handleSearch();
		}
	}
</script>

<main class="min-h-screen bg-gray-50">
	<!-- 搜索栏 -->
	<div class="border-b border-gray-200 bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
			<!-- 标题 -->
			<div class="mb-8">
				<h1 class="mb-3 text-3xl font-bold text-gray-900">商品検索</h1>
				<p class="text-gray-600">多彩な商品の中からお探しの商品を見つけましょう</p>
			</div>

			<!-- 搜索框 -->
			<div class="mb-6">
				<div class="relative">
					<div class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400">
						{@html searchIcon}
					</div>
					<input
						type="text"
						placeholder="商品名、ブランド、キーワードで検索..."
						bind:value={filters.search}
						on:keyup={(e) => e.key === 'Enter' && handleSearch()}
						class="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 pl-12 text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
					/>
					<button
						on:click={handleSearch}
						class="absolute top-1/2 right-3 -translate-y-1/2 transform rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						検索
					</button>
				</div>
			</div>

			<!-- 过滤条件 -->
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div class="flex flex-wrap items-center gap-3">
					<!-- 分类筛选 -->
					<div class="relative">
						<select
							bind:value={filters.category}
							class="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
						>
							<option value="all">すべてのカテゴリー</option>
							{#each quickCategories as category}
								<option value={category.id}>{category.name || category.id}</option>
							{/each}
						</select>
					</div>

					<!-- 价格范围 -->
					<div class="flex items-center gap-2">
						<input
							type="number"
							bind:value={filters.minPrice}
							placeholder="最低価格"
							class="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
						/>
						<span class="text-gray-400">〜</span>
						<input
							type="number"
							bind:value={filters.maxPrice}
							placeholder="最高価格"
							class="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
						/>
					</div>

					<!-- 排序方式 -->
					<div class="relative">
						<select
							bind:value={filters.sortBy}
							class="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
						>
							<option value="newest">新着順</option>
							<option value="name">名前順</option>
							<option value="price_asc">価格が安い順</option>
							<option value="price_desc">価格が高い順</option>
							<option value="rating">評価が高い順</option>
						</select>
					</div>

					<!-- 在库过滤 -->
					<label
						class="inline-flex cursor-pointer items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all duration-200 hover:bg-gray-50"
					>
						<input
							type="checkbox"
							bind:checked={filters.inStockOnly}
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						/>
						<span class="text-gray-700">在庫ありのみ</span>
					</label>
				</div>

				<div class="flex items-center gap-3">
					<!-- 搜索结果统计 -->
					<span class="text-sm text-gray-600">
						{products.length}件の商品が見つかりました
					</span>

					<!-- 重置按钮 -->
					<button
						on:click={resetFilters}
						class="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none"
					>
						条件をリセット
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- 主要内容区 -->
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{#if isLoading}
			<!-- 加载状态 -->
			<div class="flex items-center justify-center py-20">
				<div class="relative">
					<div
						class="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
					></div>
					<span
						class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-gray-600"
						>読み込み中...</span
					>
				</div>
			</div>
		{:else if products.length > 0}
			<!-- 商品搜索结果 -->
			<section class="mb-12">
				<div class="mb-6">
					<h2 class="text-xl font-semibold text-gray-900">検索結果 ({products.length})</h2>
					{#if filters.category !== 'all'}
						<p class="mt-2 text-sm text-gray-600">
							カテゴリー: <span class="font-medium">{getCategoryName(filters.category)}</span>
						</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each products as product (product.id)}
						<a
							href="/product/{product.id}"
							class="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
						>
							<!-- 商品图片 -->
							<div class="relative aspect-square overflow-hidden bg-gray-50">
								{#if product.image}
									<img
										src={product.image}
										alt={product.name || '商品画像'}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								{:else}
									<div
										class="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300"
									>
										{@html imagePlaceholder}
									</div>
								{/if}

								<!-- 标签 -->
								<div class="absolute top-3 left-3 flex flex-col gap-2">
									{#if product.isNew}
										<span class="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
											新着
										</span>
									{/if}
									{#if product.isHot}
										<span class="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
											HOT
										</span>
									{/if}
									{#if product.originalPrice && product.originalPrice > product.price}
										<span
											class="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white"
										>
											{getDiscountPercentage(product.originalPrice, product.price)}% OFF
										</span>
									{/if}
								</div>

								<!-- 库存状态 -->
								{#if !product.stock || product.stock === 0}
									<div class="absolute inset-0 flex items-center justify-center bg-black/60">
										<span
											class="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 backdrop-blur-sm"
										>
											売り切れ
										</span>
									</div>
								{/if}
							</div>

							<!-- 商品信息 -->
							<div class="p-5">
								<!-- 分类 -->
								{#if product.category_id && quickCategories.length > 0}
									{@const category = quickCategories.find((c) => c.id === product.category_id)}
									{#if category}
										<span
											class="mb-2 inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
										>
											{category.name || category.id}
										</span>
									{/if}
								{/if}

								<!-- 商品名（关键词高亮） -->
								<h3 class="mb-2 line-clamp-1 text-lg font-semibold text-gray-900">
									{@html filters.search
										? highlightText(product.name, filters.search)
										: product.name || ''}
								</h3>

								<!-- 描述（关键词高亮） -->
								{#if product.description}
									<p class="mb-4 line-clamp-2 text-sm text-gray-600">
										{@html filters.search
											? highlightText(product.description, filters.search)
											: product.description}
									</p>
								{/if}

								<!-- 评分 -->
								{#if product.rating}
									<div class="mb-4 flex items-center">
										<div class="flex">
											{#each Array(5) as _, i}
												<div
													class={i < Math.floor(product.rating || 0)
														? 'text-yellow-400'
														: 'text-gray-300'}
												>
													{@html starRating}
												</div>
											{/each}
										</div>
										<span class="ml-2 text-sm font-medium text-gray-900"
											>{product.rating?.toFixed(1)}</span
										>
										{#if product.reviews}
											<span class="ml-1 text-sm text-gray-500">({product.reviews})</span>
										{/if}
									</div>
								{/if}

								<!-- 价格 -->
								<div class="mb-4 flex items-baseline gap-2">
									<span class="text-2xl font-bold text-gray-900">
										¥{(product.price || 0).toLocaleString('ja-JP')}
									</span>
									{#if product.originalPrice && product.originalPrice > product.price}
										<span class="text-sm text-gray-400 line-through">
											¥{product.originalPrice.toLocaleString('ja-JP')}
										</span>
									{/if}
								</div>

								<!-- 库存信息 -->
								<div class="flex items-center justify-between">
									<div class="flex items-center">
										<div
											class={`mr-2 h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}
										></div>
										<span class={`text-sm ${product.stock > 0 ? 'text-gray-600' : 'text-red-600'}`}>
											{#if product.stock > 0}
												{product.stock}個在庫
											{:else}
												在庫切れ
											{/if}
										</span>
									</div>
									<button
										on:click|preventDefault={(e) => {
											e.stopPropagation();
											console.log('カートに追加:', product.name);
										}}
										disabled={!product.stock || product.stock === 0}
										class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
									>
										カートに追加
									</button>
								</div>
							</div>
						</a>
					{/each}
				</div>

				<!-- 分页 -->
				<div class="mt-8 flex items-center justify-between">
					<div class="text-sm text-gray-600">
						表示中: {(currentPage - 1) * itemsPerPage + 1} - {Math.min(
							currentPage * itemsPerPage,
							products.length
						)}件
					</div>
					<nav class="flex items-center gap-2">
						<button
							on:click={() => currentPage > 1 && currentPage--}
							disabled={currentPage === 1}
							class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							前へ
						</button>

						{#each Array.from({ length: 5 }, (_, i) => i + 1) as pageNum}
							<button
								on:click={() => (currentPage = pageNum)}
								class={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
									currentPage === pageNum
										? 'bg-blue-600 text-white'
										: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
								}`}
							>
								{pageNum}
							</button>
						{/each}

						<button
							on:click={() => currentPage++}
							class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
						>
							次へ
						</button>
					</nav>
				</div>
			</section>

			<!-- 品牌搜索结果 -->
			{#if brands.length > 0}
				<section class="mb-12">
					<div class="mb-6">
						<h2 class="text-xl font-semibold text-gray-900">関連ブランド ({brands.length})</h2>
					</div>

					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{#each brands as brand (brand.id)}
							<a
								href="/brands/{brand.id}"
								class="group overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
							>
								<div class="flex flex-col items-center text-center">
									<!-- 品牌Logo -->
									<div
										class="mb-4 h-20 w-20 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3"
									>
										{#if brand.logo}
											<img
												src={brand.logo}
												alt={brand.name || 'ブランドロゴ'}
												class="h-full w-full object-contain"
											/>
										{:else}
											<div class="flex h-full w-full items-center justify-center">
												<span class="text-3xl font-bold text-gray-300"
													>{brand.name?.charAt(0) || '?'}</span
												>
											</div>
										{/if}
									</div>

									<!-- 品牌信息 -->
									<h3 class="mb-2 font-semibold text-gray-900">
										{@html filters.search
											? highlightText(brand.name, filters.search)
											: brand.name || ''}
									</h3>

									{#if brand.description}
										<p class="mb-4 line-clamp-2 text-sm text-gray-600">
											{@html filters.search
												? highlightText(brand.description, filters.search)
												: brand.description}
										</p>
									{/if}

									<div class="flex items-center gap-4 text-sm">
										{#if brand.followers}
											<span class="flex items-center gap-1 text-gray-500">
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
													/>
												</svg>
												{brand.followers.toLocaleString('ja-JP')}
											</span>
										{/if}
										{#if brand.rating}
											<span class="flex items-center gap-1 text-gray-500">
												<svg
													class="h-4 w-4 text-yellow-400"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
												{brand.rating.toFixed(1)}
											</span>
										{/if}
									</div>
								</div>
							</a>
						{/each}
					</div>
				</section>
			{/if}
		{:else}
			<!-- 空状态 -->
			<div class="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
				<div class="mb-6 text-gray-300">
					{@html emptyState}
				</div>
				<h3 class="mb-2 text-xl font-semibold text-gray-900">商品が見つかりませんでした</h3>
				<p class="mb-6 max-w-md text-gray-600">
					{#if filters.search}
						「{filters.search}」に該当する商品が見つかりませんでした。
					{:else if filters.category !== 'all'}
						{getCategoryName(filters.category)}カテゴリーの商品が見つかりませんでした。
					{:else}
						現在、表示できる商品がありません。
					{/if}
				</p>

				<!-- 推荐品牌 -->
				{#if allBrands.length > 0}
					<div class="mb-8 w-full max-w-2xl">
						<h4 class="mb-4 text-lg font-medium text-gray-900">おすすめブランド</h4>
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
							{#each allBrands.slice(0, 5) as brand}
								<a
									href="/brands/{brand.id}"
									class="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
								>
									<div class="mb-2 h-12 w-12 overflow-hidden rounded-full bg-gray-100">
										{#if brand.logo}
											<img src={brand.logo} alt={brand.name} class="h-full w-full object-cover" />
										{:else}
											<div class="flex h-full w-full items-center justify-center">
												<span class="text-lg font-bold text-gray-400"
													>{brand.name?.charAt(0) || '?'}</span
												>
											</div>
										{/if}
									</div>
									<span class="text-sm font-medium text-gray-900">{brand.name}</span>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<button
					on:click={resetFilters}
					class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					すべての条件をリセット
				</button>
			</div>
		{/if}
	</div>
</main>

<style>
	/* 关键词高亮样式 */
	:global(.highlight-text) {
		background-color: #fef3c2; /* bg-yellow-100 */
		color: #dc2626; /* text-red-600 */
		font-weight: 500; /* font-medium */
		padding-left: 0.125rem; /* px-0.5 */
		padding-right: 0.125rem; /* px-0.5 */
		border-radius: 0.25rem; /* rounded */
	}

	/* 平滑过渡 */
	.transition-all {
		transition: all 0.2s ease-in-out;
	}

	.transition-colors {
		transition:
			background-color 0.2s ease-in-out,
			border-color 0.2s ease-in-out,
			color 0.2s ease-in-out;
	}

	.transition-transform {
		transition: transform 0.3s ease-in-out;
	}

	/* 文本截断 */
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;

		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* 动画 */
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
