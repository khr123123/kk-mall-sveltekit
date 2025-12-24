<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import PocketBase from 'pocketbase';
	import { categoryStore } from '$lib/stores/categoryStore';
	import type { RecordModel } from 'pocketbase';
	import { goto } from '$app/navigation';
	import { cart } from '$lib/stores/cartStore';

	// 商品数据结构
	interface Product extends RecordModel {
		name: string;
		name_ja?: string;
		description: string;
		price: number;
		originalPrice?: number;
		category_id: string;
		brand?: string;
		image?: string;
		images?: string[];
		inStock?: boolean;
		stock?: number; // Optional
		isHot?: boolean;
		isNew?: boolean;
		discount?: number;
		rating?: number;
		reviews?: number;
		specs?: Record<string, string | number>;
	}

	const pb = new PocketBase('http://localhost:8090');

	let product = $state<Product | null>(null);
	let selectedImageIndex = $state(0);
	let quantity = $state(1);
	let isLoading = $state(false);

	// 计算属性
	let images = $derived(getImages());
	let categoryName = $derived(getCategoryName());
	let features = $derived(getFeatures());
	let specifications = $derived(getSpecifications());
	let displayPrice = $derived(product?.price || 0);
	let displayOriginalPrice = $derived(product?.originalPrice || 0);
	let discountPercentage = $derived(product?.discount || 0);
	let isStockAvailable = $derived(product?.inStock !== false); // Default to true if undefined, or strictly check false
	let stockCount = $derived(product?.stock || (isStockAvailable ? 10 : 0)); // Fallback stock

	const productId = page.params.id;

	onMount(async () => {
		try {
			if (!productId) throw new Error('商品IDが未定義です');
			const response = (await pb.collection('products').getOne(productId as string)) as Product;
			product = response;
		} catch (error) {
			console.error('Error fetching product:', error);
		}
	});

	function getImages() {
		if (!product) return [];
		const imgs: string[] = [];
		if (product.image) imgs.push(product.image);
		if (product.images && Array.isArray(product.images)) {
			imgs.push(...product.images);
		}
		// Deduplicate if needed
		return [...new Set(imgs)];
	}

	function getCategoryName() {
		if (!product || !product.category_id) return '商品';

		// Search in top level categories
		let category = $categoryStore.categories.find((c) => c.id === product?.category_id);
		if (category) return category.name;

		// Deep search if needed (assuming structure)
		for (const cat of $categoryStore.categories) {
			if (cat.expand?.children) {
				const sub = cat.expand.children.find((c: any) => c.id === product?.category_id);
				if (sub) return sub.name;
			}
		}
		return 'カテゴリ';
	}

	function getFeatures() {
		if (!product) return [];
		const feats = [];
		if (product.isNew) feats.push('新商品');
		if (product.isHot) feats.push('人気商品');
		if (product.discount && product.discount > 0) feats.push(`${product.discount}%割引中`);
		// Add generic features if list is empty
		if (feats.length === 0) {
			feats.push('高品質', '送料無料');
		}
		return feats;
	}

	function getSpecifications() {
		if (!product) return [];
		const specs = [];
		if (product.brand) specs.push({ key: 'ブランド', value: product.brand });
		if (product.specs) {
			Object.entries(product.specs).forEach(([key, value]) => {
				specs.push({ key: key.charAt(0).toUpperCase() + key.slice(1), value: String(value) });
			});
		}
		return specs;
	}
	let selectedColor = '';
	let selectedSize = '';
	let addingToCart = false;
	let message = '';
	async function addToCart() {
		if (!product) return;
		isLoading = true;
		if (!pb.authStore.model) {
			goto('/login?redirect=/product/' + product.id);
			return;
		}
		addingToCart = true;
		message = '';
		try {
			await cart.addItem(product.id, quantity);
			message = 'カートに追加しました！';

			// 3秒后清除消息
			setTimeout(() => {
				message = '';
			}, 3000);
		} catch (error) {
			message = 'エラーが発生しました';
			console.error('Failed to add to cart:', error);
		} finally {
			addingToCart = false;
		}
	}
	function buyNow() {
		if (!product) return;
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
			alert(`購入手続きに進みます`);
		}, 500);
	}

	function incrementQuantity() {
		if (quantity < stockCount) {
			quantity++;
		}
	}

	function decrementQuantity() {
		if (quantity > 1) {
			quantity--;
		}
	}
</script>

<main class="min-h-screen bg-white pb-16">
	{#if product}
		<!-- 商品图片展示区 -->
		<div class="bg-gray-50">
			<div class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
				<!-- 面包屑导航 -->
				<nav class="mb-6">
					<ol class="flex items-center space-x-2 text-sm">
						<li>
							<a href="/product" class="text-gray-500 transition-colors hover:text-gray-700"
								>商品一覧</a
							>
						</li>
						<li class="text-gray-400">/</li>
						<li>
							<a
								href="/category/{product.category_id}"
								class="text-gray-500 transition-colors hover:text-gray-700">{categoryName}</a
							>
						</li>
						<li class="text-gray-400">/</li>
						<li class="max-w-[200px] truncate text-gray-900">{product.name_ja || product.name}</li>
					</ol>
				</nav>

				<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<!-- 商品主图 -->
					<div>
						<div class="mb-4 overflow-hidden rounded-lg bg-white">
							{#if images.length > 0}
								<img
									src={images[selectedImageIndex]}
									alt={product.name_ja || product.name}
									class="h-[400px] w-full bg-white object-contain"
								/>
							{:else}
								<div
									class="flex h-[400px] w-full items-center justify-center bg-gray-100 text-gray-400"
								>
									No Image
								</div>
							{/if}
						</div>

						<!-- 缩略图列表 -->
						{#if images.length > 1}
							<div class="flex space-x-3 overflow-x-auto pb-2">
								{#each images as image, index}
									<button
										on:click={() => (selectedImageIndex = index)}
										class={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedImageIndex === index ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}
									>
										<img
											src={image}
											alt="商品画像 {index + 1}"
											class="h-full w-full object-cover"
										/>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- 商品信息 -->
					<div class="space-y-6">
						<!-- 分类标签 -->
						<div class="flex items-center space-x-3">
							<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
								{categoryName}
							</span>
							{#if stockCount < 10 && isStockAvailable}
								<span class="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
									残りわずか
								</span>
							{/if}
						</div>

						<!-- 商品名称 -->
						<h1 class="text-2xl leading-tight font-normal text-gray-900">
							{product.name_ja || product.name}
						</h1>

						<!-- 评分和评价 -->
						<div class="flex items-center space-x-4">
							<div class="flex items-center">
								{#each Array(5) as _, i}
									<svg
										class={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
										/>
									</svg>
								{/each}
								<span class="ml-2 text-sm text-gray-600">{(product.rating || 0).toFixed(1)}</span>
							</div>
							<span class="text-sm text-gray-500">({product.reviews || 0}件のレビュー)</span>
						</div>

						<!-- 价格 -->
						<div class="space-y-2">
							<div class="flex items-center space-x-4">
								<span class="text-3xl font-light text-gray-900"
									>¥{displayPrice.toLocaleString()}</span
								>
								{#if displayOriginalPrice > displayPrice}
									<span class="text-lg text-gray-400 line-through"
										>¥{displayOriginalPrice.toLocaleString()}</span
									>
									<span class="rounded bg-red-50 px-2 py-1 text-sm font-medium text-red-600">
										{Math.round((1 - displayPrice / displayOriginalPrice) * 100)}% OFF
									</span>
								{/if}
							</div>
							<div class="text-sm text-gray-500">税込</div>
						</div>

						<!-- 库存状态 -->
						<div class="flex items-center text-sm">
							<div
								class={`mr-2 h-2 w-2 rounded-full ${isStockAvailable ? 'bg-green-500' : 'bg-red-500'}`}
							></div>
							{#if isStockAvailable}
								<span class="text-gray-600"
									>在庫あり ({stockCount > 0 ? stockCount + '個' : '在庫あり'})</span
								>
							{:else}
								<span class="text-red-600">在庫切れ</span>
							{/if}
						</div>

						<!-- 商品描述 -->
						<div class="border-t border-b border-gray-100 py-6">
							<h3 class="mb-3 text-sm font-medium text-gray-900">商品説明</h3>
							<p class="leading-relaxed text-gray-600">{product.description}</p>
						</div>

						<!-- 购买选项 -->
						<div class="space-y-4">
							<!-- 数量选择 -->
							<div>
								<label class="mb-2 block text-sm font-medium text-gray-700">数量</label>
								<div class="flex items-center">
									<button
										on:click={decrementQuantity}
										class="flex h-10 w-10 items-center justify-center rounded-l border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
										disabled={quantity <= 1}
									>
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M20 12H4"
											/>
										</svg>
									</button>
									<input
										type="text"
										readonly
										value={quantity}
										class="h-10 w-16 border-t border-b border-gray-300 bg-white text-center"
									/>
									<button
										on:click={incrementQuantity}
										class="flex h-10 w-10 items-center justify-center rounded-r border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
										disabled={quantity >= stockCount}
									>
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 4v16m8-8H4"
											/>
										</svg>
									</button>
								</div>
							</div>

							<!-- 操作按钮 -->
							<div class="flex space-x-3">
								<button
									on:click={addToCart}
									disabled={isLoading || !isStockAvailable}
									class="flex flex-1 items-center justify-center border-2 border-gray-900 px-6 py-3 font-medium text-gray-900 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{#if isLoading}
										<svg
											class="mr-3 -ml-1 h-5 w-5 animate-spin text-gray-900"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										処理中...
									{:else}
										カートに追加
									{/if}
								</button>

								<button
									on:click={buyNow}
									disabled={isLoading || !isStockAvailable}
									class="flex-1 bg-gray-900 px-6 py-3 font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{#if isLoading}
										<div class="flex items-center justify-center">
											<svg
												class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													class="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													stroke-width="4"
												></circle>
												<path
													class="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											処理中...
										</div>
									{:else}
										今すぐ購入
									{/if}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 详细内容区域 -->
		<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<!-- 左侧：产品特性 -->
				<div class="space-y-8 lg:col-span-2">
					<!-- 产品特性 -->
					<section>
						<h2 class="mb-6 border-b border-gray-100 pb-3 text-xl font-normal text-gray-900">
							製品特長
						</h2>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							{#each features as feature}
								<div class="flex items-start space-x-3">
									<svg
										class="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									<span class="text-gray-600">{feature}</span>
								</div>
							{/each}
						</div>
					</section>

					<!-- 规格参数 -->
					<section>
						<h2 class="mb-6 border-b border-gray-100 pb-3 text-xl font-normal text-gray-900">
							仕様
						</h2>
						<div class="overflow-hidden rounded-lg bg-gray-50">
							<table class="min-w-full divide-y divide-gray-200">
								<tbody class="divide-y divide-gray-200 bg-white">
									{#each specifications as spec}
										<tr class="transition-colors hover:bg-gray-50">
											<td
												class="w-1/3 px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900"
												>{spec.key}</td
											>
											<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600">{spec.value}</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</section>
				</div>

				<!-- 右侧：配送信息等 -->
				<div class="space-y-6">
					<!-- 配送信息 -->
					<div class="rounded-lg bg-gray-50 p-6">
						<h3 class="mb-4 text-lg font-normal text-gray-900">配送情報</h3>
						<div class="space-y-4">
							<div>
								<div class="mb-2 flex items-center space-x-2">
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
										/>
									</svg>
									<span class="text-sm font-medium text-gray-900">通常配送</span>
								</div>
								<p class="text-sm text-gray-600">注文から1-3営業日で発送</p>
								<p class="mt-1 text-xs text-gray-500">配送料: ¥500 (5,000円以上で無料)</p>
							</div>

							<div>
								<div class="mb-2 flex items-center space-x-2">
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<span class="text-sm font-medium text-gray-900">即日配送</span>
								</div>
								<p class="text-sm text-gray-600">午前中注文で当日発送</p>
								<p class="mt-1 text-xs text-gray-500">追加料金: ¥1,000</p>
							</div>
						</div>
					</div>

					<!-- 退货政策 -->
					<div class="rounded-lg bg-gray-50 p-6">
						<h3 class="mb-4 text-lg font-normal text-gray-900">返品・交換</h3>
						<ul class="space-y-3 text-sm text-gray-600">
							<li class="flex items-start space-x-2">
								<svg
									class="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span>未使用品に限り30日以内返品可能</span>
							</li>
							<li class="flex items-start space-x-2">
								<svg
									class="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span>初期不良は無料交換</span>
							</li>
							<li class="flex items-start space-x-2">
								<svg
									class="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span>返品送料はお客様負担</span>
							</li>
						</ul>
					</div>

					<!-- 分享 -->
					<div class="rounded-lg bg-gray-50 p-6">
						<h3 class="mb-4 text-lg font-normal text-gray-900">シェア</h3>
						<div class="flex space-x-3">
							<button
								aria-label="Facebookでシェア"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
							>
								<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
									/>
								</svg>
							</button>
							<button
								aria-label="Twitterでシェア"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 text-white transition-colors hover:bg-blue-500"
							>
								<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
									/>
								</svg>
							</button>
							<button
								aria-label="YouTube"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
							>
								<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- 加载状态 -->
		<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<!-- 图片加载 -->
				<div>
					<div class="mb-4 h-[400px] animate-pulse rounded-lg bg-gray-200"></div>
					<div class="flex space-x-3">
						{#each Array(4) as _}
							<div class="h-20 w-20 animate-pulse rounded-lg bg-gray-200"></div>
						{/each}
					</div>
				</div>
				<!-- 信息加载 -->
				<div class="space-y-6">
					<div class="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
					<div class="h-10 w-full animate-pulse rounded bg-gray-200"></div>
					<div class="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
					<div class="h-12 w-40 animate-pulse rounded bg-gray-200"></div>
					<div class="space-y-4">
						<div class="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
						<div class="flex space-x-3">
							<div class="h-12 flex-1 animate-pulse rounded bg-gray-200"></div>
							<div class="h-12 flex-1 animate-pulse rounded bg-gray-200"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	/* PocketBase风格优化 */
	.bg-gray-50 {
		background-color: #fafafa;
	}

	.border-gray-100 {
		border-color: #f5f5f5;
	}

	/* 平滑过渡效果 */
	.transition-all {
		transition: all 0.2s ease-in-out;
	}

	/* 图片hover效果 */
	img {
		transition: opacity 0.3s ease;
	}

	img:hover {
		opacity: 0.95;
	}

	/* 自定义滚动条 */
	::-webkit-scrollbar {
		width: 6px;
	}

	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 3px;
	}

	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
