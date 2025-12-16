<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// 商品数据结构
	interface Product {
		id: number;
		name: string;
		description: string;
		price: number;
		originalPrice?: number;
		category: string;
		stock: number;
		rating: number;
		image: string;
		brand: string;
		isNew: boolean;
		isFeatured: boolean;
		createdAt: string;
	}

	// 品牌数据结构
	interface Brand {
		id: number;
		name: string;
		logo: string;
		productCount: number;
		description: string;
	}

	// 过滤条件接口
	interface Filters {
		search: string;
		category: string;
		minPrice: number | null;
		maxPrice: number | null;
		inStockOnly: boolean;
		sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'name';
	}

	// 模拟商品数据
	let products: Product[] = [
		{
			id: 1,
			name: 'Premium Wireless Headphones',
			description: '高音質ノイズキャンセリングヘッドフォン',
			price: 29800,
			originalPrice: 39800,
			category: 'オーディオ',
			stock: 15,
			rating: 4.5,
			image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
			brand: 'AudioTech',
			isNew: true,
			isFeatured: true,
			createdAt: '2024-01-15'
		},
		{
			id: 2,
			name: 'スマートウォッチ Pro',
			description: '健康管理機能搭載の高精度スマートウォッチ',
			price: 34800,
			originalPrice: 42800,
			category: 'ウェアラブル',
			stock: 8,
			rating: 4.2,
			image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
			brand: 'TechWear',
			isNew: false,
			isFeatured: true,
			createdAt: '2024-01-10'
		},
		{
			id: 3,
			name: 'ノートパソコン Ultrabook',
			description: '軽量・高性能なビジネスノートパソコン',
			price: 129800,
			originalPrice: 159800,
			category: 'PC',
			stock: 5,
			rating: 4.7,
			image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
			brand: 'TechPro',
			isNew: true,
			isFeatured: true,
			createdAt: '2024-01-20'
		},
		{
			id: 4,
			name: 'デジタルカメラ Mirrorless',
			description: 'フルサイズセンサー搭載ミラーレスカメラ',
			price: 198000,
			originalPrice: 248000,
			category: 'カメラ',
			stock: 12,
			rating: 4.8,
			image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
			brand: 'PhotoMaster',
			isNew: false,
			isFeatured: false,
			createdAt: '2023-12-05'
		},
		{
			id: 5,
			name: 'ワイヤレスイヤホン',
			description: '完全ワイヤレスイヤホン with 充電ケース',
			price: 15800,
			category: 'オーディオ',
			stock: 25,
			rating: 4.3,
			image: 'https://images.unsplash.com/photo-1590658165737-15a047b8b5e6?w=400&q=80',
			brand: 'SoundWave',
			isNew: true,
			isFeatured: false,
			createdAt: '2024-01-18'
		},
		{
			id: 6,
			name: 'ゲーミングマウス',
			description: '高精度センサー搭載ゲーミングマウス',
			price: 7800,
			originalPrice: 9800,
			category: 'PCアクセサリー',
			stock: 30,
			rating: 4.4,
			image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
			brand: 'GameGear',
			isNew: false,
			isFeatured: false,
			createdAt: '2023-11-20'
		},
		{
			id: 7,
			name: 'タブレット Air',
			description: '薄型軽量タブレット with スタイラスペン',
			price: 59800,
			originalPrice: 69800,
			category: 'タブレット',
			stock: 7,
			rating: 4.6,
			image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
			brand: 'TechPro',
			isNew: true,
			isFeatured: true,
			createdAt: '2024-01-12'
		},
		{
			id: 8,
			name: 'Bluetoothスピーカー',
			description: '防水対応 ポータブルBluetoothスピーカー',
			price: 12800,
			category: 'オーディオ',
			stock: 20,
			rating: 4.1,
			image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',
			brand: 'AudioTech',
			isNew: false,
			isFeatured: false,
			createdAt: '2023-12-15'
		}
	];

	// 模拟品牌数据
	let brands: Brand[] = [
		{
			id: 1,
			name: 'AudioTech',
			logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80',
			productCount: 42,
			description: '高音質オーディオ機器のトップブランド'
		},
		{
			id: 2,
			name: 'TechPro',
			logo: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&q=80',
			productCount: 38,
			description: 'プロフェッショナル向けテクノロジーブランド'
		},
		{
			id: 3,
			name: 'PhotoMaster',
			logo: 'https://images.unsplash.com/photo-1568914274555-8c5c5d09763a?w=200&q=80',
			productCount: 25,
			description: 'カメラと写真機器の専門メーカー'
		},
		{
			id: 4,
			name: 'SoundWave',
			logo: 'https://images.unsplash.com/photo-1599661046282-543460ca5b4f?w=200&q=80',
			productCount: 18,
			description: 'モダンなデザインのオーディオ機器'
		},
		{
			id: 5,
			name: 'GameGear',
			logo: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&q=80',
			productCount: 31,
			description: 'ゲーミングギアの専門ブランド'
		},
		{
			id: 6,
			name: 'TechWear',
			logo: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&q=80',
			productCount: 22,
			description: 'ウェアラブルテクノロジーの先駆者'
		}
	];

	// 状态变量
	let filters: Filters = {
		search: '',
		category: 'all',
		minPrice: null,
		maxPrice: null,
		inStockOnly: false,
		sortBy: 'newest'
	};

	let isLoading = false;
	let currentPage = 1;
	const itemsPerPage = 8;

	// 计算分类列表
	const categories = ['all', ...new Set(products.map((p) => p.category))];

	// 获取URL参数
	$: {
		const params = new URLSearchParams(window.location.search);
		filters.search = params.get('q') || '';
		filters.category = params.get('category') || 'all';
		filters.sortBy = (params.get('sort') as Filters['sortBy']) || 'newest';
	}

	// 过滤和排序商品
	$: filteredProducts = products.filter((product) => {
		// 搜索过滤（商品名、描述、品牌）
		if (
			filters.search &&
			!product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
			!product.description.toLowerCase().includes(filters.search.toLowerCase()) &&
			!product.brand.toLowerCase().includes(filters.search.toLowerCase())
		) {
			return false;
		}

		// 分类过滤
		if (filters.category !== 'all' && product.category !== filters.category) {
			return false;
		}

		// 价格范围过滤
		if (filters.minPrice !== null && product.price < filters.minPrice) {
			return false;
		}
		if (filters.maxPrice !== null && product.price > filters.maxPrice) {
			return false;
		}

		// 库存过滤
		if (filters.inStockOnly && product.stock === 0) {
			return false;
		}

		return true;
	});

	// 过滤品牌
	$: filteredBrands = brands.filter((brand) => {
		if (filters.search && !brand.name.toLowerCase().includes(filters.search.toLowerCase())) {
			return false;
		}
		return true;
	});

	// 排序商品
	$: sortedProducts = [...filteredProducts].sort((a, b) => {
		switch (filters.sortBy) {
			case 'price_asc':
				return a.price - b.price;
			case 'price_desc':
				return b.price - a.price;
			case 'rating':
				return b.rating - a.rating;
			case 'name':
				return a.name.localeCompare(b.name);
			case 'newest':
			default:
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		}
	});

	// 分页
	$: paginatedProducts = sortedProducts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	$: totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

	// 搜索处理
	function handleSearch() {
		currentPage = 1;
		// 更新URL参数
		const params = new URLSearchParams();
		if (filters.search) params.set('q', filters.search);
		if (filters.category !== 'all') params.set('category', filters.category);
		if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy);

		const newUrl = `${window.location.pathname}?${params.toString()}`;
		window.history.pushState({}, '', newUrl);
	}

	// 重置过滤条件
	function resetFilters() {
		filters = {
			search: '',
			category: 'all',
			minPrice: null,
			maxPrice: null,
			inStockOnly: false,
			sortBy: 'newest'
		};
		currentPage = 1;

		const newUrl = window.location.pathname;
		window.history.pushState({}, '', newUrl);
	}

	// 初始化
	onMount(() => {
		// 如果有URL参数，执行搜索
		if (filters.search || filters.category !== 'all') {
			handleSearch();
		}
	});
</script>

<main class="min-h-screen bg-white">
	<!-- 搜索栏 -->
	<div class="border-b border-gray-100 bg-gray-50">
		<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<!-- 标题 -->
			<div class="mb-8">
				<h1 class="mb-3 text-3xl font-light text-gray-900">商品一覧</h1>
				<p class="text-gray-600">多彩な商品の中からお探しの商品を見つけましょう</p>
			</div>

			<!-- 搜索框 -->
			<div class="mb-6">
				<div class="relative">
					<svg
						class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						type="text"
						placeholder="商品名、ブランド、キーワードで検索..."
						bind:value={filters.search}
						on:input={handleSearch}
						class="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-12 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-gray-400"
					/>
				</div>
			</div>

			<!-- 过滤条件 -->
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div class="flex flex-wrap items-center gap-3">
					<!-- 分类筛选 -->
					<select
						bind:value={filters.category}
						on:change={handleSearch}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-gray-400"
					>
						<option value="all">すべてのカテゴリー</option>
						{#each categories as category}
							{#if category !== 'all'}
								<option value={category}>{category}</option>
							{/if}
						{/each}
					</select>

					<!-- 排序方式 -->
					<select
						bind:value={filters.sortBy}
						on:change={handleSearch}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-gray-400"
					>
						<option value="newest">新着順</option>
						<option value="name">名前順</option>
						<option value="price_asc">価格が安い順</option>
						<option value="price_desc">価格が高い順</option>
						<option value="rating">評価が高い順</option>
					</select>

					<!-- 在库过滤 -->
					<label class="flex cursor-pointer items-center space-x-2">
						<input
							type="checkbox"
							bind:checked={filters.inStockOnly}
							on:change={handleSearch}
							class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
						/>
						<span class="text-sm text-gray-700">在庫ありのみ</span>
					</label>
				</div>

				<div class="flex items-center gap-3">
					<!-- 搜索结果统计 -->
					<span class="text-sm text-gray-600">
						{filteredProducts.length}件の商品が見つかりました
					</span>

					<!-- 重置按钮 -->
					<button
						on:click={resetFilters}
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
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
				<div
					class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-gray-900"
				></div>
			</div>
		{:else}
			<!-- 搜索结果 -->
			{#if filters.search || filteredProducts.length > 0 || filteredBrands.length > 0}
				<!-- 商品搜索结果 -->
				<section class="mb-12">
					<div class="mb-6">
						<h2 class="text-xl font-normal text-gray-900">商品 ({filteredProducts.length})</h2>
						<div class="mt-2 h-px w-16 bg-gray-300"></div>
					</div>

					{#if filteredProducts.length > 0}
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{#each paginatedProducts as product}
								<a
									href="/products/{product.id}"
									class="group overflow-hidden rounded-lg border border-gray-100 bg-white transition-all hover:border-gray-300 hover:shadow-sm"
								>
									<!-- 商品图片 -->
									<div class="relative aspect-square overflow-hidden bg-gray-50">
										<img
											src={product.image}
											alt={product.name}
											class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>
										<!-- 标签 -->
										<div class="absolute top-3 left-3 flex flex-col gap-2">
											{#if product.isNew}
												<span class="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
													NEW
												</span>
											{/if}
											{#if product.isFeatured}
												<span class="rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white">
													FEATURED
												</span>
											{/if}
											{#if product.originalPrice}
												<span class="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
													SALE
												</span>
											{/if}
										</div>

										<!-- 品牌标签 -->
										<div class="absolute top-3 right-3">
											<span
												class="rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm"
											>
												{product.brand}
											</span>
										</div>
									</div>

									<!-- 商品信息 -->
									<div class="p-4">
										<!-- 分类 -->
										<span class="mb-2 block text-xs text-gray-500">{product.category}</span>

										<!-- 商品名 -->
										<h3
											class="mb-2 line-clamp-1 font-normal text-gray-900 transition-colors group-hover:text-gray-600"
										>
											{product.name}
										</h3>

										<!-- 描述 -->
										<p class="mb-3 line-clamp-2 text-sm text-gray-600">
											{product.description}
										</p>

										<!-- 价格 -->
										<div class="mb-3 flex items-center gap-2">
											<span class="text-lg font-normal text-gray-900">
												¥{product.price.toLocaleString()}
											</span>
											{#if product.originalPrice}
												<span class="text-sm text-gray-400 line-through">
													¥{product.originalPrice.toLocaleString()}
												</span>
											{/if}
										</div>

										<!-- 评分和库存 -->
										<div class="flex items-center justify-between text-sm">
											<div class="flex items-center">
												<svg
													class="mr-1 h-4 w-4 text-yellow-400"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
												<span class="text-gray-600">{product.rating.toFixed(1)}</span>
											</div>

											<div class="flex items-center">
												<div
													class={`mr-1 h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}
												></div>
												<span
													class={`text-xs ${product.stock > 0 ? 'text-gray-600' : 'text-red-600'}`}
												>
													{#if product.stock > 0}
														在庫あり
													{:else}
														在庫切れ
													{/if}
												</span>
											</div>
										</div>
									</div>
								</a>
							{/each}
						</div>

						<!-- 分页 -->
						{#if totalPages > 1}
							<div class="mt-8 flex justify-center">
								<nav class="flex items-center gap-2">
									<button
										on:click={() => currentPage > 1 && currentPage--}
										disabled={currentPage === 1}
										class="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
									>
										前へ
									</button>

									{#each Array(totalPages) as _, i}
										<button
											on:click={() => (currentPage = i + 1)}
											class={`rounded-lg border px-3 py-2 transition-colors ${currentPage === i + 1 ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
										>
											{i + 1}
										</button>
									{/each}

									<button
										on:click={() => currentPage < totalPages && currentPage++}
										disabled={currentPage === totalPages}
										class="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
									>
										次へ
									</button>
								</nav>
							</div>
						{/if}
					{:else}
						<!-- 无商品结果 -->
						<div class="py-12 text-center">
							<svg
								class="mx-auto mb-4 h-16 w-16 text-gray-300"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1"
									d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p class="text-gray-600">該当する商品が見つかりませんでした</p>
						</div>
					{/if}
				</section>

				<!-- 品牌搜索结果 -->
				{#if filteredBrands.length > 0}
					<section>
						<div class="mb-6">
							<h2 class="text-xl font-normal text-gray-900">ブランド ({filteredBrands.length})</h2>
							<div class="mt-2 h-px w-16 bg-gray-300"></div>
						</div>

						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{#each filteredBrands as brand}
								<a
									href="/brands/{brand.id}"
									class="group rounded-lg border border-gray-100 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm"
								>
									<div class="flex items-center space-x-4">
										<!-- 品牌Logo -->
										<div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-50">
											<img src={brand.logo} alt={brand.name} class="h-full w-full object-cover" />
										</div>

										<!-- 品牌信息 -->
										<div class="flex-1">
											<h3
												class="mb-1 font-normal text-gray-900 transition-colors group-hover:text-gray-600"
											>
												{brand.name}
											</h3>
											<p class="mb-2 text-sm text-gray-600">
												{brand.description}
											</p>
											<div class="flex items-center text-sm text-gray-500">
												<svg
													class="mr-1 h-4 w-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
													/>
												</svg>
												<span>{brand.productCount}商品</span>
											</div>
										</div>

										<!-- 箭头 -->
										<svg
											class="h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.5"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</a>
							{/each}
						</div>
					</section>
				{/if}
			{:else}
				<!-- 空状态 -->
				<div class="py-20 text-center">
					<svg
						class="mx-auto mb-6 h-20 w-20 text-gray-300"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1"
							d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h3 class="mb-2 text-xl font-normal text-gray-900">商品が見つかりません</h3>
					<p class="mb-6 text-gray-600">検索条件を変更して再度お試しください</p>
					<button
						on:click={resetFilters}
						class="border border-gray-900 px-6 py-3 text-gray-900 transition-colors hover:bg-gray-50"
					>
						すべての条件をリセット
					</button>
				</div>
			{/if}
		{/if}
	</div>
</main>

<style>
	/* 自定义样式 */
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

	/* 滚动条样式 */
	::-webkit-scrollbar {
		width: 8px;
	}

	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 4px;
	}

	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
