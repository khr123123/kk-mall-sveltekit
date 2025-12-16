<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// 商品数据结构
	interface Product {
		id: number;
		name: string;
		description: string;
		price: number;
		originalPrice?: number;
		category: string;
		stock: number;
		rating: number;
		reviewCount: number;
		images: string[];
		specifications: { key: string; value: string }[];
		features: string[];
	}

	// 模拟商品数据
	let product: Product = {
		id: 1,
		name: 'Premium Wireless Headphones',
		description:
			'高音質ワイヤレスヘッドフォン。ノイズキャンセリング機能搭載で、どこでも没入感のある音楽体験を提供します。軽量設計で長時間の着用も快適です。',
		price: 29800,
		originalPrice: 39800,
		category: 'イヤホン',
		stock: 15,
		rating: 4.5,
		reviewCount: 128,
		images: [
			'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
			'https://images.unsplash.com/photo-1583394838336-acd977736f90?w-800&q=80',
			'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80'
		],
		specifications: [
			{ key: 'ブランド', value: 'AudioTech' },
			{ key: 'モデル', value: 'ATH-WB99' },
			{ key: '駆動方式', value: 'ダイナミック' },
			{ key: '周波数特性', value: '20Hz-40kHz' },
			{ key: '重量', value: '265g' },
			{ key: 'バッテリー', value: '最大30時間' },
			{ key: '接続', value: 'Bluetooth 5.2' },
			{ key: '防水等級', value: 'IPX4' }
		],
		features: [
			'アクティブノイズキャンセリング',
			'ハイレゾ音源対応',
			'マルチポイント接続',
			'タッチセンサー操作',
			'急速充電対応',
			'折りたたみ式'
		]
	};

	let selectedImageIndex = 0;
	let quantity = 1;
	let isLoading = false;

	$: productId = Number(page.params.id);

	// 模拟API调用
	onMount(() => {
		// 这里可以添加实际的PocketBase API调用
		// const response = await pb.collection('products').getOne(productId);
	});

	function addToCart() {
		isLoading = true;
		// 模拟API调用
		setTimeout(() => {
			isLoading = false;
			alert(`${quantity}個の${product.name}をカートに追加しました`);
		}, 500);
	}

	function buyNow() {
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
			alert(`購入手続きに進みます`);
		}, 500);
	}

	function incrementQuantity() {
		if (quantity < product.stock) {
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
						<a href="/category/1/104" class="text-gray-500 transition-colors hover:text-gray-700"
							>{product.category}</a
						>
					</li>
					<li class="text-gray-400">/</li>
					<li class="max-w-[200px] truncate text-gray-900">{product.name}</li>
				</ol>
			</nav>

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<!-- 商品主图 -->
				<div>
					<div class="mb-4 overflow-hidden rounded-lg bg-white">
						<img
							src={product.images[selectedImageIndex]}
							alt={product.name}
							class="h-[400px] w-full bg-white object-contain"
						/>
					</div>

					<!-- 缩略图列表 -->
					<div class="flex space-x-3">
						{#each product.images as image, index}
							<button
								on:click={() => (selectedImageIndex = index)}
								class={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedImageIndex === index ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}
							>
								<img src={image} alt="商品画像 {index + 1}" class="h-full w-full object-cover" />
							</button>
						{/each}
					</div>
				</div>

				<!-- 商品信息 -->
				<div class="space-y-6">
					<!-- 分类标签 -->
					<div class="flex items-center space-x-3">
						<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
							{product.category}
						</span>
						{#if product.stock < 10}
							<span class="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
								残りわずか
							</span>
						{/if}
					</div>

					<!-- 商品名称 -->
					<h1 class="text-2xl leading-tight font-normal text-gray-900">
						{product.name}
					</h1>

					<!-- 评分和评价 -->
					<div class="flex items-center space-x-4">
						<div class="flex items-center">
							{#each Array(5) as _, i}
								<svg
									class={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
							{/each}
							<span class="ml-2 text-sm text-gray-600">{product.rating.toFixed(1)}</span>
						</div>
						<span class="text-sm text-gray-500">({product.reviewCount}件のレビュー)</span>
					</div>

					<!-- 价格 -->
					<div class="space-y-2">
						<div class="flex items-center space-x-4">
							<span class="text-3xl font-light text-gray-900"
								>¥{product.price.toLocaleString()}</span
							>
							{#if product.originalPrice}
								<span class="text-lg text-gray-400 line-through"
									>¥{product.originalPrice?.toLocaleString()}</span
								>
								<span class="rounded bg-red-50 px-2 py-1 text-sm font-medium text-red-600">
									{Math.round((1 - product.price / product.originalPrice!) * 100)}% OFF
								</span>
							{/if}
						</div>
						<div class="text-sm text-gray-500">税込</div>
					</div>

					<!-- 库存状态 -->
					<div class="flex items-center text-sm">
						<div
							class={`mr-2 h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}
						></div>
						{#if product.stock > 0}
							<span class="text-gray-600">在庫あり ({product.stock}個)</span>
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
									disabled={quantity >= product.stock}
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
								disabled={isLoading || product.stock <= 0}
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
								disabled={isLoading || product.stock <= 0}
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
						{#each product.features as feature}
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
					<h2 class="mb-6 border-b border-gray-100 pb-3 text-xl font-normal text-gray-900">仕様</h2>
					<div class="overflow-hidden rounded-lg bg-gray-50">
						<table class="min-w-full divide-y divide-gray-200">
							<tbody class="divide-y divide-gray-200 bg-white">
								{#each product.specifications as spec}
									<tr class="transition-colors hover:bg-gray-50">
										<td class="w-1/3 px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900"
											>{spec.key}</td
										>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600">{spec.value}</td>
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
							class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
								/>
							</svg>
						</button>
						<button
							class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 text-white transition-colors hover:bg-blue-500"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
								/>
							</svg>
						</button>
						<button
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
