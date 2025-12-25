<script lang="ts">
	import { goto } from '$app/navigation';
	import { cart, cartStats, coupon } from '$lib/stores/cartStore';
	import { onMount } from 'svelte';

	let couponCode = '';
	let loading = true;
	let error: string | null = null;

	onMount(() => {
		// 订阅购物车变化
		const unsubscribe = cart.subscribe(({ items, loading: cartLoading, error: cartError }) => {
			loading = cartLoading;
			error = cartError;
		});

		return unsubscribe;
	});

	// 计算总价（包含优惠券）
	$: total = $cartStats.subtotal - $coupon.discount;

	// 格式价格
	function formatPrice(price: number): string {
		return `¥${price.toLocaleString()}`;
	}

	// 全选/全不选
	async function toggleSelectAll() {
		const allInStockSelected = $cart.items
			.filter((item) => item.product.in_stock)
			.every((item) => item.selected);

		const updates = $cart.items
			.filter((item) => item.product.in_stock)
			.map((item) => cart.toggleSelect(item.id));

		await Promise.all(updates);
	}

	// 删除商品
	async function removeItem(itemId: string) {
		if (confirm('この商品をカートから削除しますか？')) {
			try {
				await cart.removeItem(itemId);
			} catch (err) {
				alert('削除に失敗しました');
			}
		}
	}

	// 应用优惠券
	async function applyCoupon() {
		if (!couponCode.trim()) {
			alert('クーポンコードを入力してください');
			return;
		}

		try {
			await coupon.applyCoupon(couponCode, $cartStats.subtotal);
			alert('クーポンが適用されました！');
		} catch (err: any) {
			alert(err.message);
		}
	}

	// 移除优惠券
	function removeCoupon() {
		coupon.removeCoupon();
		couponCode = '';
	}

	// 结算
	function goToCheckout() {
		if ($cartStats.selectedCount === 0) {
			alert('商品を選択してください');
			return;
		}
		goto('/checkout');
	}

	// 继续购物
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
				{$cart.items.length}件の商品
			</p>
		</div>

		{#if loading}
			<!-- 加载中 -->
			<div class="flex justify-center py-12">
				<div
					class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"
				></div>
			</div>
		{:else if error}
			<!-- 错误状态 -->
			<div class="rounded-lg bg-red-50 p-6 text-center">
				<p class="text-red-700">{error}</p>
				<button
					on:click={() => cart.refresh()}
					class="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
				>
					再試行
				</button>
			</div>
		{:else if $cart.items.length === 0}
			<!-- 空购物车 -->
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
								checked={$cart.items
									.filter((item) => item.product.in_stock)
									.every((item) => item.selected) &&
									$cart.items.filter((item) => item.product.in_stock).length > 0}
								on:change={toggleSelectAll}
							/>
							<span class="text-sm font-medium text-gray-700">すべて選択</span>
						</label>
						<span class="text-sm text-gray-500">
							({$cartStats.selectedCount}/{$cart.items.filter((item) => item.product.in_stock)
								.length}件選択中)
						</span>
					</div>

					<!-- 商品列表 -->
					<div class="space-y-4">
						{#each $cart.items as item (item.id)}
							<div
								class="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md {!item
									.product.in_stock
									? 'opacity-75'
									: ''}"
							>
								<div class="flex gap-4">
									<!-- 复选框 -->
									<div class="flex items-start pt-2">
										<input
											type="checkbox"
											class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
											checked={item.selected}
											disabled={!item.product.in_stock}
											on:change={() => cart.toggleSelect(item.id)}
										/>
									</div>

									<!-- 商品图片 -->
									<div class="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
										<img
											src={item.product.image}
											alt={item.product.name}
											class="h-full w-full object-cover"
										/>
										{#if !item.product.in_stock}
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
												<h3 class="mb-1 font-medium text-gray-900">{item.product.name}</h3>
												<div class="flex flex-wrap gap-2 text-xs text-gray-500">
													<span>サイズ: {item.product.tags}</span>
												</div>
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
													{formatPrice(item.product.price)}
												</span>
												{#if item.product.original_price}
													<span class="text-sm text-gray-400 line-through">
														{formatPrice(item.product.original_price)}
													</span>
												{/if}
											</div>

											<!-- 数量控制 -->
											<div class="flex items-center gap-3">
												<button
													class="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
													on:click={() => cart.updateQuantity(item.id, -1)}
													disabled={item.quantity <= 1 || !item.product.in_stock}
												>
													<svg
														class="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
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
													on:click={() => cart.updateQuantity(item.id, 1)}
													disabled={!item.product.in_stock}
												>
													<svg
														class="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
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
							{#if $coupon.applied}
								<div class="flex items-center justify-between rounded-lg bg-green-50 p-3">
									<div>
										<p class="text-sm font-medium text-green-900">{$coupon.code}</p>
										<p class="text-xs text-green-700">-{formatPrice($coupon.discount)}</p>
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
										class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
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
									<span>小計 ({$cartStats.selectedCount}件)</span>
									<span>{formatPrice($cartStats.subtotal)}</span>
								</div>
								<div class="flex justify-between text-gray-600">
									<span>送料無料</span>
								</div>
								{#if $coupon.discount > 0}
									<div class="flex justify-between text-green-600">
										<span>割引</span>
										<span>-{formatPrice($coupon.discount)}</span>
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
								disabled={$cartStats.selectedCount === 0}
							>
								購入手続きへ ({$cartStats.selectedCount}件)
							</button>

							<button
								class="mt-2 w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
								on:click={continueShopping}
							>
								ショッピングを続ける
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
