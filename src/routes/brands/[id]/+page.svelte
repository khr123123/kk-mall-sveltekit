<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import PocketBase from 'pocketbase';

	const pb = new PocketBase('http://127.0.0.1:8090');

	let brand: any = null;
	let products: any[] = [];
	let loading = true;
	let selectedCategory = 'all';
	let sortBy = 'featured'; // featured, price-low, price-high, rating, new

	// 获取唯一的分类
	$: categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

	// 过滤和排序商品
	$: displayedProducts = products
		.filter((product) => {
			if (selectedCategory === 'all') return true;
			return product.category === selectedCategory;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case 'price-low':
					return a.price - b.price;
				case 'price-high':
					return b.price - a.price;
				case 'rating':
					return (b.rating || 0) - (a.rating || 0);
				case 'new':
					return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
				case 'featured':
				default:
					return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
			}
		});

	// 加载品牌和商品数据
	async function loadBrandData(brandId: string) {
		try {
			loading = true;

			// 加载品牌信息
			brand = await pb.collection('brands').getOne(brandId);

			// 加载该品牌的商品
			products = await pb.collection('products').getFullList({
				filter: `brand = "${brandId}"`,
				sort: '-created'
			});
		} catch (error) {
			console.error('データの読み込みに失敗:', error);
		} finally {
			loading = false;
		}
	}

	// 计算折扣百分比
	function getDiscountPercentage(original: number, current: number): number {
		if (!original || original <= current) return 0;
		return Math.round(((original - current) / original) * 100);
	}

	// 添加到购物车
	function addToCart(product: any, event: Event) {
		event.preventDefault();
		event.stopPropagation();
		console.log('カートに追加:', product.name);
		alert(`${product.name}をカートに追加しました！`);
	}

	// 跟随品牌
	function followBrand() {
		console.log('フォロー:', brand.name);
		alert(`${brand.name}をフォローしました！`);
	}

	// 跳转到产品详情页面
	function navigateToProduct(productId: string) {
		window.location.href = `http://localhost:5173/product/${productId}`;
	}

	onMount(() => {
		const brandId = $page.params.id;
		if (brandId) {
			loadBrandData(brandId);
		}
	});
</script>

<svelte:head>
	<title>{brand?.name || 'ブランド'} | Brand Store</title>
</svelte:head>

<main class="min-h-screen bg-neutral-50">
	{#if loading}
		<!-- 加载状态 -->
		<div class="flex min-h-screen items-center justify-center">
			<div class="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900"></div>
		</div>
	{:else if !brand}
		<!-- 错误状态 -->
		<div class="flex min-h-screen items-center justify-center">
			<div class="text-center">
				<svg
					class="mx-auto mb-4 h-16 w-16 text-neutral-300"
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
				<h3 class="mb-2 text-lg font-medium text-neutral-900">ブランドが見つかりません</h3>
				<p class="mb-6 text-neutral-600">お探しのブランドは存在しないか、削除されました</p>
				<a
					href="/brands"
					class="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white no-underline hover:bg-neutral-800"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					ブランド一覧に戻る
				</a>
			</div>
		</div>
	{:else}
		<!-- 品牌头部 -->
		<div class="border-b border-neutral-200 bg-white">
			<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<!-- 返回按钮 -->
				<a
					href="/brands"
					class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 no-underline hover:text-neutral-900"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					ブランド一覧に戻る
				</a>

				<div class="flex flex-col gap-8 md:flex-row md:items-start">
					<!-- 品牌Logo -->
					<div
						class="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
					>
						{#if brand.logo}
							<img src={brand.logo} alt={brand.name} class="h-full w-full object-contain p-4" />
						{:else}
							<div class="flex h-full w-full items-center justify-center">
								<span class="text-5xl font-bold text-neutral-300">{brand.name.charAt(0)}</span>
							</div>
						{/if}
					</div>

					<!-- 品牌信息 -->
					<div class="flex-1">
						<div class="mb-4 flex items-start justify-between">
							<div>
								<div class="mb-2 flex items-center gap-3">
									<h1 class="text-3xl font-bold text-neutral-900">{brand.name}</h1>
									{#if brand.isPopular}
										<span class="rounded bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
											人気
										</span>
									{/if}
									{#if brand.discounts > 0}
										<span class="rounded bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
											{brand.discounts}%OFF
										</span>
									{/if}
								</div>

								<!-- 评分 -->
								<div class="mb-4 flex items-center gap-2">
									<div class="flex">
										{#each Array(5) as _, i}
											<svg
												class="h-5 w-5 {i < Math.floor(brand.rating)
													? 'fill-current text-neutral-900'
													: 'text-neutral-300'}"
												viewBox="0 0 20 20"
											>
												<path
													d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
												/>
											</svg>
										{/each}
									</div>
									<span class="text-sm font-medium text-neutral-900">{brand.rating.toFixed(1)}</span>
									<span class="text-sm text-neutral-600">
										• {(brand.followers / 1000).toFixed(0)}K フォロワー
									</span>
								</div>
							</div>

							<!-- 跟随按钮 -->
							<button
								on:click={followBrand}
								class="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
							>
								<div class="flex items-center gap-2">
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
										/>
									</svg>
									フォロー
								</div>
							</button>
						</div>

						<!-- 描述 -->
						<p class="text-neutral-600">{brand.description}</p>

						<!-- 统计信息 -->
						<div class="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
							<div class="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
								<div class="mb-1 text-2xl font-bold text-neutral-900">{products.length}</div>
								<div class="text-sm text-neutral-600">商品数</div>
							</div>
							<div class="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
								<div class="mb-1 text-2xl font-bold text-neutral-900">
									{(brand.followers / 1000).toFixed(0)}K
								</div>
								<div class="text-sm text-neutral-600">フォロワー</div>
							</div>
							<div class="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
								<div class="mb-1 text-2xl font-bold text-neutral-900">{brand.rating.toFixed(1)}</div>
								<div class="text-sm text-neutral-600">評価</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 商品列表 -->
		<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<!-- 过滤和排序 -->
			<div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h2 class="mb-4 text-2xl font-bold text-neutral-900">商品一覧</h2>
					<div class="flex flex-wrap gap-2">
						{#each categories as category}
							<button
								on:click={() => (selectedCategory = category)}
								class="rounded-lg border px-4 py-2 text-sm font-medium transition-all {selectedCategory ===
								category
									? 'border-neutral-900 bg-neutral-900 text-white'
									: 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'}"
							>
								{category === 'all' ? 'すべて' : category}
							</button>
						{/each}
					</div>
				</div>

				<div>
					<select
						bind:value={sortBy}
						class="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
					>
						<option value="featured">おすすめ順</option>
						<option value="new">新着順</option>
						<option value="price-low">価格が低い順</option>
						<option value="price-high">価格が高い順</option>
						<option value="rating">評価順</option>
					</select>
				</div>
			</div>

			<!-- 商品网格 -->
			{#if displayedProducts.length === 0}
				<div class="rounded-lg border border-neutral-200 bg-white py-16 text-center">
					<svg
						class="mx-auto mb-4 h-16 w-16 text-neutral-300"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
						/>
					</svg>
					<h3 class="mb-2 text-lg font-medium text-neutral-900">商品が見つかりません</h3>
					<p class="text-neutral-600">このブランドにはまだ商品がありません</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each displayedProducts as product}
						<div
							class="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-md cursor-pointer"
							on:click={() => navigateToProduct(product.id)}
						>
							<!-- 商品图片 -->
							<div class="relative aspect-square overflow-hidden bg-neutral-50">
								{#if product.image}
									<img
										src={product.image}
										alt={product.name}
										class="h-full w-full object-cover transition-transform group-hover:scale-105"
									/>
								{:else}
									<div class="flex h-full w-full items-center justify-center">
										<svg
											class="h-16 w-16 text-neutral-300"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
									</div>
								{/if}

								<!-- 标签 -->
								<div class="absolute top-3 left-3 flex flex-col gap-2">
									{#if product.isNew}
										<span class="rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white">
											新着
										</span>
									{/if}
									{#if product.originalPrice && product.originalPrice > product.price}
										<span class="rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white">
											{getDiscountPercentage(product.originalPrice, product.price)}%OFF
										</span>
									{/if}
								</div>

								<!-- 库存状态 -->
								{#if product.stock === 0}
									<div
										class="absolute inset-0 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm"
									>
										<span class="rounded bg-white px-4 py-2 text-sm font-medium text-neutral-900">
											売り切れ
										</span>
									</div>
								{/if}
							</div>

							<!-- 商品信息 -->
							<div class="p-6">
								<div class="mb-2">
									{#if product.category}
										<span class="text-xs text-neutral-500">{product.category}</span>
									{/if}
								</div>

								<h3 class="mb-2 text-lg font-semibold text-neutral-900 line-clamp-2 hover:text-neutral-700">
									{product.name}
								</h3>

								{#if product.description}
									<p class="mb-4 text-sm text-neutral-600 line-clamp-2 hover:text-neutral-500">
										{product.description}
									</p>
								{/if}

								<!-- 评分 -->
								{#if product.rating}
									<div class="mb-4 flex items-center gap-2">
										<div class="flex">
											{#each Array(5) as _, i}
												<svg
													class="h-4 w-4 {i < Math.floor(product.rating)
														? 'fill-current text-neutral-900'
														: 'text-neutral-300'}"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											{/each}
										</div>
										<span class="text-sm font-medium text-neutral-900">{product.rating.toFixed(1)}</span>
										{#if product.reviewCount}
											<span class="text-sm text-neutral-500">({product.reviewCount})</span>
										{/if}
									</div>
								{/if}

								<!-- 价格 -->
								<div class="mb-4">
									<div class="flex items-baseline gap-2">
										<span class="text-2xl font-bold text-neutral-900">
											¥{product.price.toLocaleString('ja-JP')}
										</span>
										{#if product.originalPrice && product.originalPrice > product.price}
											<span class="text-sm text-neutral-500 line-through">
												¥{product.originalPrice.toLocaleString('ja-JP')}
											</span>
										{/if}
									</div>
								</div>

								<!-- 购买按钮 -->
								<button
									on:click={(e) => {
										e.stopPropagation();
										addToCart(product, e);
									}}
									disabled={product.stock === 0}
									class="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-neutral-900"
								>
									{product.stock === 0 ? '売り切れ' : 'カートに追加'}
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
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

	.cursor-pointer {
		cursor: pointer;
	}
</style>