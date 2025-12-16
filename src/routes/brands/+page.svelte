<script lang="ts">
	import { onMount } from 'svelte';

	// Mock品牌数据
	const brands = [
		{ id: 1, name: 'Apple', logo: '/svgs/goods.svg', products: 1234, followers: 50000 },
		{ id: 2, name: 'Samsung', logo: '/svgs/goods.svg', products: 2341, followers: 45000 },
		{ id: 3, name: 'Sony', logo: '/svgs/goods.svg', products: 1567, followers: 38000 },
		{ id: 4, name: 'Huawei', logo: '/svgs/goods.svg', products: 987, followers: 42000 },
		{ id: 5, name: 'Xiaomi', logo: '/svgs/goods.svg', products: 2100, followers: 48000 },
		{ id: 6, name: 'Nike', logo: '/svgs/goods.svg', products: 3456, followers: 65000 },
		{ id: 7, name: 'Adidas', logo: '/svgs/goods.svg', products: 3210, followers: 58000 },
		{ id: 8, name: 'UNIQLO', logo: '/svgs/goods.svg', products: 2890, followers: 52000 },
		{ id: 9, name: 'ZARA', logo: '/svgs/goods.svg', products: 2654, followers: 47000 },
		{ id: 10, name: 'Panasonic', logo: '/svgs/goods.svg', products: 1890, followers: 35000 },
		{ id: 11, name: 'Canon', logo: '/svgs/goods.svg', products: 876, followers: 28000 },
		{ id: 12, name: 'Nikon', logo: '/svgs/goods.svg', products: 654, followers: 25000 },
		{ id: 13, name: 'LEGO', logo: '/svgs/goods.svg', products: 1234, followers: 40000 },
		{ id: 14, name: 'Nintendo', logo: '/svgs/goods.svg', products: 567, followers: 55000 },
		{ id: 15, name: 'Microsoft', logo: '/svgs/goods.svg', products: 432, followers: 45000 },
		{ id: 16, name: 'Dell', logo: '/svgs/goods.svg', products: 789, followers: 32000 },
		{ id: 17, name: 'HP', logo: '/svgs/goods.svg', products: 890, followers: 30000 },
		{ id: 18, name: 'Lenovo', logo: '/svgs/goods.svg', products: 1456, followers: 38000 },
		{ id: 19, name: 'ASUS', logo: '/svgs/goods.svg', products: 1123, followers: 35000 },
		{ id: 20, name: 'Acer', logo: '/svgs/goods.svg', products: 987, followers: 28000 },
		{ id: 21, name: 'LG', logo: '/svgs/goods.svg', products: 1678, followers: 40000 },
		{ id: 22, name: 'Philips', logo: '/svgs/goods.svg', products: 1234, followers: 33000 },
		{ id: 23, name: 'Dyson', logo: '/svgs/goods.svg', products: 345, followers: 42000 },
		{ id: 24, name: 'Bose', logo: '/svgs/goods.svg', products: 234, followers: 38000 }
	];

	// 品牌分类
	const brandCategories = [
		{ id: 'all', name: 'すべて', icon: '🏪' },
		{ id: 'electronics', name: 'デジタル', icon: '📱' },
		{ id: 'fashion', name: 'ファッション', icon: '👕' },
		{ id: 'home', name: 'ホーム', icon: '🏠' },
		{ id: 'sports', name: 'スポーツ', icon: '⚽' }
	];

	let selectedCategory = 'all';
	let searchQuery = '';
	let displayedBrands = brands;

	// 搜索和筛选品牌
	$: {
		displayedBrands = brands.filter(brand => {
			const matchSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
			return matchSearch;
		});
	}
</script>

<main class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<!-- 页面标题 -->
		<div class="mb-6">
			<h1 class="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">人気ブランド</h1>
			<p class="text-sm text-gray-600 sm:text-base">お気に入りのブランドを見つけよう</p>
		</div>

		<!-- 搜索栏 -->
		<div class="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
			<div class="relative">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="ブランドを検索..."
					class="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-12 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
				/>
				<svg class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
		</div>

		<!-- 分类标签 -->
		<div class="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
			<div class="flex flex-wrap gap-2">
				{#each brandCategories as category}
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

		<!-- 品牌网格 -->
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{#each displayedBrands as brand (brand.id)}
				<a
					href="/brands/{brand.id}"
					class="group overflow-hidden rounded-xl bg-white p-4 no-underline shadow-sm transition-all duration-300 hover:shadow-lg"
				>
					<!-- 品牌Logo -->
					<div class="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-50">
						<img
							src={brand.logo}
							alt={brand.name}
							class="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110"
							loading="lazy"
						/>
					</div>

					<!-- 品牌名称 -->
					<h3 class="mb-2 truncate text-center text-sm font-semibold text-gray-900">
						{brand.name}
					</h3>

					<!-- 统计信息 -->
					<div class="space-y-1 text-xs text-gray-500">
						<div class="flex items-center justify-center gap-1">
							<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
							<span>{brand.products.toLocaleString('ja-JP')}商品</span>
						</div>
						<div class="flex items-center justify-center gap-1">
							<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<span>{(brand.followers / 1000).toFixed(1)}K</span>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- 空状态 -->
		{#if displayedBrands.length === 0}
			<div class="rounded-2xl bg-white py-16 text-center shadow-sm">
				<svg class="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p class="text-gray-500">該当するブランドが見つかりませんでした</p>
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
</style>