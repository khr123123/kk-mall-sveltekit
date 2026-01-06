<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import {goto} from '$app/navigation';
    import {cart, cartStats} from '$lib/stores/cartStore';
    import {currentUser} from '$lib/stores/userStore';

    let isOpen = $state(false);
    let dropdownElement: HTMLElement;
    let isBrowser = $state(false);

    function toggleDropdown() {
        isOpen = !isOpen;
    }

    function closeDropdown() {
        isOpen = false;
    }

    function handleClickOutside(event: MouseEvent) {
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
            closeDropdown();
        }
    }

    async function updateQuantity(itemId: string, delta: number) {
        try {
            await cart.updateQuantity(itemId, delta);
        } catch (error) {
            console.error('数量更新エラー:', error);
        }
    }

    async function removeItem(itemId: string) {
        try {
            await cart.removeItem(itemId);
        } catch (error) {
            console.error('削除エラー:', error);
        }
    }

    function goToCart() {
        closeDropdown();
        goto('/cart');
    }

    function goToCheckout() {
        closeDropdown();
        goto('/checkout');
    }

    function formatPrice(price: number | null | undefined): string {
        if (price === null || price === undefined || isNaN(price)) {
            return '¥0';
        }
        return `¥${price.toLocaleString('ja-JP')}`;
    }

    onMount(() => {
        isBrowser = typeof window !== 'undefined';
        if (isBrowser) {
            document.addEventListener('click', handleClickOutside);

            // 加载购物车数据
            if ($currentUser) {
                cart.loadCart();
            }
        }
    });

    onDestroy(() => {
        if (isBrowser) {
            document.removeEventListener('click', handleClickOutside);
        }
    });

    // 监听用户登录状态变化
    $effect(() => {
        if ($currentUser) {
            cart.loadCart();
        } else {
            cart.clearCart();
        }
    });
</script>

<div bind:this={dropdownElement} class="relative">
    <!-- 购物车按钮 -->
    <button
            aria-expanded={isOpen}
            aria-label="ショッピングカート"
            class="relative flex cursor-pointer items-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
            onclick={toggleDropdown}
    >
        <img alt="cart" class="h-6 w-6" src="/svgs/购物车.svg"/>
        {#if $cartStats.totalItems > 0}
			<span
                    class="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white"
                    aria-label="{$cartStats.totalItems} items in cart"
            >
				{$cartStats.totalItems > 99 ? '99+' : $cartStats.totalItems}
			</span>
        {/if}
    </button>

    <!-- 下拉面板 -->
    {#if isOpen && isBrowser && $currentUser}
        <div
                class="cart-dropdown absolute top-full right-0 z-50 mt-2 w-[380px] max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all"
                style="animation: scaleIn 0.2s ease-out;"
        >
            <!-- 头部 -->
            <div class="border-b border-gray-100 px-5 py-3.5">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                        <h3 class="text-base font-semibold text-gray-900 truncate">ショッピングカート</h3>
                        {#if $cartStats.totalItems > 0}
							<span class="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white whitespace-nowrap">
								{$cartStats.totalItems}点
							</span>
                        {/if}
                    </div>
                    <button
                            class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 flex-shrink-0"
                            onclick={closeDropdown}
                            aria-label="閉じる"
                    >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- 商品列表 -->
            <div class="max-h-[350px] overflow-y-auto custom-scrollbar">
                {#if $cart.loading}
                    <div class="flex items-center justify-center py-12">
                        <div class="text-gray-400">
                            <svg class="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </div>
                {:else if $cart.items.length === 0}
                    <div class="flex flex-col items-center justify-center py-12">
                        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <svg
                                    class="h-8 w-8 text-gray-400"
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
                        </div>
                        <p class="mb-1 text-sm font-medium text-gray-900">カートは空です</p>
                        <p class="text-xs text-gray-500">商品を追加してください</p>
                    </div>
                {:else}
                    <div class="divide-y divide-gray-100">
                        {#each $cart.items as item (item.id)}
                            <div class="group px-4 py-3.5 transition-colors hover:bg-gray-50">
                                <div class="flex gap-3">
                                    <!-- 商品图片 -->
                                    <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                class="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                loading="lazy"
                                        />
                                        {#if !item.product.in_stock}
                                            <div class="absolute inset-0 flex items-center justify-center bg-black/70">
                                                <span class="text-[10px] font-medium text-white">在庫切れ</span>
                                            </div>
                                        {/if}
                                    </div>

                                    <!-- 商品信息 -->
                                    <div class="flex flex-1 flex-col min-w-0">
                                        <div class="mb-1.5 flex items-start justify-between gap-2">
                                            <div class="min-w-0 flex-1">
                                                <h4
                                                        class="mb-0.5 text-sm font-semibold text-gray-900 group-hover:text-gray-600 line-clamp-2"
                                                        title={item.product.name}
                                                >
                                                    {item.product.name}
                                                </h4>
                                                {#if item.skuInfo}
                                                    <div class="flex flex-wrap gap-1">
                                                        {#each Object.entries(item.skuInfo.specs) as [key, value]}
															<span class="text-[12px] font-mono text-gray-500 truncate max-w-[120px]"
                                                                  title="{key}:{value}">
																{key}:{value}
															</span>
                                                        {/each}
                                                    </div>
                                                {/if}
                                            </div>
                                            <button
                                                    class="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                                                    onclick={() => removeItem(item.id)}
                                                    aria-label="商品を削除"
                                            >
                                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                                     stroke="currentColor">
                                                    <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="1.5"
                                                            d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        <div class="mt-auto flex items-end justify-between gap-2">
                                            <!-- 价格 -->
                                            <div class="flex flex-col min-w-0">
                                                <div class="flex items-baseline gap-1.5 flex-wrap">
													<span class="text-sm font-bold text-gray-900 whitespace-nowrap">
														{formatPrice(item.product.price)}
													</span>
                                                    {#if item.product.original_price && item.product.original_price > item.product.price}
														<span class="text-xs text-gray-400 line-through whitespace-nowrap">
															{formatPrice(item.product.original_price)}
														</span>
                                                    {/if}
                                                    <div class="text-[10px] text-gray-500 whitespace-nowrap">1個あたり
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- 数量控制 -->
                                            <div class="flex items-center gap-1.5 shrink-0">
                                                <button
                                                        class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95 disabled:opacity-30"
                                                        onclick={() => updateQuantity(item.id, -1)}
                                                        disabled={item.quantity <= 1}
                                                        aria-label="数量を減らす"
                                                >
                                                    <svg
                                                            class="h-3.5 w-3.5"
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
                                                <span class="w-7 text-center text-xs font-semibold text-gray-900">
													{item.quantity}
												</span>
                                                <button
                                                        class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95 disabled:opacity-30"
                                                        onclick={() => updateQuantity(item.id, 1)}
                                                        disabled={!item.product.in_stock}
                                                        aria-label="数量を増やす"
                                                >
                                                    <svg
                                                            class="h-3.5 w-3.5"
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
                {/if}
            </div>

            <!-- 底部 -->
            {#if $cart.items.length > 0}
                <div class="border-t border-gray-100 bg-white px-4 py-4">
                    <!-- 总计 -->
                    <div class="mb-3 rounded-lg bg-gray-50 p-3">
                        <div class="mb-1.5 flex items-center justify-between">
                            <span class="text-xs text-gray-600">小計 ({$cartStats.totalItems}点)</span>
                            <span class="text-base font-bold text-gray-900">{formatPrice($cartStats.subtotal)}</span>
                        </div>
                        <div class="flex items-center gap-1 text-[10px] text-gray-500">
                            <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                            <span class="line-clamp-1">送料は購入手続き時に計算されます</span>
                        </div>
                    </div>

                    <!-- 按钮组 -->
                    <div class="grid grid-cols-2 gap-2.5">
                        <button
                                class="rounded-lg border-2 border-gray-300 bg-white py-2.5 text-xs font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]"
                                onclick={goToCart}
                        >
                            カートを見る
                        </button>
                        <button
                                class="rounded-lg bg-gray-900 py-2.5 text-xs font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
                                onclick={goToCheckout}
                        >
                            購入手続きへ
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    /* 自定义滚动条样式 */
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 #f1f5f9;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }

    /* 文字截断工具类 */
    .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>