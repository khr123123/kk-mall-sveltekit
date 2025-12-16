<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { quickCategories } from '$lib/mockdata/Category.js';
	import { goto } from '$app/navigation';

	// 状態管理
	let mainId = $state(0);
	let currentCategory = $state<any>(null);
	let products = $state<any[]>([]);
	let isLoading = $state(false);
	let sortBy = $state('newest');

	// 模拟商品数据
	const mockProducts = [
		{
			id: 1,
			name: 'iPhone 15 Pro Max 256GB',
			price: 149800,
			originalPrice: 169800,
			rating: 4.8,
			reviews: 1204,
			image: '/products/iphone.jpg',
			isNew: true,
			isHot: true,
			discount: 12,
			inStock: true,
			tags: ['Apple', '256GB', '5G']
		},
		{
			id: 2,
			name: 'Samsung Galaxy S24 Ultra',
			price: 134800,
			originalPrice: 154800,
			rating: 4.7,
			reviews: 987,
			image: '/products/galaxy.jpg',
			isNew: true,
			isHot: true,
			discount: 13,
			inStock: true,
			tags: ['Samsung', 'SPen', 'AIカメラ']
		},
		{
			id: 3,
			name: 'Google Pixel 8 Pro',
			price: 119800,
			originalPrice: 139800,
			rating: 4.6,
			reviews: 654,
			image: '/products/pixel.jpg',
			isNew: true,
			isHot: false,
			discount: 14,
			inStock: true,
			tags: ['Google', 'AI', 'カメラ']
		},
		{
			id: 4,
			name: 'Xiaomi 14 Pro',
			price: 99800,
			originalPrice: 119800,
			rating: 4.5,
			reviews: 543,
			image: '/products/xiaomi.jpg',
			isNew: false,
			isHot: true,
			discount: 17,
			inStock: true,
			tags: ['Xiaomi', 'Leica', '高性能']
		},
		{
			id: 5,
			name: 'Sony Xperia 5 V',
			price: 129800,
			originalPrice: 149800,
			rating: 4.4,
			reviews: 321,
			image: '/products/sony.jpg',
			isNew: false,
			isHot: false,
			discount: 13,
			inStock: true,
			tags: ['Sony', 'カメラ', 'OLED']
		},
		{
			id: 6,
			name: 'OnePlus 12',
			price: 109800,
			originalPrice: 129800,
			rating: 4.7,
			reviews: 432,
			image: '/products/oneplus.jpg',
			isNew: true,
			isHot: true,
			discount: 15,
			inStock: false,
			tags: ['OnePlus', '高速充電', '120Hz']
		},
		{
			id: 7,
			name: 'ASUS ROG Phone 8',
			price: 139800,
			originalPrice: 159800,
			rating: 4.6,
			reviews: 289,
			image: '/products/rog.jpg',
			isNew: true,
			isHot: false,
			discount: 13,
			inStock: true,
			tags: ['ゲーミング', 'ASUS', '冷却システム']
		},
		{
			id: 8,
			name: 'Nothing Phone 2',
			price: 79800,
			originalPrice: 99800,
			rating: 4.3,
			reviews: 876,
			image: '/products/nothing.jpg',
			isNew: false,
			isHot: true,
			discount: 20,
			inStock: true,
			tags: ['Nothing', '透明デザイン', 'Glyph']
		}
	];

	// 初始化
	onMount(() => {
		updateCategory();

		afterNavigate((navigation) => {
			if (navigation.to?.params) {
				updateCategory();
			}
		});
	});

	function updateCategory() {
		mainId = Number(page.params.parentId);
		currentCategory = quickCategories.find((item) => item.id === mainId) || null;

		isLoading = true;
		// 模拟API调用获取商品
		setTimeout(() => {
			products = [...mockProducts];
			isLoading = false;
		}, 300);
	}

	// 格式化价格
	function formatPrice(price: number) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			maximumFractionDigits: 0
		}).format(price);
	}

	// 添加到购物车
	function addToCart(product: any, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('添加到购物车:', product.name);
		// 这里可以调用购物车store
	}

	// 收藏商品
	function addToWishlist(product: any, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('收藏商品:', product.name);
	}

	// 排序功能
	function sortProducts(sortType: string) {
		sortBy = sortType;
		const sorted = [...products];

		switch (sortType) {
			case 'price-low':
				sorted.sort((a, b) => a.price - b.price);
				break;
			case 'price-high':
				sorted.sort((a, b) => b.price - a.price);
				break;
			case 'popular':
				sorted.sort((a, b) => b.reviews - a.reviews);
				break;
			case 'rating':
				sorted.sort((a, b) => b.rating - a.rating);
				break;
			default:
				sorted.sort((a, b) => b.id - a.id); // 新着順
		}

		products = sorted;
	}
</script>

<div class="min-h-screen bg-white">
	<!-- 面包屑导航 -->
	<div class="border-b border-gray-200 bg-gray-50">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<nav class="py-3">
				<div class="flex items-center text-sm">
					<a href="#" class="text-gray-600 hover:text-gray-900">すべてのカテゴリ</a>
					<svg
						class="mx-2 h-3 w-3 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
					<span class="font-medium text-gray-900">{currentCategory?.name}</span>
				</div>
			</nav>
		</div>
	</div>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<!-- 页面头部 -->
		<div class="mb-8">
			<div class="mb-6 flex items-center gap-4">
				<div class="rounded-xl bg-gray-100 p-3">
					<img src={currentCategory?.icon} alt={currentCategory?.name} class="h-10 w-10" />
				</div>
				<div class="flex-1">
					<h1 class="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">{currentCategory?.name}</h1>
					<p class="text-gray-600">最新の{currentCategory?.name}をチェックしましょう</p>
				</div>
			</div>

			<!-- 子分类导航 -->
			<div class="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
				{#if currentCategory?.children}
					{#each currentCategory.children as subCategory}
						<a
							href="/category/{mainId}/{subCategory.id}"
							class="rounded-lg border px-4 py-2 whitespace-nowrap transition-colors {page.url.pathname.includes(
								`/category/${mainId}/${subCategory.id}`
							)
								? 'border-gray-900 bg-gray-900 text-white'
								: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
						>
							{subCategory.name}
						</a>
					{/each}
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-8 lg:flex-row">
			<!-- 侧边栏筛选 -->
			<aside class="flex-shrink-0 lg:w-64">
				<div class="sticky top-6">
					<!-- 价格筛选 -->
					<div class="mb-6 rounded-lg border border-gray-200 bg-white">
						<div class="border-b border-gray-200 p-4">
							<h3 class="font-semibold text-gray-900">価格帯</h3>
						</div>
						<div class="space-y-3 p-4">
							<label class="flex items-center">
								<input type="radio" name="price" class="h-4 w-4 text-gray-900" checked />
								<span class="ml-2 text-gray-700">すべて</span>
							</label>
							<label class="flex items-center">
								<input type="radio" name="price" class="h-4 w-4 text-gray-900" />
								<span class="ml-2 text-gray-700">¥0 - ¥50,000</span>
							</label>
							<label class="flex items-center">
								<input type="radio" name="price" class="h-4 w-4 text-gray-900" />
								<span class="ml-2 text-gray-700">¥50,000 - ¥100,000</span>
							</label>
							<label class="flex items-center">
								<input type="radio" name="price" class="h-4 w-4 text-gray-900" />
								<span class="ml-2 text-gray-700">¥100,000 - ¥200,000</span>
							</label>
							<label class="flex items-center">
								<input type="radio" name="price" class="h-4 w-4 text-gray-900" />
								<span class="ml-2 text-gray-700">¥200,000以上</span>
							</label>
						</div>
					</div>

					<!-- 品牌筛选 -->
					<div class="rounded-lg border border-gray-200 bg-white">
						<div class="border-b border-gray-200 p-4">
							<h3 class="font-semibold text-gray-900">ブランド</h3>
						</div>
						<div class="space-y-3 p-4">
							<label class="flex items-center">
								<input
									type="checkbox"
									class="h-4 w-4 rounded border-gray-300 text-gray-900"
									checked
								/>
								<span class="ml-2 text-gray-700">Apple</span>
							</label>
							<label class="flex items-center">
								<input
									type="checkbox"
									class="h-4 w-4 rounded border-gray-300 text-gray-900"
									checked
								/>
								<span class="ml-2 text-gray-700">Samsung</span>
							</label>
							<label class="flex items-center">
								<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-900" />
								<span class="ml-2 text-gray-700">Google</span>
							</label>
							<label class="flex items-center">
								<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-900" />
								<span class="ml-2 text-gray-700">Sony</span>
							</label>
							<label class="flex items-center">
								<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-900" />
								<span class="ml-2 text-gray-700">Xiaomi</span>
							</label>
						</div>
					</div>
				</div>
			</aside>

			<!-- 主内容区 -->
			<div class="flex-1">
				<!-- 排序和统计 -->
				<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div class="text-gray-600">
						全 <span class="font-semibold">{products.length}</span> 件の商品
					</div>
					<div class="flex items-center gap-3">
						<select
							bind:value={sortBy}
							onchange={(e) => sortProducts((e.target as HTMLSelectElement).value)}
							class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
						>
							<option value="newest">新着順</option>
							<option value="price-low">価格が安い順</option>
							<option value="price-high">価格が高い順</option>
							<option value="popular">人気順</option>
							<option value="rating">評価順</option>
						</select>
					</div>
				</div>

				<!-- 加载状态 -->
				{#if isLoading}
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each Array(8) as _}
							<div class="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
								<div class="mb-4 h-48 rounded-lg bg-gray-200"></div>
								<div class="mb-2 h-4 rounded bg-gray-200"></div>
								<div class="mb-4 h-3 w-3/4 rounded bg-gray-200"></div>
								<div class="h-6 w-1/2 rounded bg-gray-200"></div>
							</div>
						{/each}
					</div>
				{:else}
					<!-- 商品网格 -->
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each products as product}
							<a
								href="/product/{product.id}"
								class="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg"
							>
								<!-- 商品图片 -->
								<div class="relative overflow-hidden bg-gray-100">
									<!-- 占位图片 -->
									<div class="flex aspect-square items-center justify-center">
										<div class="text-sm text-gray-400">商品イメージ</div>
									</div>

									<!-- 标签 -->
									<div class="absolute top-3 left-3 flex flex-col gap-2">
										{#if product.discount > 0}
											<span class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
												-{product.discount}%
											</span>
										{/if}
										{#if product.isNew}
											<span class="rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">
												NEW
											</span>
										{/if}
									</div>

									<!-- 收藏按钮 -->
									<button
										onclick={(e) => {
											e.preventDefault();
											addToWishlist(product, e);
										}}
										class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white"
										aria-label="お気に入りに追加"
									>
										<svg
											class="h-5 w-5 text-gray-600"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.5"
												d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
											/>
										</svg>
									</button>

									<!-- 缺货标记 -->
									{#if !product.inStock}
										<div class="absolute inset-0 flex items-center justify-center bg-black/50">
											<span class="text-sm font-semibold text-white">SOLD OUT</span>
										</div>
									{/if}
								</div>

								<!-- 商品信息 -->
								<div class="p-4">
									<!-- 评价 -->
									<div class="mb-2 flex items-center gap-1">
										<div class="flex">
											{#each Array(5) as _, i}
												<svg
													class="h-4 w-4 {i < Math.floor(product.rating)
														? 'fill-current text-yellow-400'
														: 'text-gray-300'}"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											{/each}
										</div>
										<span class="ml-1 text-sm text-gray-600">{product.rating}</span>
										<span class="text-sm text-gray-400">({product.reviews})</span>
									</div>

									<!-- 商品名 -->
									<h3 class="mb-2 line-clamp-2 font-medium text-gray-900 group-hover:text-gray-700">
										{product.name}
									</h3>

									<!-- 价格 -->
									<div class="mb-4 flex items-center gap-2">
										<span class="text-lg font-bold text-gray-900">
											{formatPrice(product.price)}
										</span>
										{#if product.originalPrice > product.price}
											<span class="text-sm text-gray-500 line-through">
												{formatPrice(product.originalPrice)}
											</span>
										{/if}
									</div>

									<!-- 标签 -->
									{#if product.tags.length > 0}
										<div class="mb-4 flex flex-wrap gap-1">
											{#each product.tags as tag}
												<span
													class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
												>
													{tag}
												</span>
											{/each}
										</div>
									{/if}

									<!-- 添加到购物车按钮 -->
									<button
										onclick={(e) => {
											e.preventDefault();
											addToCart(product, e);
										}}
										class="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
										disabled={!product.inStock}
									>
										{#if product.inStock}
											カートに追加
										{:else}
											売り切れ
										{/if}
									</button>
								</div>
							</a>
						{/each}
					</div>

					<!-- 分页 -->
					<div class="mt-8 flex justify-center">
						<nav class="flex items-center gap-2">
							<button
								class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

							<button
								class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 font-medium text-white"
								>1</button
							>
							<button
								class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
								>2</button
							>
							<button
								class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
								>3</button
							>

							<button
								class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
							>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</nav>
					</div>
				{/if}
			</div>
		</div>
	</main>
</div>

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
