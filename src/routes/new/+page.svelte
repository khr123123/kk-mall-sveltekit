<script lang="ts">
	import { onMount } from 'svelte';

	// Mock新品数据
	function generateNewProducts(count: number) {
		const products = [];
		const titles = [
			'iPhone 16 Pro 新発売',
			'MacBook Air M4 最新モデル',
			'AirPods Max 2024',
			'iPad Pro M4チップ搭載',
			'Apple Watch Ultra 3',
			'Galaxy S25 Ultra 新登場',
			'Sony α7 V カメラ',
			'Nintendo Switch 2',
			'PlayStation 5 Pro',
			'Xiaomi 15 Ultra',
			'Dyson Gen6 掃除機',
			'バルミューダ 新型オーブン',
			'UNIQLO 春コレクション',
			'Nike 新作スニーカー',
			'資生堂 新美容液'
		];

		const now = Date.now();
		for (let i = 0; i < count; i++) {
			products.push({
				id: i + 1,
				title: titles[i % titles.length],
				image: '/svgs/goods.svg',
				price: Math.floor(((i % 10) + 3) * 10000),
				rating: 0, // 新品暂无评分
				reviews: Math.floor(Math.random() * 50),
				isPreOrder: i % 4 === 0,
				releaseDate: now + ((i % 30) - 15) * 86400000, // -15到+15天
				badge: i % 5 === 0 ? '先行予約' : i % 5 === 1 ? '数量限定' : i % 5 === 2 ? '初回特典' : '',
				stock: Math.floor(Math.random() * 200) + 50
			});
		}
		return products;
	}

	let allProducts = generateNewProducts(40);
	
	// 排序
	let sortBy = 'newest'; // newest, preorder, coming
	$: sortedProducts = [...allProducts].sort((a, b) => {
		switch (sortBy) {
			case 'newest':
				return b.releaseDate - a.releaseDate;
			case 'preorder':
				return (b.isPreOrder ? 1 : 0) - (a.isPreOrder ? 1 : 0);
			case 'coming':
				return a.releaseDate - b.releaseDate;
			default:
				return 0;
		}
	});

	// 格式化日期
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = timestamp - now.getTime();
		const days = Math.floor(diff / 86400000);

		if (days > 0) {
			return `${days}日後発売`;
		} else if (days === 0) {
			return '本日発売';
		} else if (days >= -7) {
			return `${Math.abs(days)}日前発売`;
		} else {
			return `${date.getMonth() + 1}/${date.getDate()}発売`;
		}
	}
</script>

<main class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<!-- 页面标题 -->
		<div class="mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white shadow-sm sm:p-8">
			<div class="flex items-center gap-3">
				<svg class="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
				</svg>
				<div>
					<h1 class="mb-1 text-2xl font-bold sm:text-3xl">新着商品</h1>
					<p class="text-sm text-white/90 sm:text-base">最新の商品をいち早くチェック</p>
				</div>
			</div>
		</div>

		<!-- 排序和筛选 -->
		<div class="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
			<div class="flex flex-wrap items-center gap-3">
				<span class="text-sm font-medium text-gray-700">表示：</span>
				<div class="flex flex-wrap gap-2">
					<button
						class="rounded-lg px-4 py-2 text-sm font-medium transition-all {sortBy === 'newest'
							? 'bg-gray-900 text-white'
							: 'bg-gray-50 text-gray-700 hover:bg-gray-100'}"
						on:click={() => sortBy = 'newest'}
					>
						最新順
					</button>
					<button
						class="rounded-lg px-4 py-2 text-sm font-medium transition-all {sortBy === 'preorder'
							? 'bg-gray-900 text-white'
							: 'bg-gray-50 text-gray-700 hover:bg-gray-100'}"
						on:click={() => sortBy = 'preorder'}
					>
						予約商品
					</button>
					<button
						class="rounded-lg px-4 py-2 text-sm font-medium transition-all {sortBy === 'coming'
							? 'bg-gray-900 text-white'
							: 'bg-gray-50 text-gray-700 hover:bg-gray-100'}"
						on:click={() => sortBy = 'coming'}
					>
						発売予定順
					</button>
				</div>
			</div>
		</div>

		<!-- 商品网格 -->
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each sortedProducts as product (product.id)}
				<a
					href="/product/{product.id}"
					class="group relative overflow-hidden rounded-xl bg-white no-underline shadow-sm transition-all duration-300 hover:shadow-lg"
				>
					<!-- NEW 徽章 -->
					<div class="absolute top-2 left-2 z-10 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-1 text-xs font-bold text-white shadow-md">
						NEW
					</div>

					<!-- 特殊标签 -->
					{#if product.badge}
						<div class="absolute top-2 right-2 z-10 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">
							{product.badge}
						</div>
					{/if}

					<!-- 商品图片 -->
					<div class="relative aspect-square overflow-hidden bg-gray-100">
						<img
							src={product.image}
							alt={product.title}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							loading="lazy"
						/>
						{#if product.isPreOrder}
							<div class="absolute inset-0 flex items-center justify-center bg-black/40">
								<span class="rounded-lg bg-white px-3 py-1 text-xs font-bold text-gray-900">予約受付中</span>
							</div>
						{/if}
					</div>

					<!-- 商品信息 -->
					<div class="p-3">
						<h3 class="mb-2 text-sm text-gray-800 line-clamp-2 transition-colors group-hover:text-blue-600">
							{product.title}
						</h3>

						<!-- 发售日期 -->
						<div class="mb-2 flex items-center gap-1 text-xs text-gray-600">
							<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<span class="font-medium">{formatDate(product.releaseDate)}</span>
						</div>

						<!-- 评价（如果有） -->
						{#if product.reviews > 0}
							<div class="mb-2 flex items-center gap-1 text-xs text-gray-500">
								<svg class="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span>{product.reviews}件のレビュー</span>
							</div>
						{:else}
							<div class="mb-2 text-xs text-gray-400">
								まだレビューがありません
							</div>
						{/if}

						<div class="mb-2 text-base font-bold text-red-500 sm:text-lg">
							¥{product.price.toLocaleString('ja-JP')}
						</div>

						<!-- 库存 -->
						<div class="flex items-center gap-1 text-xs text-gray-500">
							<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
							<span>在庫 {product.stock}点</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
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