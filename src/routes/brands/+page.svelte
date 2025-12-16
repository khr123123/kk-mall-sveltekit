<script lang="ts">
	import { onMount } from 'svelte';

	// Mock品牌数据
	const brands = [
		{ id: 1, name: 'Apple', logo: '/svgs/goods.svg', products: 1234, followers: 50000, 
		  category: 'electronics', isPopular: true, rating: 4.8, discounts: 15 },
		{ id: 2, name: 'Samsung', logo: '/svgs/goods.svg', products: 2341, followers: 45000,
		  category: 'electronics', isPopular: true, rating: 4.7, discounts: 20 },
		{ id: 3, name: 'Sony', logo: '/svgs/goods.svg', products: 1567, followers: 38000,
		  category: 'electronics', isPopular: true, rating: 4.6, discounts: 18 },
		{ id: 4, name: 'Nike', logo: '/svgs/goods.svg', products: 3456, followers: 65000,
		  category: 'fashion', isPopular: true, rating: 4.9, discounts: 25 },
		{ id: 5, name: 'Adidas', logo: '/svgs/goods.svg', products: 3210, followers: 58000,
		  category: 'fashion', isPopular: true, rating: 4.8, discounts: 22 },
		{ id: 6, name: 'UNIQLO', logo: '/svgs/goods.svg', products: 2890, followers: 52000,
		  category: 'fashion', isPopular: true, rating: 4.5, discounts: 30 },
		{ id: 7, name: 'Dyson', logo: '/svgs/goods.svg', products: 345, followers: 42000,
		  category: 'home', isPopular: true, rating: 4.7, discounts: 12 },
		{ id: 8, name: 'Panasonic', logo: '/svgs/goods.svg', products: 1890, followers: 35000,
		  category: 'home', isPopular: false, rating: 4.4, discounts: 10 },
		{ id: 9, name: 'Nintendo', logo: '/svgs/goods.svg', products: 567, followers: 55000,
		  category: 'electronics', isPopular: true, rating: 4.9, discounts: 5 },
		{ id: 10, name: 'Canon', logo: '/svgs/goods.svg', products: 876, followers: 28000,
		  category: 'electronics', isPopular: false, rating: 4.6, discounts: 15 },
		{ id: 11, name: 'LG', logo: '/svgs/goods.svg', products: 1678, followers: 40000,
		  category: 'electronics', isPopular: false, rating: 4.5, discounts: 18 },
		{ id: 12, name: 'Microsoft', logo: '/svgs/goods.svg', products: 432, followers: 45000,
		  category: 'electronics', isPopular: false, rating: 4.7, discounts: 10 }
	];

	// 品牌分类
	const brandCategories = [
		{ id: 'all', name: 'すべて', icon: '🏪', count: brands.length },
		{ id: 'electronics', name: 'デジタル', icon: '📱', count: brands.filter(b => b.category === 'electronics').length },
		{ id: 'fashion', name: 'ファッション', icon: '👕', count: brands.filter(b => b.category === 'fashion').length },
		{ id: 'home', name: 'ホーム', icon: '🏠', count: brands.filter(b => b.category === 'home').length },
		{ id: 'other', name: 'その他', icon: '📦', count: brands.filter(b => !['electronics', 'fashion', 'home'].includes(b.category)).length }
	];

	let selectedCategory = 'all';
	let searchQuery = '';
	let viewMode = 'grid'; // grid, list
	let sortBy = 'popular'; // popular, name, products

	// 排序功能
	let displayedBrands = $derived([...brands]
		.filter(brand => {
			if (selectedCategory !== 'all') {
				return brand.category === selectedCategory;
			}
			return true;
		})
		.filter(brand => 
			brand.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
		.sort((a, b) => {
			switch (sortBy) {
				case 'popular':
					return b.followers - a.followers;
				case 'name':
					return a.name.localeCompare(b.name);
				case 'products':
					return b.products - a.products;
				case 'rating':
					return b.rating - a.rating;
				default:
					return b.followers - a.followers;
			}
		})
	);

	// 跟随品牌
	function followBrand(brand: any, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('フォロー:', brand.name);
		alert(`${brand.name}をフォローしました！`);
	}

	// 查看品牌
	function viewBrand(brand: any, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('ブランド詳細:', brand.name);
		// 这里可以导航到品牌详情页
	}
</script>

<main class="min-h-screen bg-white">
	<!-- 页面头部 -->
	<div class="bg-gradient-to-r from-indigo-700 to-purple-600 text-white">
		<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<h1 class="mb-3 text-3xl font-bold sm:text-4xl">人気ブランド</h1>
			<p class="text-lg text-white/90">あなたのお気に入りブランドを見つけましょう</p>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- 搜索栏 -->
		<div class="mb-8">
			<div class="relative">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="ブランド名で検索..."
					class="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-12 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
				/>
				<svg class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
		</div>

		<!-- 分类标签 -->
		<div class="mb-8">
			<div class="flex flex-wrap gap-2">
				{#each brandCategories as category}
					<button
						on:click={() => (selectedCategory = category.id)}
						class="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition-colors {selectedCategory === category.id
							? 'bg-gray-900 text-white'
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						<span class="text-base">{category.icon}</span>
						{category.name}
						<span class="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
							{category.count}
						</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- 排序和视图切换 -->
		<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div class="text-gray-600">
				<span class="font-semibold">{displayedBrands.length}</span> 件のブランド
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
					<option value="popular">人気順</option>
					<option value="name">名前順</option>
					<option value="products">商品数順</option>
					<option value="rating">評価順</option>
				</select>
			</div>
		</div>

		<!-- 空状态 -->
		{#if displayedBrands.length === 0}
			<div class="rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
				<svg class="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<h3 class="mb-2 text-lg font-medium text-gray-900">ブランドが見つかりません</h3>
				<p class="text-gray-600">検索条件に一致するブランドがありませんでした</p>
			</div>
		{:else}
			<!-- 列表视图 -->
			{#if viewMode === 'list'}
				<div class="space-y-4">
					{#each displayedBrands as brand}
						<a
							href="/brands/{brand.id}"
							class="group flex gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 no-underline transition-colors hover:border-gray-300 hover:shadow-lg"
						>
							<!-- 品牌Logo -->
							<div class="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
								<div class="flex h-full w-full items-center justify-center text-gray-400">
									ブランドロゴ
								</div>
								{#if brand.isPopular}
									<div class="absolute top-2 left-2 rounded bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
										HOT
									</div>
								{/if}
							</div>

							<!-- 品牌信息 -->
							<div class="flex flex-1 flex-col justify-between">
								<div>
									<div class="mb-2 flex items-start justify-between">
										<h3 class="text-xl font-bold text-gray-900 group-hover:text-gray-700">
											{brand.name}
										</h3>
										{#if brand.discounts > 0}
											<span class="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
												{brand.discounts}%OFF
											</span>
										{/if}
									</div>

									<!-- 评价 -->
									<div class="mb-4 flex items-center gap-2">
										<div class="flex">
											{#each Array(5) as _, i}
												<svg
													class="h-4 w-4 {i < Math.floor(brand.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											{/each}
										</div>
										<span class="text-sm font-medium text-gray-900">{brand.rating.toFixed(1)}</span>
									</div>

									<!-- 统计信息 -->
									<div class="flex items-center gap-6 text-sm text-gray-600">
										<div class="flex items-center gap-1">
											<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
												/>
											</svg>
											<span class="font-medium">{brand.products.toLocaleString('ja-JP')}</span>
											<span>商品</span>
										</div>
										<div class="flex items-center gap-1">
											<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
												/>
											</svg>
											<span class="font-medium">{(brand.followers / 1000).toFixed(0)}K</span>
											<span>フォロワー</span>
										</div>
									</div>
								</div>

								<!-- 按钮 -->
								<div class="mt-4 flex gap-3">
									<button
										on:click|preventDefault={(e) => followBrand(brand, e)}
										class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
									>
										フォロー
									</button>
									<button
										on:click|preventDefault={(e) => viewBrand(brand, e)}
										class="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
									>
										商品を見る
									</button>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<!-- 网格视图 -->
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each displayedBrands as brand}
						<div class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-lg">
							<a href="/brands/{brand.id}" class="block no-underline">
								<!-- 品牌Logo和标签 -->
								<div class="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
									<div class="flex h-full w-full items-center justify-center">
										<div class="text-2xl font-bold text-gray-300">{brand.name.charAt(0)}</div>
									</div>
									
									<!-- 热门标签 -->
									{#if brand.isPopular}
										<div class="absolute top-3 left-3">
											<div class="rounded bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-bold text-white shadow-md">
												人気ブランド
											</div>
										</div>
									{/if}

									<!-- 折扣标签 -->
									{#if brand.discounts > 0}
										<div class="absolute top-3 right-3">
											<div class="rounded bg-gradient-to-r from-red-600 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-md">
												{brand.discounts}%OFF
											</div>
										</div>
									{/if}
								</div>

								<!-- 品牌信息 -->
								<div class="p-6">
									<!-- 品牌名称和评价 -->
									<div class="mb-4">
										<h3 class="mb-2 text-xl font-bold text-gray-900 group-hover:text-gray-700">
											{brand.name}
										</h3>
										<div class="flex items-center gap-2">
											<div class="flex">
												{#each Array(5) as _, i}
													<svg
														class="h-4 w-4 {i < Math.floor(brand.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}"
														viewBox="0 0 20 20"
													>
														<path
															d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
														/>
													</svg>
												{/each}
											</div>
											<span class="text-sm font-medium text-gray-900">{brand.rating.toFixed(1)}</span>
										</div>
									</div>

									<!-- 统计信息 -->
									<div class="mb-6 space-y-3 text-sm text-gray-600">
										<div class="flex items-center justify-between">
											<span class="text-gray-500">商品数</span>
											<span class="font-medium text-gray-900">{brand.products.toLocaleString('ja-JP')}</span>
										</div>
										<div class="flex items-center justify-between">
											<span class="text-gray-500">フォロワー</span>
											<span class="font-medium text-gray-900">{(brand.followers / 1000).toFixed(1)}K</span>
										</div>
									</div>
								</div>
							</a>

							<!-- 按钮 -->
							<div class="border-t border-gray-100 p-6">
								<div class="flex gap-3">
									<button
										on:click|preventDefault={(e) => followBrand(brand, e)}
										class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
									>
										フォロー
									</button>
									<button
										on:click|preventDefault={(e) => viewBrand(brand, e)}
										class="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
									>
										商品を見る
									</button>
								</div>
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
	.aspect-video {
		aspect-ratio: 16 / 9;
	}
</style>