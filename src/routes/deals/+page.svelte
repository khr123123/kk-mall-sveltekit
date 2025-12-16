<script lang="ts">
	import { onMount } from 'svelte';

	// Mock特价商品数据
	function generateDeals(count: number) {
		const deals = [];
		const titles = [
			'iPhone 15 Pro タイムセール',
			'Samsung Galaxy 限定セール',
			'MacBook Air 特別価格',
			'Sony ワイヤレスイヤホン',
			'Nintendo Switch お買い得',
			'iPad Pro 在庫限り',
			'AirPods Pro セール中',
			'Dell ノートPC 特価',
			'Canon カメラ 大特価',
			'Dyson 掃除機 セール'
		];

		for (let i = 0; i < count; i++) {
			const originalPrice = ((i % 10) + 5) * 10000;
			const discount = 20 + ((i % 5) * 10);
			const price = Math.floor(originalPrice * (1 - discount / 100));
			const endTime = Date.now() + ((i % 24) + 1) * 3600000;

			deals.push({
				id: i + 1,
				title: titles[i % titles.length],
				price: price,
				originalPrice: originalPrice,
				discount: discount,
				rating: 4 + Math.random(),
				reviews: Math.floor(Math.random() * 1000),
				stock: Math.floor(Math.random() * 100) + 10,
				endTime: endTime,
				isHot: i % 3 === 0,
				image: '/svgs/goods.svg',
				category: ['スマホ', 'PC', '家電', 'オーディオ'][i % 4]
			});
		}
		return deals;
	}

	let allDeals = generateDeals(40);
	let timeRemaining: { [key: number]: string } = {};
	let sortBy = 'discount'; // discount, price, ending
	let isLoading = $state(false);
	let viewMode = 'grid'; // grid, list
	let selectedCategory = 'all';

	const categories = [
		{ id: 'all', name: 'すべて', icon: '🔥' },
		{ id: 'electronics', name: 'デジタル', icon: '📱' },
		{ id: 'fashion', name: 'ファッション', icon: '👕' },
		{ id: 'home', name: 'ホーム', icon: '🏠' },
		{ id: 'beauty', name: '美容', icon: '💄' },
		{ id: 'other', name: 'その他', icon: '📦' }
	];

	// 计算倒计时
	function updateCountdown() {
		allDeals.forEach(deal => {
			const now = Date.now();
			const diff = deal.endTime - now;
			
			if (diff <= 0) {
				timeRemaining[deal.id] = '終了';
				return;
			}

			const hours = Math.floor(diff / 3600000);
			const minutes = Math.floor((diff % 3600000) / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);
			
			timeRemaining[deal.id] = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		});
	}

	onMount(() => {
		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);
		return () => clearInterval(interval);
	});

	// 排序功能
	let sortedDeals = $derived([...allDeals].sort((a, b) => {
		switch (sortBy) {
			case 'discount':
				return b.discount - a.discount;
			case 'price':
				return a.price - b.price;
			case 'ending':
				return a.endTime - b.endTime;
			default:
				return 0;
		}
	}));

	// 格式化价格
	function formatPrice(price: number) {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			maximumFractionDigits: 0
		}).format(price);
	}

	// 添加到购物车
	function addToCart(deal: any, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('カートに追加:', deal.title);
		alert(`${deal.title}をカートに追加しました`);
	}

	// 添加到收藏
	function addToWishlist(deal: any, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('お気に入りに追加:', deal.title);
		alert(`${deal.title}をお気に入りに追加しました`);
	}
</script>

<main class="min-h-screen bg-white">
	<!-- 页面头部 -->
	<div class="bg-gradient-to-r from-red-600 to-orange-500 text-white">
		<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<h1 class="mb-3 text-3xl font-bold sm:text-4xl">タイムセール</h1>
			<p class="text-lg text-white/90">期間限定の特別価格！お見逃しなく！</p>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- 分类标签 -->
		<div class="mb-8">
			<div class="flex flex-wrap gap-2">
				{#each categories as category}
					<button
						on:click={() => (selectedCategory = category.id)}
						class="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition-colors {selectedCategory === category.id
							? 'bg-gray-900 text-white'
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						<span class="text-base">{category.icon}</span>
						{category.name}
					</button>
				{/each}
			</div>
		</div>

		<!-- 排序和视图切换 -->
		<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div class="text-gray-600">
				<span class="font-semibold">{sortedDeals.length}</span> 件のセール商品
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
					<option value="discount">割引率順</option>
					<option value="price">価格順</option>
					<option value="ending">終了間近順</option>
				</select>
			</div>
		</div>

		<!-- 加载状态 -->
		{#if isLoading}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(8) as _}
					<div class="animate-pulse overflow-hidden rounded-lg border border-gray-200">
						<div class="aspect-square bg-gray-200"></div>
						<div class="space-y-3 p-4">
							<div class="h-4 bg-gray-200 rounded"></div>
							<div class="h-4 bg-gray-200 rounded w-2/3"></div>
							<div class="h-6 bg-gray-200 rounded w-1/2"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- 列表视图 -->
			{#if viewMode === 'list'}
				<div class="space-y-4">
					{#each sortedDeals as deal}
						<a
							href="/product/{deal.id}"
							class="group flex gap-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 no-underline transition-colors hover:border-gray-300 hover:shadow-md"
						>
							<!-- 商品图片 -->
							<div class="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
								<div class="flex h-full w-full items-center justify-center text-gray-400">
									商品画像
								</div>
								<!-- 倒计时标签 -->
								<div class="absolute top-2 left-2">
									<div class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
										タイムセール
									</div>
								</div>
							</div>

							<!-- 商品信息 -->
							<div class="flex flex-1 flex-col justify-between">
								<div>
									<h3 class="mb-2 text-lg font-semibold text-gray-900 group-hover:text-gray-700">
										{deal.title}
									</h3>
									{#if deal.rating > 0}
										<div class="mb-3 flex items-center gap-2">
											<div class="flex">
												{#each Array(5) as _, i}
													<svg
														class="h-4 w-4 {i < Math.floor(deal.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}"
														viewBox="0 0 20 20"
													>
														<path
															d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
														/>
													</svg>
												{/each}
											</div>
											<span class="text-sm text-gray-600">{deal.rating.toFixed(1)}</span>
											<span class="text-sm text-gray-400">({deal.reviews}件)</span>
										</div>
									{/if}
								</div>

								<!-- 价格和倒计时 -->
								<div class="flex items-end justify-between">
									<div>
										<div class="flex items-center gap-2">
											<span class="text-xl font-bold text-gray-900">
												{formatPrice(deal.price)}
											</span>
											<span class="text-sm text-gray-500 line-through">
												{formatPrice(deal.originalPrice)}
											</span>
											<span class="text-sm font-bold text-red-600">-{deal.discount}%</span>
										</div>
										
										<!-- 倒计时显示 -->
										<div class="mt-2 flex items-center gap-2">
											<svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											<span class="text-sm font-medium {timeRemaining[deal.id] === '終了' ? 'text-red-600' : 'text-gray-900'}">
												{timeRemaining[deal.id] || '00:00:00'}
											</span>
										</div>
										
										{#if deal.stock < 30}
											<p class="mt-1 text-sm text-red-600">残り{deal.stock}個</p>
										{/if}
									</div>

									<div class="flex gap-2">
										<button
											on:click|preventDefault={(e) => addToWishlist(deal, e)}
											class="rounded-full border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
											aria-label="お気に入りに追加"
										>
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
												/>
											</svg>
										</button>
										<button
											on:click|preventDefault={(e) => addToCart(deal, e)}
											class="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
										>
											今すぐ購入
										</button>
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<!-- 网格视图 -->
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each sortedDeals as deal}
						<div class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-lg">
							<a href="/product/{deal.id}" class="block no-underline">
								<!-- 商品图片 -->
								<div class="relative aspect-square overflow-hidden bg-gray-100">
									<div class="flex h-full w-full items-center justify-center text-gray-400">
										商品画像
									</div>
									<!-- 标签区域 -->
									<div class="absolute top-3 left-3 flex flex-col gap-2">
										<div class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
											タイムセール
										</div>
										<div class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
											-{deal.discount}%
										</div>
										{#if deal.isHot}
											<div class="rounded bg-orange-500 px-2 py-1 text-xs font-bold text-white">
												HOT
											</div>
										{/if}
									</div>
									<!-- 收藏按钮 -->
									<button
										on:click|preventDefault={(e) => addToWishlist(deal, e)}
										class="absolute top-3 right-3 rounded-full bg-white/90 p-2 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100"
										aria-label="お気に入りに追加"
									>
										<svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.5"
												d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
											/>
										</svg>
									</button>
									
									<!-- 倒计时浮层 -->
									<div class="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
										<div class="flex items-center justify-center gap-2">
											<svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											<span class="text-sm font-bold text-white">
												{timeRemaining[deal.id] || '00:00:00'}
											</span>
										</div>
									</div>
								</div>

								<!-- 商品信息 -->
								<div class="p-4">
									{#if deal.rating > 0}
										<div class="mb-2 flex items-center gap-1">
											<div class="flex">
												{#each Array(5) as _, i}
													<svg
														class="h-4 w-4 {i < Math.floor(deal.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}"
														viewBox="0 0 20 20"
													>
														<path
															d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
														/>
													</svg>
												{/each}
											</div>
											<span class="text-sm text-gray-600">{deal.rating.toFixed(1)}</span>
											<span class="text-sm text-gray-400">({deal.reviews})</span>
										</div>
									{/if}

									<h3 class="mb-2 line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-gray-700">
										{deal.title}
									</h3>

									<div class="mb-3 flex items-center gap-2">
										<span class="text-lg font-bold text-gray-900">{formatPrice(deal.price)}</span>
										<span class="text-sm text-gray-500 line-through">
											{formatPrice(deal.originalPrice)}
										</span>
									</div>

									<!-- 库存和类别 -->
									<div class="flex items-center justify-between text-xs text-gray-500">
										<div class="flex items-center gap-1">
											<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
												/>
											</svg>
											<span>残り{deal.stock}個</span>
										</div>
										<span class="text-xs text-gray-400">{deal.category}</span>
									</div>
								</div>
							</a>

							<!-- 添加到购物车按钮 -->
							<div class="border-t border-gray-100 p-4">
								<button
									on:click|preventDefault={(e) => addToCart(deal, e)}
									class="w-full rounded-lg bg-red-600 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
								>
									今すぐ購入
								</button>
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