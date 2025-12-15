<script lang="ts">
	import { onMount } from 'svelte';
	import { quickCategories } from '$lib/mockdata/Category.js';

	// 轮播图数据
	const banners = [
		{
			id: 1,
			image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
			title: '新年特惠',
			subtitle: '全场5折起',
			link: '/sale'
		},
		{
			id: 2,
			image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=400&fit=crop',
			title: '电子产品专场',
			subtitle: '最新科技产品',
			link: '/electronics'
		},
		{
			id: 3,
			image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
			title: '时尚服饰',
			subtitle: '春季新款上市',
			link: '/fashion'
		},
		{
			id: 4,
			image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
			title: '家居生活',
			subtitle: '打造温馨家园',
			link: '/home'
		}
	];

	// 固定商品图片列表 - 避免随机生成导致hydration错误
	const productImages = [
		'https://images.unsplash.com/photo-1500023791501-3c39a0f9d6f4?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500041994372-2ff62ce7f3fa?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500033691096-9bb3c5c88c9d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500016872089-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500055084753-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500078677789-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500072928507-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500059433497-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500049496882-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500023350756-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500042761350-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500029147923-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500044689733-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500030589580-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500012322525-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500093229230-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500038332207-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500003210091-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500011783671-9b5c5c5e5b5d?w=300&h=300&fit=crop',
		'https://images.unsplash.com/photo-1500012441277-9b5c5c5e5b5d?w=300&h=300&fit=crop'
	];

	// 生成虚拟商品数据 - 使用固定图片
	function generateProducts(count: number) {
		const products = [];
		const titles = [
			'苹果iPhone 15 Pro Max',
			'华为Mate 60 Pro',
			'小米14 Ultra',
			'三星Galaxy S24',
			'MacBook Pro 16英寸',
			'联想拯救者游戏本',
			'戴尔XPS 13',
			'Surface Laptop',
			'索尼WH-1000XM5耳机',
			'AirPods Pro',
			'Bose降噪耳机',
			'JBL蓝牙音箱',
			'Nike Air Max运动鞋',
			'Adidas跑步鞋',
			'优衣库T恤',
			'Zara连衣裙',
			'戴森吸尘器',
			'小米扫地机器人',
			'美的空调',
			'海尔冰箱',
			'兰蔻小黑瓶精华',
			'雅诗兰黛面霜',
			'资生堂防晒霜',
			'SK-II神仙水',
			'乐高积木套装',
			'Switch游戏机',
			'PS5主机',
			'Xbox Series X'
		];

		for (let i = 0; i < count; i++) {
			// 使用固定图片，通过取余数确保相同商品总是使用相同图片
			const imageIndex = i % productImages.length;
			
			products.push({
				id: i + 1,
				title: titles[i % titles.length], // 使用固定顺序而不是随机
				image: productImages[imageIndex],
				price: (Math.floor((i % 10 + 1) * 1000)).toFixed(2), // 更确定的定价
				originalPrice: (Math.floor((i % 10 + 1) * 1500)).toFixed(2),
				sales: Math.floor((i % 10 + 1) * 5000),
				rating: (4 + (i % 5) * 0.2).toFixed(1),
				discount: Math.floor((i % 5 + 1) * 10)
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
</script>

<main class="bg-gray-50">
	<!-- 轮播图区域 -->
	<section class="mx-auto max-w-7xl px-4 py-6">
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
						<a href={banner.link} class="block h-full">
							<img 
								src={banner.image} 
								alt={banner.title} 
								class="h-full w-full object-cover" 
								loading="lazy"
								width="1200"
								height="400"
							/>
							<div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
								<div class="flex h-full flex-col justify-center px-12 text-white">
									<h2 class="mb-4 text-5xl font-bold">{banner.title}</h2>
									<p class="text-2xl">{banner.subtitle}</p>
									<button
										class="mt-8 w-fit rounded-lg bg-orange-500 px-8 py-3 font-medium transition-colors hover:bg-orange-600"
									>
										立即选购
									</button>
								</div>
							</div>
						</a>
					</div>
				{/each}
			</div>

			<!-- 轮播控制按钮 -->
			<button
				class="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:scale-110 hover:bg-white"
				on:click={prevBanner}
				aria-label="上一个轮播图"
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
				aria-label="下一个轮播图"
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
						aria-label={`跳转到轮播图 ${index + 1}`}
					/>
				{/each}
			</div>
		</div>
	</section>

	<!-- 快捷分类 -->
	<section class="mx-auto max-w-7xl px-4 py-6">
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<h2 class="mb-6 text-2xl font-bold text-gray-900">热门分类</h2>
			<div class="grid grid-cols-5 gap-4 md:grid-cols-10">
				{#each quickCategories as category}
					<a
						href="/category/{category.id}"
						class="flex flex-col items-center gap-3 rounded-xl p-4 transition-transform hover:scale-105 {category.color}"
					>
						<img src={category.icon} alt={category.name} class="h-8 w-8" />
						<span class="text-sm font-medium">{category.name}</span>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- 热门推荐 -->
	<section class="mx-auto max-w-7xl px-4 py-6">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="text-2xl font-bold text-gray-900">热门推荐</h2>
			<div class="flex gap-2">
				<button
					class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-500"
				>
					综合排序
				</button>
				<button
					class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-500"
				>
					销量优先
				</button>
				<button
					class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-500"
				>
					价格优先
				</button>
			</div>
		</div>

		<!-- 商品网格 -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
			{#each displayedProducts as product (product.id)}
				<a
					href="/product/{product.id}"
					class="group overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-xl"
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
					<div class="p-4">
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
							<span class="text-xl font-bold text-orange-500">¥{product.price}</span>
							<span class="text-xs text-gray-400 line-through">¥{product.originalPrice}</span>
						</div>

						<div class="text-xs text-gray-500">
							已售 {product.sales.toLocaleString()}
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
					<span>加载中...</span>
				</div>
			</div>
		{/if}

		{#if !hasMore}
			<div class="mt-8 text-center text-gray-500">已经到底了~</div>
		{/if}
	</section>
</main>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>