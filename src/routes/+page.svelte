<script lang="ts">
	import { onMount } from 'svelte';
	import { quickCategories } from '$lib/mockdata/Category.js';

	const banners = [
		{
			id: 1,
			image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
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

<main class="bg-gray-50 font-mono">
	<!-- 轮播图区域 -->
	<section class="mx-auto max-w-7xl">
		<div class="relative overflow-hidden rounded-2xl bg-white shadow-lg">
			<div class="relative h-96">
				{#each banners as banner, index}
					<div
						class="absolute inset-0 transition-all duration-700 ease-in-out {index === currentBanner
							? 'translate-x-0 opacity-100'
							: index < currentBanner
								? '-translate-x-full opacity-0'
								: 'translate-x-full opacity-0'}"
					>
						<a href={banner.link} class="block h-full no-underline">
							<img
								src={banner.image}
								alt={banner.title}
								class="h-full w-full object-cover"
								loading="lazy"
								width="1200"
								height="400"
							/>
							<div
								class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-6"
							>
								<h3 class="mb-1 text-3xl font-bold text-white">{banner.title}</h3>
								<p class="text-lg text-white/90">{banner.subtitle}</p>
							</div>
						</a>
					</div>
				{/each}
			</div>

			<!-- 轮播控制按钮 -->
			<button
				class="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:scale-110 hover:bg-white"
				on:click={prevBanner}
				aria-label="前のバナー"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>
			<button
				class="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:scale-110 hover:bg-white"
				on:click={nextBanner}
				aria-label="次のバナー"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>

			<!-- 轮播指示器 -->
			<div class="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
				{#each banners as _, index}
					<button
						class="h-2 rounded-full transition-all {index === currentBanner
							? 'w-8 bg-white'
							: 'w-2 bg-white/50'}"
						on:click={() => goToBanner(index)}
						aria-label="バナー {index + 1} へ"
					></button>
				{/each}
			</div>
		</div>
	</section>

	<!-- 快捷分类 -->
	<section class="mx-auto max-w-7xl px-4 py-6">
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-bold text-gray-900">人気カテゴリー</h2>
			<div class="grid grid-cols-5 gap-3 md:grid-cols-10">
				{#each quickCategories as category}
					<a
						href="/category/{category.id}"
						class="group relative flex flex-col items-center rounded-xl p-2 no-underline transition-all hover:scale-105 hover:bg-gray-50"
					>
						<!-- 分类图标容器 -->
						<div
							class="relative mb-1 flex h-12 w-12 items-center justify-center rounded-lg {category.color}"
						>
							<img src={category.icon} alt={category.name} class="h-6 w-6" />
						</div>
						<span
							class="
    block
    w-full
    text-center
    text-xs
    leading-tight
    font-medium
    wrap-break-word
    text-gray-700
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
	<section class="mx-auto max-w-7xl px-4 py-6">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="text-xl font-bold text-gray-900">おすすめ商品</h2>
			<div class="flex gap-2">
				{#each sortOptions as option}
					<button
						class="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5
		text-xs font-medium text-gray-700 transition-all
		hover:border-gray-500 hover:text-gray-500
		{currentSort === option.id ? 'border-gray-500 bg-gray-50 text-gray-700' : ''}"
						on:click={() => sortProducts(option.id)}
					>
						<img src={option.icon} alt={option.name} class="block h-4 w-4" />
						<span class="font-mono leading-none">
							{option.name}
						</span>
					</button>
				{/each}
			</div>
		</div>
		<!-- 商品网格 -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
			{#each displayedProducts as product (product.id)}
				<a
					href="/product/{product.id}"
					class="group overflow-hidden rounded-xl bg-white no-underline shadow-sm transition-all hover:shadow-xl"
				>
					<!-- 商品图片 -->
					<div class="relative overflow-hidden bg-gray-100 pb-[100%]">
						<img
							src={product.image}
							alt={product.title}
							class="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-110"
							loading="lazy"
							width="300"
							height="300"
						/>
						{#if product.discount}
							<div
								class="absolute top-2 left-2 rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white"
							>
								-{product.discount}%
							</div>
						{/if}
					</div>

					<!-- 商品信息 -->
					<div class="p-3">
						<h3 class="mb-2 line-clamp-2 text-sm text-gray-800 group-hover:text-orange-500">
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
							<span class="text-lg font-bold text-orange-500">¥{product.price}</span>
							<span class="text-xs text-gray-400 line-through">¥{product.originalPrice}</span>
						</div>

						<div class="text-xs text-gray-500">
							販売数 {product.sales.toLocaleString('ja-JP')}
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- 加载更多指示器 -->
		{#if loading}
			<div class="mt-8 flex justify-center">
				<div class="flex items-center gap-3 text-gray-600">
					<svg class="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span>読み込み中...</span>
				</div>
			</div>
		{/if}

		{#if !hasMore}
			<div class="mt-8 text-center text-gray-500">すべて表示しました</div>
		{/if}
	</section>
</main>

<style>
	/* 全局样式 */
	.font-mono {
		font-family: 'SF Mono', Monaco, 'Roboto Mono', 'Courier New', monospace;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* 移除所有链接的下划线 */
	a.no-underline {
		text-decoration: none !important;
	}

	/* 确保所有a标签都没有下划线 */
	a {
		text-decoration: none;
	}
</style>
