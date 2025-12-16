<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { quickCategories } from '$lib/mockdata/Category.js';

	// 状態管理
	let mainId = $state(0);
	let subId = $state(0);
	let currentCategory = $state<any>(null);
	let currentSubCategory = $state<any>(null);
	let products = $state<any[]>([]);
	let isLoading = $state(false);
	let sortBy = $state('newest');

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
		subId = Number(page.params.childId);

		currentCategory = quickCategories.find((item) => item.id === mainId) || null;
		currentSubCategory =
			currentCategory?.children?.find((child: { id: number }) => child.id === subId) || null;

		isLoading = true;
		// 模拟API调用获取商品
		setTimeout(() => {
			products = generateProductsForSubCategory(subId);
			isLoading = false;
		}, 300);
	}

	function generateProductsForSubCategory(subId: number) {
		const productNames = {
			101: [
				'iPhone 15 Pro 128GB',
				'iPhone 15 Plus 256GB',
				'iPhone 14 128GB',
				'iPhone SE (第3世代)',
				'Samsung Galaxy S24 256GB',
				'Google Pixel 8 128GB'
			],
			102: [
				'Apple MagSafe シリコンケース',
				'Spigen 耐衝撃ケース',
				'ESR クリアケース',
				'Casetify カスタムケース',
				'OtterBox 防弾ケース',
				'Razer Arctech 冷却ケース'
			],
			103: [
				'Apple 20W USB-C充電器',
				'Anker 65W GaN充電器',
				'Samsung 45W 急速充電器',
				'Belkin 3-in-1 ワイヤレス充電器',
				'UGREEN 100W 車載充電器',
				'RAVPower 90W PD充電器'
			]
		};

		const names = productNames[subId as keyof typeof productNames] || [
			'高品質スマートフォン',
			'最新モデルスマホ',
			'高性能携帯電話',
			'人気スマートフォン',
			'エントリーモデル',
			'フラッグシップモデル'
		];

		return names.map((name, index) => ({
			id: subId * 10 + index + 1,
			name: name,
			price: Math.floor(20000 + Math.random() * 180000),
			originalPrice: Math.floor(25000 + Math.random() * 200000),
			rating: 4.0 + Math.random() * 1.0,
			reviews: Math.floor(50 + Math.random() * 1000),
			image: `/products/item-${index + 1}.jpg`,
			isNew: Math.random() > 0.5,
			isHot: Math.random() > 0.7,
			discount: Math.random() > 0.6 ? Math.floor(5 + Math.random() * 30) : 0,
			inStock: Math.random() > 0.2,
			tags: ['人気', '新商品', 'おすすめ'].slice(0, Math.floor(Math.random() * 3))
		}));
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
					<a href="/category/{mainId}" class="text-gray-600 hover:text-gray-900"
						>{currentCategory?.name}</a
					>
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
					<span class="font-medium text-gray-900">{currentSubCategory?.name}</span>
				</div>
			</nav>
		</div>
	</div>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<!-- 页面头部 -->
		<header class="mb-8">
			<h1 class="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
				{currentSubCategory?.name}
			</h1>
			<p class="mb-6 text-gray-600">
				{currentCategory?.name} › {currentSubCategory?.name} の専門商品
			</p>

			<!-- 子分类导航 -->
			<div class="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
				{#if currentCategory?.children}
					{#each currentCategory.children as subCategory}
						<a
							href="/category/{mainId}/{subCategory.id}"
							class="rounded-lg border px-4 py-2 whitespace-nowrap transition-colors {subId ===
							subCategory.id
								? 'border-gray-900 bg-gray-900 text-white'
								: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
						>
							{subCategory.name}
						</a>
					{/each}
				{/if}
			</div>
		</header>

		<!-- 特色商品 -->
		{#if !isLoading && products.length > 0}
			<!-- 推荐商品 -->
			<div class="mb-8">
				<h2 class="mb-4 text-xl font-semibold text-gray-900">おすすめ商品</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each products.filter((p) => p.isHot).slice(0, 3) as product}
						<div class="rounded-xl border border-gray-200 bg-gray-50 p-6">
							<div class="flex items-start gap-4">
								<div
									class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100"
								>
									<div class="text-xs text-gray-400">画像</div>
								</div>
								<div>
									<h3 class="mb-1 font-medium text-gray-900">{product.name}</h3>
									<div class="mb-2 flex items-center gap-2">
										<span class="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span
										>
										{#if product.discount > 0}
											<span class="text-sm font-medium text-red-600">-{product.discount}%</span>
										{/if}
									</div>
									<button
										onclick={(e) => {
											e.preventDefault();
											addToCart(product, e);
										}}
										class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
									>
										カートに追加
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="flex flex-col gap-8 lg:flex-row">
			<!-- 侧边栏 -->
			<aside class="flex-shrink-0 lg:w-64">
				<div class="sticky top-6 space-y-6">
					<!-- 排序选项 -->
					<div class="rounded-lg border border-gray-200 bg-white p-4">
						<h3 class="mb-3 font-semibold text-gray-900">並び替え</h3>
						<div class="space-y-2">
							<button
								onclick={() => sortProducts('newest')}
								class="w-full rounded px-3 py-2 text-left hover:bg-gray-50 {sortBy === 'newest'
									? 'bg-gray-100 font-medium'
									: ''}"
							>
								新着順
							</button>
							<button
								onclick={() => sortProducts('price-low')}
								class="w-full rounded px-3 py-2 text-left hover:bg-gray-50 {sortBy === 'price-low'
									? 'bg-gray-100 font-medium'
									: ''}"
							>
								価格が安い順
							</button>
							<button
								onclick={() => sortProducts('price-high')}
								class="w-full rounded px-3 py-2 text-left hover:bg-gray-50 {sortBy === 'price-high'
									? 'bg-gray-100 font-medium'
									: ''}"
							>
								価格が高い順
							</button>
							<button
								onclick={() => sortProducts('rating')}
								class="w-full rounded px-3 py-2 text-left hover:bg-gray-50 {sortBy === 'rating'
									? 'bg-gray-100 font-medium'
									: ''}"
							>
								評価順
							</button>
						</div>
					</div>

					<!-- 在库状态 -->
					<div class="rounded-lg border border-gray-200 bg-white p-4">
						<h3 class="mb-3 font-semibold text-gray-900">在庫状態</h3>
						<div class="space-y-2">
							<label class="flex items-center">
								<input
									type="checkbox"
									class="h-4 w-4 rounded border-gray-300 text-gray-900"
									checked
								/>
								<span class="ml-2 text-gray-700">在庫あり</span>
							</label>
							<label class="flex items-center">
								<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-900" />
								<span class="ml-2 text-gray-700">お取り寄せ</span>
							</label>
						</div>
					</div>
				</div>
			</aside>

			<!-- 主内容区 -->
			<div class="flex-1">
				<!-- 统计和排序 -->
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
							<option value="rating">評価順</option>
						</select>
					</div>
				</div>

				<!-- 加载状态 -->
				{#if isLoading}
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each Array(6) as _}
							<div class="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
								<div class="mb-4 h-48 rounded-lg bg-gray-200"></div>
								<div class="mb-2 h-4 rounded bg-gray-200"></div>
								<div class="mb-4 h-3 w-3/4 rounded bg-gray-200"></div>
								<div class="h-6 w-1/2 rounded bg-gray-200"></div>
							</div>
						{/each}
					</div>
				{:else if products.length === 0}
					<!-- 空状态 -->
					<div class="rounded-xl bg-gray-50 p-12 text-center">
						<svg
							class="mx-auto mb-4 h-12 w-12 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h3 class="mb-2 text-lg font-medium text-gray-900">商品が見つかりません</h3>
						<p class="mx-auto mb-6 max-w-md text-gray-600">
							このカテゴリーにはまだ商品がありません。 他のカテゴリーを探してみましょう。
						</p>
						<a
							href="/category/{mainId}"
							class="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
						>
							親カテゴリーに戻る
						</a>
					</div>
				{:else}
					<!-- 商品网格 -->
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each products as product}
							<a
								href="/product/{product.id}"
								class="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg"
							>
								<!-- 商品图片 -->
								<div class="relative overflow-hidden bg-gray-100">
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
										<span class="ml-1 text-sm text-gray-600">{product.rating.toFixed(1)}</span>
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
