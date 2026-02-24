<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { categoryStore } from '$lib/stores/categoryStore';
	import type { RecordModel } from 'pocketbase';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { cart } from '$lib/stores/cartStore';
	import { pb } from '$lib/services/PBConfig';
	import { profileService } from '$lib/services/profileService';
	import LoginModal from '$lib/components/headercomponents/LoginModal.svelte';

	// 商品数据结构
	interface Product extends RecordModel {
		id: string;
		name: string;
		price: number;
		description :string;
		originalPrice: number;
		discount?: number;
		category_id: string;
		brand?: string;
		image?: string;
		images?: string[];
		inStock?: boolean;
		stock?: number;
		isHot?: boolean;
		isNew?: boolean;
		rating?: number;
		reviews?: number;
		specs?: Record<string, string | number>;
		tags?: Record<string, string | number>;
		expand?: {
			brand?: {
				name: string;
			};
		};
	}

	// SKU数据结构
	interface ProductSku extends RecordModel {
		product_id: string;
		specs: Record<string, string>;
		price: number;
		stock: number;
		status: boolean;
	}

	// 已移除未使用的 CartItem 声明

	// 规格选项结构
	interface SpecOption {
		name: string;
		values: string[];
	}

	// 商品特性结构
	interface Specification {
		key: string;
		value: string;
	}

	// 状态管理
	let product = $state<Product | null>(null);
	let skus = $state<ProductSku[]>([]);
	let specOptions = $state<SpecOption[]>([]);
	let selectedSpecs = $state<Record<string, string>>({});
	let selectedImageIndex = $state<number>(0);
	let quantity = $state<number>(1);
	let isLoading = $state<boolean>(false);
	let message = $state<string>('');
	let isFavorite = $state<boolean>(false);
	let isSpecsLoading = $state<boolean>(true);
	let isFavoriteLoading = $state<boolean>(true);
	let showLoginModal = $state<boolean>(false);
	// 获取商品图片
	const getImages = (): string[] => {
		if (!product) return [];
		const imgs: string[] = [];
		if (product.image) imgs.push(product.image);
		if (product.images && Array.isArray(product.images)) {
			imgs.push(...product.images);
		}
		// 去重
		return [...new Set(imgs)];
	};
	// 获取商品分类名称
	const getCategoryName = (): string => {
		if (!product || !product.category_id) return '商品';

		const category = $categoryStore.categories.find((c) => c.id === product?.category_id);
		if (category) return category.name;

		for (const cat of $categoryStore.categories) {
			if (cat.expand?.children) {
				const sub = cat.expand.children.find((c: any) => c.id === product?.category_id);
				if (sub) return sub.name;
			}
		}
		return 'カテゴリ';
	};
	// 获取商品特性
	const getFeatures = (): string[] => {
		if (!product) return [];
		const feats: string[] = [];
		if (product.isNew) feats.push('新商品');
		if (product.isHot) feats.push('人気商品');
		if (product.discount && product.discount > 0) feats.push(`${product.discount}%割引中`);
		if (feats.length === 0) {
			feats.push('高品質', '送料無料');
		}
		return feats;
	};
	// 获取商品规格(对品牌特殊处理)
	const getSpecifications = (): Specification[] => {
		if (!product) return [];
		const specs: Specification[] = [];
		if (product.brand) {
			specs.push({ key: 'ブランド', value: product.brand });
		}
		if (product.specs) {
			Object.entries(product.specs).forEach(([key, value]) => {
				specs.push({ key: key.charAt(0).toUpperCase() + key.slice(1), value: String(value) });
			});
		}
		return specs;
	};
	// 获取规格选项
	const extractSpecOptions = (skus: ProductSku[]): SpecOption[] => {
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
	};
	// 获取当前选中的 SKU
	const getCurrentSku = (): ProductSku | null => {
		if (skus.length === 0) return null;
		return (
			skus.find((sku) =>
				Object.entries(selectedSpecs).every(([key, value]) => sku.specs[key] === value)
			) ?? null
		);
	};
	// 获取显示价格
	const getDisplayPrice = (): number => {
		if (currentSku) {
			return currentSku.price;
		}
		return product?.price || 0;
	};
	// 检查库存是否可用
	const getIsStockAvailable = (): boolean => {
		if (currentSku) {
			return currentSku.status && currentSku.stock > 0;
		}
		return product?.inStock !== false;
	};
	// 获取库存数量
	const getStockCount = (): number => {
		if (currentSku) {
			return currentSku.stock;
		}
		return product?.stock || (isStockAvailable ? 10 : 0);
	};
	// 计算属性
	let images = $derived<string[]>(getImages());
	let categoryName = $derived<string>(getCategoryName());
	let features = $derived<string[]>(getFeatures());
	let specifications = $derived<Specification[]>(getSpecifications());
	let currentSku = $derived<ProductSku | null>(getCurrentSku());
	let displayPrice = $derived<number>(getDisplayPrice());
	let displayOriginalPrice = $derived<number>(product?.originalPrice || 0);
	let isStockAvailable = $derived<boolean>(getIsStockAvailable());
	let stockCount = $derived<number>(getStockCount());

	const productId: string | undefined = page.params.id;
	const stars = [0, 1, 2, 3, 4];
	const thumbPlaceholders = [0, 1, 2, 3];

	// 处理规格选择
	const handleSpecSelect = (specName: string, value: string): void => {
		selectedSpecs = { ...selectedSpecs, [specName]: value };
	};

	// 添加到购物车
	// 在你的商品详情页中
	// 添加到购物车
	const addToCart = async (): Promise<void> => {
		if (!product || !isStockAvailable) return;

		isLoading = true;
		message = '';

		// 检查登录状态
		if (!pb.authStore.record) {
			showLoginModal = true;
			isLoading = false;
			return;
		}

		try {
			// 构建添加到购物车的数据
			await cart.addItem(
				product.id,
				quantity,
				currentSku?.id, // SKU ID
				selectedSpecs // 规格信息
			);

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
	};

	// 立即购买
	const buyNow = (): void => {
		if (!product || !isStockAvailable) return;
		isLoading = true;
		// 这里可以跳转到立即购买页面或结账流程
		setTimeout(() => {
			isLoading = false;
			// 临时使用alert,实际项目中应该跳转到结账页面
			alert(`購入手続きに進みます(商品: ${product?.name_ja || product?.name})`);
		}, 500);
	};

	// 增加数量
	const incrementQuantity = (): void => {
		if (quantity < stockCount) {
			quantity++;
		}
	};

	// 减少数量
	const decrementQuantity = (): void => {
		if (quantity > 1) {
			quantity--;
		}
	};

	// 加载商品数据
	const loadProduct = async (): Promise<void> => {
		try {
			if (productId) {
				const responseProd = await pb.collection('products').getOne(productId, {
					expand: 'brand'
				});
				product = responseProd as Product;

				isSpecsLoading = true;
				const responseProdSkus = await pb.collection('product_skus').getFullList({
					filter: `product_id = "${productId}"`
				});
				skus = responseProdSkus as ProductSku[];

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
				isSpecsLoading = false;

				isFavoriteLoading = true;
				const user = pb.authStore.record;
				if (user && product?.id) {
					const favRes = await profileService.isFavorite(user.id, product.id);
					if (favRes.success) {
						isFavorite = !!favRes.isFavorite;
					}
				} else {
					isFavorite = false;
				}
				isFavoriteLoading = false;
			}
		} catch (error) {
			console.error('Error fetching product:', error);
		} finally {
			/* noop */
		}
	};

	onMount(async () => {
		await loadProduct();
		// 登录状态改变时同步收藏状态
		pb.authStore.onChange(async () => {
			if (product?.id) {
				const user = pb.authStore.record;
				isFavoriteLoading = true;
				if (user) {
					const favRes = await profileService.isFavorite(user.id, product.id);
					if (favRes.success) {
						isFavorite = !!favRes.isFavorite;
					}
				} else {
					isFavorite = false;
				}
				isFavoriteLoading = false;
			}
		});
	});

	// 切换收藏状态
	const toggleFavorite = async (): Promise<void> => {
		if (!product) return;
		const user = pb.authStore.record;
		if (!user) {
			showLoginModal = true;
			return;
		}

		try {
			if (isFavorite) {
				const res = await profileService.removeFavoriteProduct(user.id, product.id);
				if (res.success) {
					isFavorite = false;
				}
			} else {
				const res = await profileService.addFavoriteProduct(user.id, product.id, product.brand || '');
				if (res.success) {
					isFavorite = true;
				}
			}
		} catch (e) {
			console.error('切换收藏失败:', e);
		}
	};
</script>

<!-- 模板部分保持不变 -->
<main class="min-h-screen bg-white pb-16">
	{#if product}
		<!-- 商品图片展示区 -->
		<div class="bg-gray-50">
			<div class="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
				<!-- 面包屑导航 -->
				<nav class="mb-6">
					<ol class="flex items-center space-x-2 text-sm">
						<li>
							<a href={resolve('/product')} class="text-gray-500 transition-colors hover:text-gray-700"
								>商品一覧</a
							>
						</li>
						<li class="text-gray-400">/</li>
						<li>
							<a
								href={resolve(`/category/${product.category_id}`)}
								class="text-gray-500 transition-colors hover:text-gray-700">{categoryName}</a
							>
						</li>
						<li class="text-gray-400">/</li>
						<li class="max-w-50 truncate text-gray-900">{product.name_ja || product.name}</li>
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
									class="flex h-100 w-full items-center justify-center bg-gray-100 text-gray-400"
								>
									No Image
								</div>
							{/if}
						</div>

						<!-- 缩略图列表 -->
						{#if images.length > 1}
						<div class="flex space-x-3 overflow-x-auto pb-2">
							{#each images as image, index (image)}
									<button
										onclick={() => (selectedImageIndex = index)}
										class={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedImageIndex === index ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}
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
								<p class="leading-relaxed text-gray-600 whitespace-pre-line">{product.description}</p>
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
									{#each stars as i (i)}
										<svg
											class={i < Math.floor(product.rating || 0) ? 'h-5 w-5 text-yellow-400' : 'h-5 w-5 text-gray-300'}
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
										</svg>
									{/each}
									<span class="ml-2 text-sm text-gray-600">{(product.rating || 0).toFixed(1)}</span>
								</div>
								<span class="text-sm text-gray-500">({product.reviews || 0}件のレビュー)</span>
								{#if isFavoriteLoading}
									<span class="h-6 w-20 animate-pulse rounded bg-gray-200"></span>
								{:else}
								<button
									onclick={toggleFavorite}
									class={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs transition-all ${
										isFavorite
											? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
											: 'border-gray-300 bg-white text-gray-700 hover:border-gray-900'
									}`}
									aria-pressed={isFavorite}
									title={isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}
								>
									<svg
										class="h-4 w-4"
										viewBox="0 0 24 24"
										fill={isFavorite ? 'currentColor' : 'none'}
										stroke="currentColor"
										stroke-width="1.8"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
										/>
									</svg>
									{isFavorite ? 'お気に入り済み' : 'お気に入り'}
								</button>
								{/if}
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
						{#if isSpecsLoading}
							<div class="space-y-2">
								<div class="mb-1 h-4 w-16 rounded bg-gray-200"></div>
								<div class="flex flex-wrap gap-2">
									{#each [0,1,2,3,4,5] as i (i)}
										<div class="h-8 w-16 rounded border border-gray-200 bg-gray-100"></div>
									{/each}
								</div>
							</div>
						{:else if specOptions.length > 0}
							<div class="space-y-2">
								{#each specOptions as spec (spec.name)}
									<div>
										<!-- svelte-ignore a11y_label_has_associated_control -->
										<label class="mb-1 block text-sm font-medium text-gray-700">
											{spec.name}
										</label>
										<div class="flex flex-wrap gap-2">
											{#each spec.values as value (value)}
												<button
													onclick={() => handleSpecSelect(spec.name, value)}
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
										onclick={decrementQuantity}
										class="flex h-10 w-10 items-center justify-center rounded-l border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
										disabled={quantity <= 1 || !isStockAvailable}
									>
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
										</svg>
									</button>
									<input
										type="text"
										readonly
										value={quantity}
										class="h-10 w-16 border-t border-b border-gray-300 bg-white text-center"
									/>
									<button
										onclick={incrementQuantity}
										class="flex h-10 w-10 items-center justify-center rounded-r border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
										disabled={quantity >= stockCount || !isStockAvailable}
									>
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
										</svg>
									</button>
								</div>
							</div>

							<!-- 操作按钮 -->
							<div class="flex space-x-3">
								<button
									onclick={addToCart}
									disabled={isLoading || !isStockAvailable}
									class="flex flex-1 items-center justify-center border-2 border-gray-900 px-6 py-3 font-medium text-gray-900 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{#if isLoading}
										<div class="mr-3 -ml-1 text-gray-900">
											<svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
												<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
												<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
										</div>
										処理中...
									{:else}
										カートに追加
									{/if}
								</button>

								<button
									onclick={buyNow}
									disabled={isLoading || !isStockAvailable}
									class="flex-1 bg-gray-900 px-6 py-3 font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{#if isLoading}
										<div class="flex items-center justify-center">
											<div class="mr-3 -ml-1 text-white">
												<svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
													<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
													<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
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
				<!-- 左侧:产品特性 -->
				<div class="space-y-8 lg:col-span-2">
					<!-- 产品特性 -->
					<section>
						<h2 class="mb-6 border-b border-gray-100 pb-3 text-xl font-normal text-gray-900">
							製品特長
						</h2>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							{#each features as feature (feature)}
								<div class="flex items-start space-x-3">
									<div class="mt-0.5 shrink-0 text-gray-400">
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
										</svg>
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
									{#each specifications as spec (spec.key)}
										<tr class="transition-colors hover:bg-gray-50">
											<td class="w-1/3 px-6 py-4 text-sm font-medium text-gray-900">
												{spec.key}
											</td>

											{#if spec.key === 'ブランド'}
												<td
													class="cursor-pointer px-6 py-4 text-sm text-blue-600 hover:underline"
													onclick={() => goto(resolve(`/brands/${spec.value}`))}
												>
													{product.expand?.brand?.name}
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

				<!-- 右侧:配送信息等 -->
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
									class="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
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
									class="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
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
									class="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
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
					<div class="mb-4 h-100 animate-pulse rounded-lg bg-gray-200"></div>
					<div class="flex space-x-3">
						{#each thumbPlaceholders as i (i)}
							<div class="h-20 w-20 animate-pulse rounded-lg bg-gray-200" data-index={i}></div>
						{/each}
					</div>
				</div>
				<!-- 信息加载 -->
				<div class="space-y-6">
					<div class="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
					<div class="h-10 w-full animate-pulse rounded bg-gray-200"></div>
					<div class="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
					<div class="h-12 w-40 animate-pulse rounded bg-gray-200"></div>
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-1">
							{#each stars as i (i)}
								<div class="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
							{/each}
							<div class="ml-2 h-4 w-10 animate-pulse rounded bg-gray-200"></div>
						</div>
						<div class="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
					</div>
					<div class="space-y-4">
						<div class="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
						<div class="flex space-x-3">
							<div class="h-12 flex-1 animate-pulse rounded bg-gray-200"></div>
							<div class="h-12 flex-1 animate-pulse rounded bg-gray-200"></div>
						</div>
						<div class="space-y-2">
							<div class="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
							<div class="flex flex-wrap gap-2">
								{#each [0,1,2,3,4,5] as i (i)}
									<div class="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<!-- 登录弹窗 -->
<LoginModal
	show={showLoginModal}
	onClose={() => (showLoginModal = false)}
	on:loginSuccess={async () => {
		showLoginModal = false;
		if (product?.id && pb.authStore.record) {
			const favRes = await profileService.isFavorite(pb.authStore.record.id, product.id);
			if (favRes.success) {
				isFavorite = !!favRes.isFavorite;
			}
		}
	}}
/>

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
		transition :opacity 0.3s ease;
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
