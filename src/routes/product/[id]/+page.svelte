<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { categoryStore } from '$lib/stores/categoryStore';
	import type { RecordModel } from 'pocketbase';
	import { goto } from '$app/navigation';
	import { cart } from '$lib/stores/cartStore';
	import { starRatingMd, minus, plus, spinner, spinnerWhite, checkIcon } from '$lib/icons/svgs';
	import { pb } from '$lib/services/PBConfig';

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
		stock?: number;
		isHot?: boolean;
		isNew?: boolean;
		discount?: number;
		rating?: number;
		reviews?: number;
		specs?: Record<string, string | number>;
	}

	interface ProductSku extends RecordModel {
		product_id: string;
		specs: Record<string, string>;
		price: number;
		stock: number;
		status: boolean;
	}

	// 状态管理
	let product = $state<Product | null>(null);
	let skus = $state<ProductSku[]>([]);
	let specOptions = $state<{ name: string; values: string[] }[]>([]);
	let selectedSpecs = $state<Record<string, string>>({});
	let selectedImageIndex = $state(0);
	let quantity = $state(1);
	let isLoading = $state(false);
	let addingToCart = $state(false);
	let message = $state('');

	// 计算属性
	let images = $derived(getImages());
	let categoryName = $derived(getCategoryName());
	let features = $derived(getFeatures());
	let specifications = $derived(getSpecifications());
	let currentSku = $derived<ProductSku | null>(getCurrentSku());
	let displayPrice = $derived(getDisplayPrice());
	let displayOriginalPrice = $derived(product?.originalPrice || 0);
	let discountPercentage = $derived(product?.discount || 0);
	let isStockAvailable = $derived(getIsStockAvailable());
	let stockCount = $derived(getStockCount());

	const productId = page.params.id;

	// 工具函数
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

		let category = $categoryStore.categories.find((c) => c.id === product?.category_id);
		if (category) return category.name;

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
		if (feats.length === 0) {
			feats.push('高品質', '送料無料');
		}
		return feats;
	}

	function getSpecifications() {
		if (!product) return [];
		const specs: { key: string; value: string }[] = [];
		if (product.brand) {
			specs.push({ key: 'ブランド', value: product.brand });
		}

		if (product.specs) {
			Object.entries(product.specs).forEach(([key, value]) => {
				specs.push({ key: key.charAt(0).toUpperCase() + key.slice(1), value: String(value) });
			});
		}
		return specs;
	}

	function extractSpecOptions(skus: ProductSku[]) {
		const map: Record<string, Set<string>> = {};

		skus.forEach((sku) => {
			Object.entries(sku.specs).forEach(([key, value]) => {
				if (!map[key]) map[key] = new Set();
				map[key].add(value);
			});
		});

		return Object.entries(map).map(([name, values]) => ({
			name,
			values: Array.from(values)
		}));
	}

	function getCurrentSku(): ProductSku | null {
		if (skus.length === 0) return null;

		return (
			skus.find((sku) =>
				Object.entries(selectedSpecs).every(([key, value]) => sku.specs[key] === value)
			) ?? null
		);
	}

	function getDisplayPrice() {
		if (currentSku) {
			return currentSku.price;
		}
		return product?.price || 0;
	}

	function getIsStockAvailable() {
		if (currentSku) {
			return currentSku.status && currentSku.stock > 0;
		}
		return product?.inStock !== false;
	}

	function getStockCount() {
		if (currentSku) {
			return currentSku.stock;
		}
		return product?.stock || (isStockAvailable ? 10 : 0);
	}

	async function loadProduct() {
		try {
			if (!productId) throw new Error('商品IDが未定義です');
			// 加载商品数据
			const responseProd = await pb.collection('products').getOne(productId as string, {
				expand: 'brand'
			});
			product = responseProd as Product;

			// 加载SKU数据
			const responseProdSkus = await pb.collection('product_skus').getFullList({
				filter: `product_id = "${productId}"`
			});
			skus = responseProdSkus as ProductSku[];

			// 处理规格选项
			if (skus.length > 0) {
				specOptions = extractSpecOptions(skus);

				// 初始化默认规格选择
				const initialSpecs: Record<string, string> = {};
				specOptions.forEach((spec) => {
					if (spec.values.length > 0) {
						initialSpecs[spec.name] = spec.values[0];
					}
				});
				selectedSpecs = initialSpecs;
			}
		} catch (error) {
			console.error('Error fetching product:', error);
			// 这里可以添加错误处理，比如显示错误信息
		}
	}

	// 事件处理函数
	function handleSpecSelect(specName: string, value: string) {
		selectedSpecs = { ...selectedSpecs, [specName]: value };
	}

	async function addToCart() {
		if (!product || !isStockAvailable) return;

		isLoading = true;
		message = '';

		// 检查登录状态
		if (!pb.authStore.model) {
			goto('/login?redirect=/product/' + product.id);
			isLoading = false;
			return;
		}

		try {
			// 构建添加到购物车的数据
			const cartItem = {
				productId: product.id,
				skuId: currentSku?.id, // 如果有SKU则记录SKU ID
				specs: selectedSpecs,
				quantity,
				price: displayPrice,
				name: product.name_ja || product.name,
				image: images[0] || ''
			};
			// TODO
			await cart.addItem(product.id);
			message = 'カートに追加しました！';

			// 3秒后清除消息
			setTimeout(() => {
				message = '';
			}, 3000);
		} catch (error) {
			message = 'エラーが発生しました';
			console.error('Failed to add to cart:', error);
		} finally {
			isLoading = false;
		}
	}

	function buyNow() {
		if (!product || !isStockAvailable) return;

		isLoading = true;
		// 这里可以跳转到立即购买页面或结账流程
		setTimeout(() => {
			isLoading = false;
			// 临时使用alert，实际项目中应该跳转到结账页面
			alert(`購入手続きに進みます（商品: ${product?.name_ja || product?.name}）`);
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

	// 生命周期
	onMount(async () => {
		await loadProduct();
	});
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

						<!-- 商品描述 -->
						{#if product.description}
							<div class="border-t border-b border-gray-100 py-6">
								<h3 class="mb-3 text-sm font-medium text-gray-900">商品説明</h3>
								<p class="leading-relaxed text-gray-600">{@html product.description}</p>
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
							{#if product.isNew}
								<span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
									新商品
								</span>
							{/if}
						</div>

						<!-- 商品名称 -->
						<h1 class="text-2xl leading-tight font-normal text-gray-900">
							{product.name_ja || product.name}
						</h1>

						<!-- 评分和评价 -->
						{#if product.rating !== undefined}
							<div class="flex items-center space-x-4">
								<div class="flex items-center">
									{#each Array(5) as _, i}
										<div
											class={i < Math.floor(product.rating || 0)
												? 'text-yellow-400'
												: 'text-gray-300'}
										>
											{@html starRatingMd}
										</div>
									{/each}
									<span class="ml-2 text-sm text-gray-600">{(product.rating || 0).toFixed(1)}</span>
								</div>
								<span class="text-sm text-gray-500">({product.reviews || 0}件のレビュー)</span>
							</div>
						{/if}

						<!-- 价格 -->
						<div class="space-y-2">
							<div class="flex items-center space-x-4">
								<span class="text-3xl font-light text-gray-900"
									>¥{displayPrice.toLocaleString()}</span
								>
								<div class="text-sm text-gray-500">税込</div>
								{#if displayOriginalPrice > displayPrice}
									<span class="text-lg text-gray-400 line-through"
										>¥{displayOriginalPrice.toLocaleString()}</span
									>
									<span class="rounded bg-red-50 px-2 py-1 text-sm font-medium text-red-600">
										{Math.round((1 - displayPrice / displayOriginalPrice) * 100)}% OFF
									</span>
								{/if}

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
							</div>
						</div>
						<!-- SKU 规格选择 -->
						{#if specOptions.length > 0}
							<div class="space-y-2">
								{#each specOptions as spec}
									<div>
										<label class="mb-1 block text-sm font-medium text-gray-700">
											{spec.name}
										</label>
										<div class="flex flex-wrap gap-2">
											{#each spec.values as value}
												<button
													on:click={() => handleSpecSelect(spec.name, value)}
													class={`rounded border px-4 py-2 text-sm transition-all
														${
															selectedSpecs[spec.name] === value
																? 'border-gray-900 bg-gray-900 text-white'
																: 'border-gray-300 bg-white text-gray-700 hover:border-gray-900'
														}
														${
															!skus.some((sku) =>
																Object.entries({ ...selectedSpecs, [spec.name]: value }).every(
																	([key, val]) => sku.specs[key] === val
																)
															)
																? 'cursor-not-allowed opacity-50'
																: ''
														}`}
													disabled={!skus.some((sku) =>
														Object.entries({ ...selectedSpecs, [spec.name]: value }).every(
															([key, val]) => sku.specs[key] === val
														)
													)}
												>
													{value}
												</button>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- 成功消息 -->
						{#if message}
							<div class="rounded-lg bg-green-50 p-4">
								<div class="flex items-center">
									<div class="flex-shrink-0">
										<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
											<path
												fill-rule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clip-rule="evenodd"
											/>
										</svg>
									</div>
									<div class="ml-3">
										<p class="text-sm font-medium text-green-800">{message}</p>
									</div>
								</div>
							</div>
						{/if}

						<!-- 购买选项 -->
						<div class="space-y-4">
							<!-- 数量选择 -->
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">数量</label>
								<div class="flex items-center">
									<button
										on:click={decrementQuantity}
										class="flex h-10 w-10 items-center justify-center rounded-l border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
										disabled={quantity <= 1 || !isStockAvailable}
									>
										{@html minus}
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
										disabled={quantity >= stockCount || !isStockAvailable}
									>
										{@html plus}
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
										<div class="mr-3 -ml-1 text-gray-900">
											{@html spinner}
										</div>
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
											<div class="mr-3 -ml-1 text-white">
												{@html spinnerWhite}
											</div>
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
									<div class="mt-0.5 flex-shrink-0 text-gray-400">
										{@html checkIcon}
									</div>
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
											<td class="w-1/3 px-6 py-4 text-sm font-medium text-gray-900">
												{spec.key}
											</td>

											{#if spec.key === 'ブランド'}
												<!-- svelte-ignore event_directive_deprecated -->
												<td
													class="cursor-pointer px-6 py-4 text-sm text-blue-600 hover:underline"
													on:click={() => goto(`/brands/${spec.value}`)}
												>
													{product.expand?.brand.name}
												</td>
											{:else}
												<td class="px-6 py-4 text-sm text-gray-600">
													{spec.value}
												</td>
											{/if}
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
