<script lang="ts">
	import { onMount } from 'svelte';
	import { quickCategories } from '$lib/mockdata/Category.js';

	const banners = [
		{
			id: 1,
			image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
			title: '新年セール',
			subtitle: '全品50%OFF〜',
			link: '/sale',
			color: 'from-red-500/90'
		},
		{
			id: 2,
			image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=400&fit=crop',
			title: '家電・デジタル',
			subtitle: '最新ガジェット',
			link: '/electronics',
			color: 'from-blue-500/90'
		},
		{
			id: 3,
			image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
			title: 'ファッション',
			subtitle: '春の新作',
			link: '/fashion',
			color: 'from-pink-500/90'
		},
		{
			id: 4,
			image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
			title: 'ホーム&リビング',
			subtitle: '暮らしを豊かに',
			link: '/home',
			color: 'from-green-500/90'
		}
	];

	// 排序选项（日语）
	const sortOptions = [
		{ id: 'default', name: 'おすすめ順', icon: '/svgs/おすすめ順.svg' },
		{ id: 'sales', name: '売れ筋順', icon: '/svgs/売れ筋順.svg' },
		{ id: 'price-low', name: '価格安い順', icon: '/svgs/価格安い順.svg' },
		{ id: 'price-high', name: '価格高い順', icon: '/svgs/価格高い順.svg' },
		{ id: 'rating', name: '評価順', icon: '/svgs/評価順.svg' }
	];

	let currentSort = 'default';

	function generateProducts(count: number) {
		const products = [];
		const titles = [
			'iPhone 15 Pro Max',
			'Mate 60 Pro',
			'Xiaomi 14 Ultra',
			'Galaxy S24',
			'MacBook Pro 16インチ',
			'Legion ゲーミングPC',
			'Dell XPS 13',
			'Surface Laptop',
			'SONY WH-1000XM5',
			'AirPods Pro',
			'Bose ノイズキャンセリング',
			'JBL ワイヤレススピーカー',
			'Nike Air Max',
			'Adidas ランニングシューズ',
			'ユニクロTシャツ',
			'ZARA ワンピース',
			'Dyson 掃除機',
			'Xiaomi 掃除ロボット',
			'美的 エアコン',
			'Haier 冷蔵庫',
			'ランコム セラム',
			'エスティローダー クリーム',
			'資生堂 日焼け止め',
			'SK-II ローション',
			'LEGO セット',
			'Nintendo Switch',
			'PlayStation 5',
			'Xbox Series X'
		];
		for (let i = 0; i < count; i++) {
			products.push({
				id: i + 1,
				title: titles[i % titles.length],
				image: '/svgs/goods.svg',
				price: Math.floor(((i % 10) + 1) * 1000).toFixed(0), // 整数价格
				originalPrice: Math.floor(((i % 10) + 1) * 1500).toFixed(0),
				sales: Math.floor(((i % 10) + 1) * 5000),
				rating: (4 + (i % 5) * 0.2).toFixed(1),
				discount: Math.floor(((i % 5) + 1) * 10)
			});
		}
		return products;
	}

	let allProducts = generateProducts(100);
	let displayedProducts = allProducts.slice(0, 20);
	let currentPage = 1;
	let loading = false;
	let hasMore = true;

	// 轮播图相关
	let currentBanner = 0;
	let autoPlayInterval: number;

	onMount(() => {
		// 自动轮播
		autoPlayInterval = window.setInterval(() => {
			currentBanner = (currentBanner + 1) % banners.length;
		}, 5000);

		// 监听滚动实现懒加载
		const handleScroll = () => {
			if (loading || !hasMore) return;

			const scrollTop = window.scrollY;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			if (scrollTop + windowHeight >= documentHeight - 500) {
				loadMore();
			}
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			clearInterval(autoPlayInterval);
			window.removeEventListener('scroll', handleScroll);
		};
	});

	function nextBanner() {
		currentBanner = (currentBanner + 1) % banners.length;
		resetAutoPlay();
	}

	function prevBanner() {
		currentBanner = (currentBanner - 1 + banners.length) % banners.length;
		resetAutoPlay();
	}

	function goToBanner(index: number) {
		currentBanner = index;
		resetAutoPlay();
	}

	function resetAutoPlay() {
		clearInterval(autoPlayInterval);
		autoPlayInterval = window.setInterval(() => {
			currentBanner = (currentBanner + 1) % banners.length;
		}, 5000);
	}

	function loadMore() {
		if (loading || !hasMore) return;

		loading = true;

		// 模拟网络延迟
		setTimeout(() => {
			currentPage++;
			const start = (currentPage - 1) * 20;
			const end = start + 20;
			const newProducts = allProducts.slice(start, end);

			if (newProducts.length > 0) {
				displayedProducts = [...displayedProducts, ...newProducts];
			} else {
				hasMore = false;
			}

			loading = false;
		}, 1000);
	}

	// 排序函数
	function sortProducts(sortType: string) {
		currentSort = sortType;

		const sorted = [...displayedProducts];
		switch (sortType) {
			case 'sales':
				sorted.sort((a, b) => b.sales - a.sales);
				break;
			case 'price-low':
				sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
				break;
			case 'price-high':
				sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
				break;
			case 'rating':
				sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
				break;
			default:
				// 默认排序
				sorted.sort((a, b) => a.id - b.id);
		}
		displayedProducts = sorted;
	}
</script>

<main class="min-h-screen bg-gray-50">
	<!-- 轮播图区域 -->
	<section class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
		<div class="relative overflow-hidden rounded-2xl bg-white shadow-sm">
			<div class="relative h-64 sm:h-80 lg:h-96">
				{#each banners as banner, index}
					<div
						class="absolute inset-0 transition-all duration-700 ease-in-out {index === currentBanner
							? 'translate-x-0 opacity-100'
							: index < currentBanner
								? '-translate-x-full opacity-0'
								: 'translate-x-full opacity-0'}"
					>
						<a href={banner.link} class="group relative block h-full overflow-hidden no-underline">
							<img
								src={banner.image}
								alt={banner.title}
								class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								loading="lazy"
								width="1200"
								height="400"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-r {banner.color} to-transparent opacity-90 lg:opacity-70"
							></div>
							<div class="absolute right-0 bottom-0 left-0 p-4 sm:p-6 lg:p-8">
								<h3 class="mb-1 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
									{banner.title}
								</h3>
								<p class="text-base text-white/90 sm:text-lg lg:text-xl">
									{banner.subtitle}
								</p>
							</div>
						</a>
					</div>
				{/each}
			</div>

			<!-- 轮播控制按钮 -->
			<button
				class="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:scale-110 hover:bg-white sm:left-4 sm:p-3"
				on:click={prevBanner}
				aria-label="前のバナー"
			>
				<svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>
			<button
				class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:scale-110 hover:bg-white sm:right-4 sm:p-3"
				on:click={nextBanner}
				aria-label="次のバナー"
			>
				<svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>

			<!-- 轮播指示器 -->
			<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-6 sm:gap-2">
				{#each banners as _, index}
					<button
						class="h-1.5 rounded-full transition-all sm:h-2 {index === currentBanner
							? 'w-6 bg-white sm:w-8'
							: 'w-1.5 bg-white/50 sm:w-2'}"
						on:click={() => goToBanner(index)}
						aria-label="バナー {index + 1} へ"
					></button>
				{/each}
			</div>
		</div>
	</section>

	<!-- 快捷分类 -->
	<section class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
		<div class="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
			<h2 class="mb-4 text-lg font-bold text-gray-900 sm:text-xl">人気カテゴリー</h2>
			<div class="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3 md:grid-cols-8 lg:grid-cols-10">
				{#each quickCategories as category}
					<a
						href="/category/{category.id}"
						class="group relative flex flex-col items-center rounded-xl p-2 no-underline transition-all duration-300 hover:scale-105 hover:bg-gray-50"
					>
						<!-- 分类图标容器 -->
						<div
							class="relative mb-1 flex h-10 w-10 items-center justify-center rounded-lg {category.color} sm:h-12 sm:w-12"
						>
							<img src={category.icon} alt={category.name} class="h-5 w-5 sm:h-6 sm:w-6" />
						</div>
						<span
							class="text-xs font-medium text-gray-700 sm:text-xs"
							style="
								display: -webkit-box;
								-webkit-line-clamp: 2;
								-webkit-box-orient: vertical;
								overflow: hidden;
								text-align: center;
								line-height: 1.2;
							"
						>
							{category.name}
						</span>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- 热门推荐 -->
	<section class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
		<div class="mb-6">
			<!-- 标题区域 -->
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-900 sm:text-xl">おすすめ商品</h2>

				<!-- 移动端排序下拉菜单 -->
				<div class="relative sm:hidden">
					<select
						class="sort-select h-9 appearance-none rounded-lg border border-gray-300 bg-white pr-8 pl-3 text-sm text-gray-700 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
						bind:value={currentSort}
						on:change={(e) => sortProducts((e.target as HTMLSelectElement)?.value ?? 'default')}
					>
						{#each sortOptions as option}
							<option value={option.id}>{option.name}</option>
						{/each}
					</select>
					<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
						<svg
							class="h-4 w-4 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				</div>
			</div>

			<!-- 桌面端排序按钮组 -->
			<div class="hidden sm:block">
				<div class="sort-buttons inline-flex items-center gap-2 rounded-lg bg-gray-50 p-1">
					{#each sortOptions as option}
						<button
							class="sort-button flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 {currentSort ===
							option.id
								? 'bg-white text-gray-800 shadow-sm'
								: 'text-gray-600 hover:text-gray-800'}"
							on:click={() => sortProducts(option.id)}
						>
							<img src={option.icon} alt={option.name} class="h-4 w-4" />
							<span>{option.name}</span>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- 商品网格 -->
		<div
			class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			{#each displayedProducts as product (product.id)}
				<a
					href="/product/{product.id}"
					class="product-card group relative overflow-hidden rounded-xl bg-white no-underline shadow-sm transition-all duration-300 hover:shadow-lg"
				>
					<!-- 商品图片 -->
					<div class="relative aspect-square overflow-hidden bg-gray-100">
						<img
							src={product.image}
							alt={product.title}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							loading="lazy"
							width="300"
							height="300"
						/>
						{#if product.discount}
							<div
								class="absolute top-2 left-2 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white"
							>
								-{product.discount}%
							</div>
						{/if}
					</div>

					<!-- 商品信息 -->
					<div class="p-3">
						<h3
							class="product-title mb-2 text-sm text-gray-800 transition-colors group-hover:text-blue-600"
							style="
								display: -webkit-box;
								-webkit-line-clamp: 2;
								-webkit-box-orient: vertical;
								overflow: hidden;
								line-height: 1.3;
							"
						>
							{product.title}
						</h3>

						<div class="mb-2 flex items-center gap-1">
							<div class="flex text-yellow-400">
								{#each Array(5) as _, i}
									<svg
										class="h-3 w-3 {i < Math.floor(Number(product.rating))
											? 'fill-current'
											: 'fill-gray-300'}"
										viewBox="0 0 20 20"
									>
										<path
											d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
										/>
									</svg>
								{/each}
							</div>
							<span class="text-xs text-gray-500">{product.rating}</span>
						</div>

						<div class="mb-2 flex items-baseline gap-2">
							<span class="text-base font-bold text-red-500 sm:text-lg">¥{product.price}</span>
							{#if product.originalPrice !== product.price}
								<span class="text-xs text-gray-400 line-through">
									¥{product.originalPrice}
								</span>
							{/if}
						</div>

						<div class="text-xs text-gray-500">
							<span class="font-medium">販売数</span>
							{product.sales.toLocaleString('ja-JP')}
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- 加载更多指示器 -->
		{#if loading}
			<div class="mt-8 flex justify-center">
				<div
					class="loading-indicator flex items-center gap-3 rounded-lg bg-white px-6 py-3 text-gray-600 shadow-sm"
				>
					<svg class="h-5 w-5 animate-spin sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span class="text-sm sm:text-base">読み込み中...</span>
				</div>
			</div>
		{/if}

		{#if !hasMore && displayedProducts.length > 0}
			<div
				class="end-message mt-8 rounded-lg bg-gray-50 py-4 text-center text-sm text-gray-500 sm:text-base"
			>
				すべて表示しました
			</div>
		{/if}
	</section>

	<!-- 底部安全区域 -->
	<div class="h-8"></div>
</main>

<style>
	/* ==================== 全局样式 ==================== */
	* {
		box-sizing: border-box;
	}

	/* ==================== PocketBase风格样式 ==================== */
	/* 卡片阴影 */
	.shadow-sm {
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.1),
			0 1px 2px -1px rgba(0, 0, 0, 0.1);
	}

	.shadow-lg {
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -4px rgba(0, 0, 0, 0.1);
	}

	/* 按钮样式 */
	.sort-button {
		min-height: 36px;
	}

	.sort-button:hover {
		transform: translateY(-1px);
	}

	.sort-button:active {
		transform: translateY(0);
	}

	/* 选择框样式 */
	.sort-select {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.5rem center;
		background-repeat: no-repeat;
		background-size: 1.5em 1.5em;
	}

	/* 移除默认选择框图标 */
	.sort-select::-ms-expand {
		display: none;
	}

	/* 商品卡片动画 */
	.product-card {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.product-card:hover {
		transform: translateY(-4px);
	}

	/* 加载动画 */
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

	/* 渐变色覆盖层 */
	.bg-gradient-overlay {
		background: linear-gradient(to right, rgba(0, 0, 0, 0.6), transparent);
	}

	/* ==================== 响应式调整 ==================== */
	@media (max-width: 640px) {
		/* 移动端商品网格 */
		.grid-cols-2 > .product-card:nth-child(2n) {
			margin-right: 0;
		}

		/* 移动端分类图标容器 */
		.h-10 {
			height: 2.5rem;
		}

		.w-10 {
			width: 2.5rem;
		}
	}

	@media (max-width: 768px) {
		/* 平板端商品网格 */
		.product-title {
			font-size: 0.875rem;
			line-height: 1.3;
		}
	}

	@media (max-width: 1024px) {
		/* 大平板商品网格 */
		.grid-cols-5 > .product-card:nth-child(5n) {
			margin-right: 0;
		}
	}

	/* ==================== 优化触摸体验 ==================== */
	@media (hover: none) and (pointer: coarse) {
		.product-card:hover {
			transform: none;
		}

		.product-card:active {
			transform: scale(0.98);
		}

		.sort-button:hover {
			transform: none;
		}

		.sort-button:active {
			background-color: #f3f4f6;
		}
	}

	/* ==================== 深色模式支持 ==================== */
	@media (prefers-color-scheme: dark) {
		.bg-gray-50 {
			background-color: #111827;
		}

		.bg-white {
			background-color: #1f2937;
		}

		.text-gray-900 {
			color: #f9fafb;
		}

		.text-gray-800 {
			color: #e5e7eb;
		}

		.text-gray-700 {
			color: #d1d5db;
		}

		.text-gray-600 {
			color: #9ca3af;
		}

		.bg-gray-50 {
			background-color: #374151;
		}

		.sort-select {
			background-color: #1f2937;
			color: #e5e7eb;
			border-color: #4b5563;
		}

		.product-card:hover .product-title {
			color: #60a5fa;
		}

		.from-red-500\/90 {
			background: linear-gradient(to right, rgba(239, 68, 68, 0.9), transparent);
		}

		.from-blue-500\/90 {
			background: linear-gradient(to right, rgba(59, 130, 246, 0.9), transparent);
		}

		.from-pink-500\/90 {
			background: linear-gradient(to right, rgba(236, 72, 153, 0.9), transparent);
		}

		.from-green-500\/90 {
			background: linear-gradient(to right, rgba(34, 197, 94, 0.9), transparent);
		}
	}

	/* ==================== 无障碍优化 ==================== */
	button:focus,
	select:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	a:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		border-radius: 0.375rem;
	}

	/* ==================== 打印优化 ==================== */
	@media print {
		.shadow-sm,
		.shadow-lg {
			box-shadow: none;
			border: 1px solid #e5e7eb;
		}

		.bg-gradient-overlay {
			background: #000 !important;
		}
	}
</style>
