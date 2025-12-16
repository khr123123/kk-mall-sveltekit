<script lang="ts">
	// Mock热门商品数据
	function generateHotProducts(count: number) {
		const products = [];
		const titles = [
			'iPhone 15 Pro Max 256GB',
			'MacBook Pro 16インチ M3',
			'AirPods Pro 第2世代',
			'iPad Air 第5世代',
			'Apple Watch Series 9',
			'Sony WH-1000XM5',
			'Nintendo Switch OLED',
			'PlayStation 5',
			'Samsung Galaxy S24 Ultra',
			'Dyson V15 掃除機',
			'バルミューダ トースター',
			'ブラーバ ロボット掃除機',
			'UNIQLO ウルトラライトダウン',
			'Nike Air Max 90',
			'資生堂 エリクシール'
		];

		for (let i = 0; i < count; i++) {
			products.push({
				id: i + 1,
				title: titles[i % titles.length],
				image: '/svgs/goods.svg',
				price: Math.floor(((i % 10) + 3) * 10000),
				sales: Math.floor(((i % 10) + 10) * 10000),
				rating: (4.5 + (i % 5) * 0.1).toFixed(1),
				reviews: Math.floor(((i % 10) + 5) * 1000),
				trend: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'stable',
				rank: i + 1,
				hotScore: 100 - i * 2
			});
		}
		return products;
	}

	let hotProducts = generateHotProducts(50);
	let selectedCategory = 'all';
	let viewMode = 'grid'; // grid or list

	const categories = [
		{ id: 'all', name: 'すべて', icon: '🔥' },
		{ id: 'electronics', name: 'デジタル', icon: '📱' },
		{ id: 'fashion', name: 'ファッション', icon: '👕' },
		{ id: 'home', name: 'ホーム', icon: '🏠' },
		{ id: 'beauty', name: '美容', icon: '💄' }
	];
</script>

<main class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<!-- 页面标题 -->
		<div class="mb-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-sm sm:p-8">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<svg class="h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
					</svg>
					<div>
						<h1 class="mb-1 text-2xl font-bold sm:text-3xl">急上昇ランキング</h1>
						<p class="text-sm text-white/90 sm:text-base">今人気の商品をチェック</p>
					</div>
				</div>

				<!-- 视图切换 -->
				<div class="hidden sm:flex gap-2 rounded-lg bg-white/20 p-1">
					<button
						class="rounded px-3 py-1.5 text-sm transition-all {viewMode === 'grid' ? 'bg-white text-orange-500' : 'text-white hover:bg-white/10'}"
						on:click={() => viewMode = 'grid'}
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
					</button>
					<button
						class="rounded px-3 py-1.5 text-sm transition-all {viewMode === 'list' ? 'bg-white text-orange-500' : 'text-white hover:bg-white/10'}"
						on:click={() => viewMode = 'list'}
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- 分类标签 -->
		<div class="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
			<div class="flex flex-wrap gap-2">
				{#each categories as category}
					<button
						class="rounded-lg px-4 py-2 text-sm font-medium transition-all {selectedCategory === category.id
							? 'bg-gray-900 text-white'
							: 'bg-gray-50 text-gray-700 hover:bg-gray-100'}"
						on:click={() => selectedCategory = category.id}
					>
						<span class="mr-1">{category.icon}</span>
						{category.name}
					</button>
				{/each}
			</div>
		</div>

		<!-- 列表视图 -->
		{#if viewMode === 'list'}
			<div class="space-y-3">
				{#each hotProducts as product (product.id)}
					<a
						href="/product/{product.id}"
						class="group flex items-center gap-4 overflow-hidden rounded-xl bg-white p-4 no-underline shadow-sm transition-all duration-300 hover:shadow-lg"
					>
						<!-- 排名 -->
						<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-xl font-bold {product.rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-gray-100 text-gray-600'}">
							{product.rank}
						</div>

						<!-- 商品图片 -->
						<div class="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
							<img
								src={product.image}
								alt={product.title}
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
								loading="lazy"
							/>
						</div>

						<!-- 商品信息 -->
						<div class="flex-1 min-w-0">
							<h3 class="mb-1 text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600">
								{product.title}
							</h3>
							<div class="mb-1 flex items-center gap-3 text-xs text-gray-600">
								<span class="flex items-center gap-1">
									<svg class="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
									{product.rating}
								</span>
								<span>{product.reviews.toLocaleString('ja-JP')}件</span>
								<span>販売数 {product.sales.toLocaleString('ja-JP')}</span>
							</div>
							<div class="text-base font-bold text-red-500 sm:text-lg">
								¥{product.price.toLocaleString('ja-JP')}
							</div>
						</div>

						<!-- 趋势指示器 -->
						<div class="flex-shrink-0 text-right">
							{#if product.trend === 'up'}
								<div class="flex items-center gap-1 text-sm font-medium text-green-500">
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
									</svg>
									<span class="hidden sm:inline">上昇中</span>
								</div>
							{:else if product.trend === 'down'}
								<div class="flex items-center gap-1 text-sm font-medium text-red-500">
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
									</svg>
									<span class="hidden sm:inline">下降</span>
								</div>
							{:else}
								<div class="flex items-center gap-1 text-sm font-medium text-gray-400">
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
									</svg>
									<span class="hidden sm:inline">安定</span>
								</div>
							{/if}
							<div class="mt-1 text-xs text-gray-500">
								スコア {product.hotScore}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<!-- 网格视图 -->
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{#each hotProducts as product (product.id)}
					<a
						href="/product/{product.id}"
						class="group relative overflow-hidden rounded-xl bg-white no-underline shadow-sm transition-all duration-300 hover:shadow-lg"
					>
						<!-- 排名徽章 -->
						<div class="absolute top-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shadow-md {product.rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-white/90 text-gray-700'}">
							{product.rank}
						</div>

						<!-- 商品图片 -->
						<div class="relative aspect-square overflow-hidden bg-gray-100">
							<img
								src={product.image}
								alt={product.title}
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								loading="lazy"
							/>
						</div>

						<!-- 商品信息 -->
						<div class="p-3">
							<h3 class="mb-2 text-sm text-gray-800 line-clamp-2 transition-colors group-hover:text-blue-600">
								{product.title}
							</h3>

							<div class="mb-2 flex items-center gap-1">
								<svg class="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span class="text-xs text-gray-600">{product.rating}</span>
								<span class="text-xs text-gray-400">({product.reviews.toLocaleString('ja-JP')})</span>
							</div>

							<div class="mb-2 text-base font-bold text-red-500 sm:text-lg">
								¥{product.price.toLocaleString('ja-JP')}
							</div>

							<div class="text-xs text-gray-500">
								{product.sales.toLocaleString('ja-JP')}個販売
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</main>

<style>
	.shadow-sm {
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
	}

	.shadow-lg {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>