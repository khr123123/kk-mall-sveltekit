<script lang="ts">
	import { goto } from '$app/navigation';

	// 模拟购物车数据
	let cartItems = [
		{
			id: 1,
			name: 'ワイヤレスイヤホン Pro',
			image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
			price: 12800,
			originalPrice: 15800,
			quantity: 1,
			color: 'ブラック',
			size: null,
			inStock: true,
			seller: 'テックストア',
			shippingFee: 0
		},
		{
			id: 2,
			name: 'スマートウォッチ Series 5',
			image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
			price: 28900,
			originalPrice: null,
			quantity: 1,
			color: 'シルバー',
			size: '42mm',
			inStock: true,
			seller: 'ガジェット専門店',
			shippingFee: 500
		},
		{
			id: 3,
			name: 'USB-C ケーブル 2m',
			image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
			price: 1980,
			originalPrice: 2480,
			quantity: 2,
			color: 'ホワイト',
			size: null,
			inStock: true,
			seller: 'テックストア',
			shippingFee: 0
		},
		{
			id: 4,
			name: 'ワイヤレス充電器',
			image: 'https://images.unsplash.com/photo-1578319439584-104c94d37305?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
			price: 3480,
			originalPrice: null,
			quantity: 1,
			color: 'ブラック',
			size: null,
			inStock: false,
			seller: 'アクセサリーハウス',
			shippingFee: 300
		}
	];

	let selectedItems = new Set(cartItems.filter((item) => item.inStock).map((item) => item.id));
	let couponCode = '';
	let appliedCoupon: { code: string; discount: number } | null = null;

	// 计算相关
	$: subtotal = Array.from(selectedItems).reduce((sum, id) => {
		const item = cartItems.find((i) => i.id === id);
		return item ? sum + item.price * item.quantity : sum;
	}, 0);

	$: shippingFee = Array.from(selectedItems).reduce((sum, id) => {
		const item = cartItems.find((i) => i.id === id);
		return item ? sum + item.shippingFee : sum;
	}, 0);

	$: discount = appliedCoupon ? appliedCoupon.discount : 0;
	$: total = subtotal + shippingFee - discount;
	$: selectedCount = selectedItems.size;

	function formatPrice(price: number): string {
		return `¥${price.toLocaleString()}`;
	}

	function toggleSelectAll() {
		if (selectedItems.size === cartItems.filter((item) => item.inStock).length) {
			selectedItems.clear();
		} else {
			cartItems.forEach((item) => {
				if (item.inStock) {
					selectedItems.add(item.id);
				}
			});
		}
		selectedItems = selectedItems;
	}

	function toggleSelectItem(itemId: number) {
		if (selectedItems.has(itemId)) {
			selectedItems.delete(itemId);
		} else {
			selectedItems.add(itemId);
		}
		selectedItems = selectedItems;
	}

	function updateQuantity(itemId: number, delta: number) {
		cartItems = cartItems.map((item) => {
			if (item.id === itemId) {
				const newQuantity = Math.max(1, item.quantity + delta);
				return { ...item, quantity: newQuantity };
			}
			return item;
		});
	}

	function removeItem(itemId: number) {
		if (confirm('この商品をカートから削除しますか？')) {
			cartItems = cartItems.filter((item) => item.id !== itemId);
			selectedItems.delete(itemId);
			selectedItems = selectedItems;
		}
	}

	function applyCoupon() {
		if (couponCode.trim() === '') {
			alert('クーポンコードを入力してください');
			return;
		}

		// 模拟优惠券验证
		if (couponCode === 'SAVE10') {
			appliedCoupon = {
				code: 'SAVE10',
				discount: Math.floor(subtotal * 0.1)
			};
			alert('クーポンが適用されました！');
		} else if (couponCode === 'FREESHIP') {
			appliedCoupon = {
				code: 'FREESHIP',
				discount: shippingFee
			};
			alert('送料無料クーポンが適用されました！');
		} else {
			alert('無効なクーポンコードです');
		}
	}

	function removeCoupon() {
		appliedCoupon = null;
		couponCode = '';
	}

	function goToCheckout() {
		if (selectedItems.size === 0) {
			alert('商品を選択してください');
			return;
		}
		goto('/checkout');
	}

	function continueShopping() {
		goto('/');
	}
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-7xl px-4">
		<!-- 页面标题 -->
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-900">ショッピングカート</h1>
			<p class="mt-1 text-sm text-gray-500">
				{cartItems.length}件の商品
			</p>
		</div>

		{#if cartItems.length === 0}
			<!-- 空购物车状态 -->
			<div class="rounded-lg bg-white px-6 py-16 text-center shadow-sm">
				<svg
					class="mx-auto mb-4 h-24 w-24 text-gray-300"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1"
						d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
				<h2 class="mb-2 text-xl font-semibold text-gray-900">カートは空です</h2>
				<p class="mb-6 text-sm text-gray-500">お気に入りの商品を追加してください</p>
				<button
					class="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
					on:click={continueShopping}
				>
					ショッピングを続ける
				</button>
			</div>
		{:else}
			<div class="grid gap-6 lg:grid-cols-3">
				<!-- 左侧：商品列表 -->
				<div class="lg:col-span-2">
					<!-- 全选栏 -->
					<div
						class="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
					>
						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
								checked={selectedItems.size === cartItems.filter((item) => item.inStock).length &&
									cartItems.filter((item) => item.inStock).length > 0}
								on:change={toggleSelectAll}
							/>
							<span class="text-sm font-medium text-gray-700">すべて選択</span>
						</label>
						<span class="text-sm text-gray-500">
							({selectedCount}/{cartItems.filter((item) => item.inStock).length}件選択中)
						</span>
					</div>

					<!-- 商品列表 -->
					<div class="space-y-4">
						{#each cartItems as item (item.id)}
							<div
								class="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md {!item.inStock
									? 'opacity-75'
									: ''}"
							>
								<div class="flex gap-4">
									<!-- 复选框 -->
									<div class="flex items-start pt-2">
										<input
											type="checkbox"
											class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
											checked={selectedItems.has(item.id)}
											disabled={!item.inStock}
											on:change={() => toggleSelectItem(item.id)}
										/>
									</div>

									<!-- 商品图片 -->
									<div class="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
										<img src={item.image} alt={item.name} class="h-full w-full object-cover" />
										{#if !item.inStock}
											<div
												class="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-medium text-white"
											>
												在庫切れ
											</div>
										{/if}
									</div>

									<!-- 商品信息 -->
									<div class="min-w-0 flex-1">
										<div class="mb-2 flex items-start justify-between gap-4">
											<div class="flex-1">
												<h3 class="mb-1 font-medium text-gray-900">{item.name}</h3>
												<div class="flex flex-wrap gap-2 text-xs text-gray-500">
													{#if item.color}
														<span>カラー: {item.color}</span>
													{/if}
													{#if item.size}
														<span>サイズ: {item.size}</span>
													{/if}
												</div>
												<p class="mt-1 text-xs text-gray-400">販売元: {item.seller}</p>
											</div>
											<button
												class="shrink-0 text-gray-400 transition-colors hover:text-red-500"
												on:click={() => removeItem(item.id)}
												aria-label="削除"
											>
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>

										<div class="flex items-center justify-between">
											<!-- 价格 -->
											<div class="flex items-baseline gap-2">
												<span class="text-lg font-bold text-gray-900">
													{formatPrice(item.price)}
												</span>
												{#if item.originalPrice}
													<span class="text-sm text-gray-400 line-through">
														{formatPrice(item.originalPrice)}
													</span>
												{/if}
											</div>

											<!-- 数量控制 -->
											<div class="flex items-center gap-3">
												<button
													class="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
													on:click={() => updateQuantity(item.id, -1)}
													disabled={item.quantity <= 1 || !item.inStock}
												>
													<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M20 12H4"
														/>
													</svg>
												</button>
												<span class="min-w-[2rem] text-center font-medium text-gray-900">
													{item.quantity}
												</span>
												<button
													class="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
													on:click={() => updateQuantity(item.id, 1)}
													disabled={!item.inStock}
												>
													<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- 右侧：订单摘要 -->
				<div class="lg:col-span-1">
					<div class="sticky top-20 space-y-4">
						<!-- 优惠券 -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h3 class="mb-3 text-sm font-semibold text-gray-900">クーポンコード</h3>
							{#if appliedCoupon}
								<div class="flex items-center justify-between rounded-lg bg-green-50 p-3">
									<div>
										<p class="text-sm font-medium text-green-900">{appliedCoupon.code}</p>
										<p class="text-xs text-green-700">-{formatPrice(appliedCoupon.discount)}</p>
									</div>
									<button class="text-green-700 hover:text-green-800" on:click={removeCoupon}>
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							{:else}
								<div class="flex gap-2">
									<input
										type="text"
										bind:value={couponCode}
										placeholder="コードを入力"
										class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
									/>
									<button
										class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
										on:click={applyCoupon}
									>
										適用
									</button>
								</div>
								<p class="mt-2 text-xs text-gray-500">例: SAVE10, FREESHIP</p>
							{/if}
						</div>

						<!-- 订单摘要 -->
						<div class="rounded-lg border border-gray-200 bg-white p-4">
							<h3 class="mb-4 text-sm font-semibold text-gray-900">注文概要</h3>
							<div class="space-y-3 text-sm">
								<div class="flex justify-between text-gray-600">
									<span>小計 ({selectedCount}件)</span>
									<span>{formatPrice(subtotal)}</span>
								</div>
								<div class="flex justify-between text-gray-600">
									<span>送料</span>
									<span>{shippingFee === 0 ? '無料' : formatPrice(shippingFee)}</span>
								</div>
								{#if discount > 0}
									<div class="flex justify-between text-green-600">
										<span>割引</span>
										<span>-{formatPrice(discount)}</span>
									</div>
								{/if}
								<div class="border-t border-gray-200 pt-3">
									<div class="flex justify-between text-lg font-bold text-gray-900">
										<span>合計</span>
										<span>{formatPrice(total)}</span>
									</div>
								</div>
							</div>

							<button
								class="mt-4 w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
								on:click={goToCheckout}
								disabled={selectedCount === 0}
							>
								購入手続きへ ({selectedCount}件)
							</button>

							<button
								class="mt-2 w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
								on:click={continueShopping}
							>
								ショッピングを続ける
							</button>
						</div>

						<!-- 安全提示 -->
						<div class="rounded-lg bg-gray-100 p-4 text-xs text-gray-600">
							<div class="mb-2 flex items-center gap-2">
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
								<span class="font-medium">安全な決済</span>
							</div>
							<p>SSL暗号化により、お客様の情報は安全に保護されています。</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* 自定义复选框样式 */
	input[type='checkbox']:checked {
		background-color: #111827;
		border-color: #111827;
	}

	/* 过渡动画 */
	.space-y-4 > * {
		transition: all 0.2s ease;
	}
</style>