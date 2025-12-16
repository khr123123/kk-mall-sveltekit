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
			'Dyson 掃除機 セール',
			'ユニクロ 期間限定',
			'Nike スニーカー 特価',
			'ZARA 冬物セール',
			'無印良品 セール',
			'Panasonic 家電 特価'
		];

		for (let i = 0; i < count; i++) {
			const originalPrice = ((i % 10) + 5) * 10000;
			const discount = 20 + ((i % 5) * 10);
			const price = Math.floor(originalPrice * (1 - discount / 100));
			const endTime = Date.now() + ((i % 24) + 1) * 3600000; // 1-24小时后结束

			deals.push({
				id: i + 1,
				title: titles[i % titles.length],
				image: '/svgs/goods.svg',
				price: price,
				originalPrice: originalPrice,
				discount: discount,
				sales: Math.floor(((i % 10) + 1) * 1000),
				rating: (4 + (i % 5) * 0.2).toFixed(1),
				stock: Math.floor(Math.random() * 100) + 10,
				endTime: endTime
			});
		}
		return deals;
	}

	let allDeals = generateDeals(30);
	let timeRemaining: { [key: number]: string } = {};

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

	// 排序选项
	let sortBy = 'discount'; // discount, price, ending
	$: sortedDeals = [...allDeals].sort((a, b) => {
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
	});
</script>

<main class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<!-- 页面标题 -->
		<div class="mb-6 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white shadow-sm sm:p-8">
			<div class="flex items-center gap-3">
				<svg class="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
				</svg>
				<div>
					<h1 class="mb-1 text-2xl font-bold sm:text-3xl">タイムセール</h1>
					<p class="text-sm text-white/90 sm:text-base">期間限定のお買い得商品</p>
				</div>
			</div>
		</div>

		<!-- 排序选项 -->
		<div class="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
			<span class="text-sm font-medium text-gray-700">並び替え：</span>
			<div class="flex flex-wrap gap-2">
				<button
					class="rounded-lg px-4 py-2 text-sm font-medium transition-all {sortBy === 'discount'
						? 'bg-gray-900 text-white'
						: 'bg-gray-50 text-gray-700 hover:bg-gray-100'}"
					on:click={() => sortBy = 'discount'}
				>
					割引率順
				</button>
				<button
					class="rounded-lg px-4 py-2 text-sm font-medium transition-all {sortBy === 'price'
						? 'bg-gray-900 text-white'
						: 'bg-gray-50 text-gray-700 hover:bg-gray-100'}"
					on:click={() => sortBy = 'price'}
				>
					価格順
				</button>
				<button
					class="rounded-lg px-4 py-2 text-sm font-medium transition-all {sortBy === 'ending'
						? 'bg-gray-900 text-white'
						: 'bg-gray-50 text-gray-700 hover:bg-gray-100'}"
					on:click={() => sortBy = 'ending'}
				>
					終了間近順
				</button>
			</div>
		</div>

		<!-- 商品网格 -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each sortedDeals as deal (deal.id)}
				<a
					href="/product/{deal.id}"
					class="group overflow-hidden rounded-xl bg-white no-underline shadow-sm transition-all duration-300 hover:shadow-lg"
				>
					<div class="flex gap-4 p-4">
						<!-- 商品图片 -->
						<div class="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-32 sm:w-32">
							<img
								src={deal.image}
								alt={deal.title}
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
								loading="lazy"
							/>
							<div class="absolute top-1 left-1 rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
								-{deal.discount}%
							</div>
						</div>

						<!-- 商品信息 -->
						<div class="flex flex-1 flex-col justify-between">
							<div>
								<h3 class="mb-2 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
									{deal.title}
								</h3>

								<div class="mb-2 flex items-baseline gap-2">
									<span class="text-lg font-bold text-red-500 sm:text-xl">
										¥{deal.price.toLocaleString('ja-JP')}
									</span>
									<span class="text-xs text-gray-400 line-through">
										¥{deal.originalPrice.toLocaleString('ja-JP')}
									</span>
								</div>
							</div>

							<!-- 倒计时和库存 -->
							<div class="space-y-1">
								<div class="flex items-center gap-2 text-xs text-gray-600">
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span class="font-medium {timeRemaining[deal.id] === '終了' ? 'text-red-500' : 'text-gray-900'}">
										{timeRemaining[deal.id] || '00:00:00'}
									</span>
								</div>
								<div class="flex items-center gap-2 text-xs text-gray-600">
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
									</svg>
									<span>残り {deal.stock}点</span>
								</div>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</main>

<style>
	.shadow-sm {
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
	}

	.shadow-lg {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>