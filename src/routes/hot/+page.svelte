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
			const price = Math.floor(((i % 10) + 3) * 10000);
			const sales = Math.floor(((i % 10) + 10) * 10000);
			const rank = i + 1;
			const originalPrice = Math.floor(price * (1 + Math.random() * 0.3));
			const discount = Math.random() > 0.4 ? Math.floor(Math.random() * 40) + 10 : 0;
			
			products.push({
				id: i + 1,
				title: titles[i % titles.length],
				price: discount > 0 ? Math.floor(originalPrice * (1 - discount / 100)) : price,
				originalPrice: discount > 0 ? originalPrice : undefined,
				discount: discount,
				sales: sales,
				rating: 4 + Math.random(),
				reviews: Math.floor(Math.random() * 1000),
				rank: rank,
				trend: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'stable',
				score: 100 - i * 2,
				category: ['スマートフォン', 'ノートPC', 'オーディオ', 'ゲーム機'][i % 4],
				isHot: i % 2 === 0,
				stock: Math.floor(Math.random() * 200) + 50,
				image: '/svgs/goods.svg',
				tags: rank <= 3 ? ['ベスト3', '人気'] : rank <= 10 ? ['TOP10', '注目'] : []
			});
		}
		return products;
	}

	let hotProducts = generateHotProducts(40);
	let selectedCategory = 'all';
	let sortBy = 'rank'; // rank, score, sales, price
	let isLoading = $state(false);
	let viewMode = 'grid'; // grid, list

	const categories = [
		{ id: 'all', name: 'すべて', icon: '🔥' },
		{ id: 'electronics', name: 'デジタル', icon: '📱' },
		{ id: 'fashion', name: 'ファッション', icon: '👕' },
		{ id: 'home', name: 'ホーム', icon: '🏠' },
		{ id: 'beauty', name: '美容', icon: '💄' },
		{ id: 'sports', name: 'スポーツ', icon: '⚽' }
	];

	// 格式化价格
	function formatPrice(price: number) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			maximumFractionDigits: 0
		}).format(price);
	}

	// 排序功能
	let filteredProducts = $derived([...hotProducts].filter(product => {
		if (selectedCategory === 'all') return true;
		return product.category === selectedCategory;
	}));

	let sortedProducts = $derived([...filteredProducts].sort((a, b) => {
		switch (sortBy) {
			case 'rank':
				return a.rank - b.rank;
			case 'score':
				return b.score - a.score;
			case 'sales':
				return b.sales - a.sales;
			case 'price':
				return a.price - b.price;
			default:
				return a.rank - b.rank;
		}
	}));

	// 添加到购物车
	function addToCart(product: any, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('カートに追加:', product.title);
		alert(`${product.title}をカートに追加しました`);
	}

	// 添加到收藏
	function addToWishlist(product: any, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('お気に入りに追加:', product.title);
		alert(`${product.title}をお気に入りに追加しました`);
	}

	// 趋势颜色
	function getTrendColor(trend: string) {
		switch (trend) {
			case 'up':
				return 'text-green-600 bg-green-50 border-green-200';
			case 'down':
				return 'text-red-600 bg-red-50 border-red-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}

	// 趋势图标
	function getTrendIcon(trend: string) {
		switch (trend) {
			case 'up':
				return `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
				</svg>`;
			case 'down':
				return `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
				</svg>`;
			default:
				return `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
				</svg>`;
		}
	}
</script>

<main class="min-h-screen bg-white">
	<!-- 页面头部 -->
	<div class="bg-gradient-to-r from-orange-600 to-yellow-500 text-white">
		<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<h1 class="mb-3 text-3xl font-bold sm:text-4xl">急上昇ランキング</h1>
			<p class="text-lg text-white/90">今、最も注目されている人気商品ランキング</p>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- 分类标签 -->
		<div class="mb-8">
			<div class="flex flex-wrap gap-2">
				{#each categories as category}
					<button
						on:click={() => (selectedCategory = category.id)}
						class="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition-colors {selectedCategory === category.id
							? 'bg-gray-900 text-white'
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						<span class="text-base">{category.icon}</span>
						{category.name}
					</button>
				{/each}
			</div>
		</div>

		<!-- 排序和视图切换 -->
		<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div class="text-gray-600">
				<span class="font-semibold">{sortedProducts.length}</span> 件の人気商品
			</div>

			<div class="flex items-center gap-4">
				<!-- 视图切换 -->
				<div class="flex rounded-lg border border-gray-300 p-1">
					<button
						on:click={() => (viewMode = 'grid')}
						class="rounded-md p-2 {viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}"
						aria-label="グリッド表示"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
							/>
						</svg>
					</button>
					<button
						on:click={() => (viewMode = 'list')}
						class="rounded-md p-2 {viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}"
						aria-label="リスト表示"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
				</div>

				<!-- 排序下拉框 -->
				<select
					bind:value={sortBy}
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
				>
					<option value="rank">ランキング順</option>
					<option value="score">人気スコア順</option>
					<option value="sales">販売数順</option>
					<option value="price">価格順</option>
				</select>
			</div>
		</div>

		<!-- 排行榜头部（前3名） -->
		{#if !isLoading && sortedProducts.length >= 3}
			<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each sortedProducts.slice(0, 3) as product, index}
					<div class="relative overflow-hidden rounded-xl border-2 {index === 0
						? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
						: index === 1
						? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100'
						: 'border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50'}">
						<!-- 排名徽章 -->
						<div class="absolute top-4 left-4 z-10">
							<div class="flex h-12 w-12 items-center justify-center rounded-full {index === 0
								? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg'
								: index === 1
								? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg'
								: 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg'}">
								<span class="text-xl font-bold">{index + 1}</span>
							</div>
						</div>

						<div class="p-6">
							<a href="/product/{product.id}" class="block no-underline">
								<div class="flex gap-4">
									<div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
										<div class="flex h-full w-full items-center justify-center text-gray-400">
											商品画像
										</div>
									</div>
									<div class="flex-1">
										<h3 class="mb-2 line-clamp-2 font-semibold text-gray-900">
											{product.title}
										</h3>
										<div class="mb-3 flex items-center gap-2">
											<div class="flex">
												{#each Array(5) as _, i}
													<svg
														class="h-4 w-4 {i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}"
														viewBox="0 0 20 20"
													>
														<path
															d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
														/>
													</svg>
												{/each}
											</div>
											<span class="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
										</div>
										<div class="flex items-center gap-2">
											<span class="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
											{#if product.discount > 0 && product.originalPrice}
												<span class="text-sm text-gray-500 line-through">
													{formatPrice(product.originalPrice)}
												</span>
												<span class="text-sm font-bold text-red-600">-{product.discount}%</span>
											{/if}
										</div>
									</div>
								</div>
							</a>
							
							<div class="mt-4 flex items-center justify-between">
								<div class="flex items-center gap-2 text-sm text-gray-600">
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
									<span>{product.sales.toLocaleString('ja-JP')}個販売</span>
								</div>
								<button
									on:click|preventDefault={(e) => addToCart(product, e)}
									class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
								>
									購入する
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- 加载状态 -->
		{#if isLoading}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(8) as _}
					<div class="animate-pulse overflow-hidden rounded-lg border border-gray-200">
						<div class="aspect-square bg-gray-200"></div>
						<div class="space-y-3 p-4">
							<div class="h-4 bg-gray-200 rounded"></div>
							<div class="h-4 bg-gray-200 rounded w-2/3"></div>
							<div class="h-6 bg-gray-200 rounded w-1/2"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- 列表视图 -->
			{#if viewMode === 'list'}
				<div class="space-y-4">
					{#each sortedProducts.slice(3) as product, index}
						<a
							href="/product/{product.id}"
							class="group flex gap-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 no-underline transition-colors hover:border-gray-300 hover:shadow-md"
						>
							<!-- 排名 -->
							<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-700">
								{index + 4}
							</div>

							<!-- 商品图片 -->
							<div class="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
								<div class="flex h-full w-full items-center justify-center text-gray-400">
									商品画像
								</div>
								{#if product.discount > 0}
									<div class="absolute top-2 left-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
										-{product.discount}%
									</div>
								{/if}
							</div>

							<!-- 商品信息 -->
							<div class="flex flex-1 flex-col justify-between">
								<div>
									<h3 class="mb-2 font-semibold text-gray-900 group-hover:text-gray-700">
										{product.title}
									</h3>
									<div class="mb-3 flex items-center gap-4">
										<div class="flex items-center gap-2">
											<div class="flex">
												{#each Array(5) as _, i}
													<svg
														class="h-4 w-4 {i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}"
														viewBox="0 0 20 20"
													>
														<path
															d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
														/>
													</svg>
												{/each}
											</div>
											<span class="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
											<span class="text-sm text-gray-400">({product.reviews}件)</span>
										</div>
										<div class="flex items-center gap-2">
											<div class={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getTrendColor(product.trend)}`}>
												{@html getTrendIcon(product.trend)}
												{#if product.trend === 'up'}
													上昇中
												{:else if product.trend === 'down'}
													下降中
												{:else}
													安定
												{/if}
											</div>
										</div>
									</div>
								</div>

								<!-- 价格和按钮 -->
								<div class="flex items-end justify-between">
									<div>
										<div class="flex items-center gap-2">
											<span class="text-xl font-bold text-gray-900">
												{formatPrice(product.price)}
											</span>
											{#if product.discount > 0 && product.originalPrice}
												<span class="text-sm text-gray-500 line-through">
													{formatPrice(product.originalPrice)}
												</span>
											{/if}
										</div>
										<div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
											<div class="flex items-center gap-1">
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
													/>
												</svg>
												<span>{product.sales.toLocaleString('ja-JP')}個販売</span>
											</div>
										</div>
									</div>

									<div class="flex gap-2">
										<button
											on:click|preventDefault={(e) => addToWishlist(product, e)}
											class="rounded-full border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
											aria-label="お気に入りに追加"
										>
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
												/>
											</svg>
										</button>
										<button
											on:click|preventDefault={(e) => addToCart(product, e)}
											class="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800"
										>
											購入する
										</button>
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<!-- 网格视图 -->
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each sortedProducts.slice(3) as product, index}
						<div class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-lg">
							<!-- 排名徽章 -->
							<div class="absolute top-3 left-3 z-10">
								<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 font-medium text-white shadow-md">
									{index + 4}
								</div>
							</div>

							<a href="/product/{product.id}" class="block no-underline">
								<!-- 商品图片 -->
								<div class="relative aspect-square overflow-hidden bg-gray-100">
									<div class="flex h-full w-full items-center justify-center text-gray-400">
										商品画像
									</div>
									<!-- 标签 -->
									<div class="absolute top-3 right-3 flex flex-col gap-2">
										{#if product.discount > 0}
											<span class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
												-{product.discount}%
											</span>
										{/if}
										{#if product.isHot}
											<span class="rounded bg-orange-500 px-2 py-1 text-xs font-bold text-white">
												HOT
											</span>
										{/if}
									</div>
									<!-- 收藏按钮 -->
									<button
										on:click|preventDefault={(e) => addToWishlist(product, e)}
										class="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100"
										aria-label="お気に入りに追加"
									>
										<svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.5"
												d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
											/>
										</svg>
									</button>
								</div>

								<!-- 商品信息 -->
								<div class="p-4">
									<!-- 趋势标签 -->
									<div class="mb-2">
										<div class={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getTrendColor(product.trend)}`}>
											{@html getTrendIcon(product.trend)}
											{#if product.trend === 'up'}
												急上昇
											{:else if product.trend === 'down'}
												下降中
											{:else}
												安定
											{/if}
										</div>
									</div>

									<h3 class="mb-2 line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-gray-700">
										{product.title}
									</h3>

									<div class="mb-2 flex items-center gap-1">
										<div class="flex">
											{#each Array(5) as _, i}
												<svg
													class="h-4 w-4 {i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											{/each}
										</div>
										<span class="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
										<span class="text-sm text-gray-400">({product.reviews})</span>
									</div>

									<div class="mb-3 flex items-center gap-2">
										<span class="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
										{#if product.discount > 0 && product.originalPrice}
											<span class="text-sm text-gray-500 line-through">
												{formatPrice(product.originalPrice)}
											</span>
										{/if}
									</div>

									<div class="flex items-center justify-between text-xs text-gray-500">
										<div class="flex items-center gap-1">
											<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
												/>
											</svg>
											<span>{product.sales.toLocaleString('ja-JP')}個販売</span>
										</div>
									</div>
								</div>
							</a>

							<!-- 添加到购物车按钮 -->
							<div class="border-t border-gray-100 p-4">
								<button
									on:click|preventDefault={(e) => addToCart(product, e)}
									class="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white transition-colors hover:bg-gray-800"
								>
									購入する
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- 分页 -->
			<div class="mt-12 flex justify-center">
				<nav class="flex items-center gap-2">
					<button
						class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
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

					<button class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 font-medium text-white">
						1
					</button>
					<button class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
						2
					</button>
					<button class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
						3
					</button>
					<button class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</nav>
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

	.aspect-square {
		aspect-ratio: 1 / 1;
	}
</style>