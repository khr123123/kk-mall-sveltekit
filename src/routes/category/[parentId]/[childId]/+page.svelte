<script lang="ts">
    import {page} from '$app/state';
    import {afterNavigate} from '$app/navigation';
    import {onDestroy, onMount} from 'svelte';
    import {categoryStore} from '$lib/stores/categoryStore';
    import type {RecordModel} from 'pocketbase';
    import PocketBase from 'pocketbase';
    import {
        categoryBreadcrumbArrow,
        categoryEmptyProducts,
        categoryIconPlaceholder,
        categoryPaginationNext,
        categoryPaginationPrev
    } from '$lib/icons/svgs';

    let pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

    // 状态管理
    let parentId = $state('');
    let childId = $state('');
    let currentCategory = $state<RecordModel | null>(null);
    let parentCategory = $state<RecordModel | null>(null);
    let siblingCategories = $state<RecordModel[]>([]);
    let products = $state<RecordModel[]>([]);
    let isLoading = $state(false);
    let sortBy = $state('newest');

    // 分页
    let currentPage = $state(1);
    let totalPages = $state(1);
    let totalItems = $state(0);
    let perPage = $state(20);

    // 筛选状态
    let priceRange = $state<string>('all');
    let selectedBrands = $state<string[]>([]);
    let availableBrands = $state<string[]>([]);
    let showOnlyInStock = $state(false);

    // 点赞/收藏状态
    let userLikes = $state<Set<string>>(new Set());
    let isLoadingLikes = $state(false);
    let showLoginModal = $state(false);

    // 初始化
    onMount(async () => {
        await loadData();
        if (pb.authStore.isValid) {
            await loadUserLikes();
        }

        // 监听用户登录状态变化
        pb.authStore.onChange(async () => {
            if (pb.authStore.isValid) {
                await loadUserLikes();
            } else {
                userLikes.clear();
            }
        });
    });

    onDestroy(() => {
        // 清理监听器
        pb.authStore.onChange(() => {
        });
    });

    // 监听路由变化
    afterNavigate(async (navigation) => {
        if (navigation.to?.params) {
            await loadData();
            if (pb.authStore.isValid) {
                await loadUserLikes();
            }
        }
    });

    async function loadData() {
        try {
            isLoading = true;

            // 等待store数据加载
            if (!$categoryStore.isLoaded) {
                await new Promise((resolve) => {
                    const unsubscribe = categoryStore.subscribe((store) => {
                        if (store.isLoaded) {
                            resolve(true);
                            unsubscribe();
                        }
                    });
                });
            }

            const parentIdParam = page.params.parentId;
            const childIdParam = page.params.childId;
            if (!parentIdParam || !childIdParam) return;

            parentId = parentIdParam;
            childId = childIdParam;

            // 从 store 获取父分类信息
            const categories = $categoryStore.categories;
            parentCategory = categories.find((cat: any) => cat.id === parentIdParam) || null;

            if (!parentCategory) {
                console.error('父分类未找到:', parentIdParam);
                return;
            }

            // 获取当前子分类
            siblingCategories = parentCategory.expand?.children || [];
            currentCategory = siblingCategories.find((sub: any) => sub.id === childIdParam) || null;

            if (!currentCategory) {
                console.error('子分类未找到:', childIdParam);
                return;
            }

            // 获取该子分类下的品牌
            await loadBrands();

            // 加载商品
            await loadProducts();
        } catch (error) {
            console.error('加载数据失败:', error);
            currentCategory = null;
            parentCategory = null;
            siblingCategories = [];
            products = [];
        } finally {
            isLoading = false;
        }
    }

    async function loadBrands() {
        try {
            // 查询该子分类下的商品中的品牌
            const result = await pb.collection('products').getList(1, 1000, {
                filter: `category_id = "${childId}"`,
                fields: 'brand'
            });

            // 去重并过滤空值
            const brands = [
                ...new Set(
                    result.items.map((item) => item.brand).filter((brand) => brand && brand.trim() !== '')
                )
            ];

            availableBrands = brands.sort((a, b) => a.localeCompare(b));
        } catch (error) {
            console.error('加载品牌失败:', error);
            availableBrands = [];
        }
    }

    async function loadProducts() {
        try {
            // 构建筛选条件
            let filter = `category_id = "${childId}"`;

            // 价格筛选
            if (priceRange !== 'all') {
                const ranges: Record<string, [number, number]> = {
                    '0-500': [0, 500],
                    '500-1000': [500, 1000],
                    '1000-10000': [1000, 10000],
                    '10000+': [10000, 9999999]
                };
                const [min, max] = ranges[priceRange] || [0, 9999999];
                filter += ` && price >= ${min} && price <= ${max}`;
            }

            // 品牌筛选
            if (selectedBrands.length > 0) {
                const brandFilters = selectedBrands.map((brand) => `brand = "${brand}"`).join(' || ');
                filter += ` && (${brandFilters})`;
            }

            // 库存筛选
            if (showOnlyInStock) {
                filter += ` && inStock = true`;
            }

            // 构建排序
            let sort = '-created';
            switch (sortBy) {
                case 'price-low':
                    sort = 'price';
                    break;
                case 'price-high':
                    sort = '-price';
                    break;
                case 'popular':
                    sort = '-reviews';
                    break;
                case 'rating':
                    sort = '-rating';
                    break;
                default:
                    sort = '-created'; // 新着順
            }

            // 获取商品数据
            const result = await pb.collection('products').getList(currentPage, perPage, {
                filter,
                sort,
                expand: 'likes_count'
            });

            products = result.items;
            totalItems = result.totalItems;
            totalPages = result.totalPages;
        } catch (error) {
            console.error('加载商品失败:', error);
            products = [];
            totalItems = 0;
            totalPages = 1;
        }
    }

    // 加载用户已点赞/收藏的商品
    async function loadUserLikes() {
        if (!pb.authStore.isValid) return;

        try {
            isLoadingLikes = true;

            // 查询当前用户的所有收藏记录
            const records = await pb.collection('favorites').getFullList({
                filter: `user = "${pb.authStore.record!.id}"`,
                fields: 'id,product_id'
            });

            // 由于product_id是数组，我们需要提取所有product_id
            const allProductIds = new Set<string>();
            records.forEach(record => {
                if (record.product_id && Array.isArray(record.product_id)) {
                    record.product_id.forEach((id: string) => {
                        allProductIds.add(id);
                    });
                }
            });

            userLikes = allProductIds;
            console.log('加载收藏:', userLikes);
        } catch (error) {
            console.error('加载收藏失败:', error);
            userLikes = new Set();
        } finally {
            isLoadingLikes = false;
        }
    }

    // 查找包含指定商品ID的收藏记录
    async function findFavoriteRecord(productId: string) {
        try {
            const userId = pb.authStore.record!.id;

            // 查找包含该商品ID的收藏记录
            const records = await pb.collection('favorites').getFullList({
                filter: `user = "${userId}" && product_id ~ "${productId}"`
            });

            return records.length > 0 ? records[0] : null;
        } catch (error) {
            console.error('查找收藏记录失败:', error);
            return null;
        }
    }

    // 点赞/取消点赞函数
    async function toggleLike(product: RecordModel, event: Event) {
        event.stopPropagation();
        event.preventDefault();

        if (!pb.authStore.isValid) {
            showLoginModal = true;
            setTimeout(() => closeLoginModal(), 5000)
            return;
        }

        try {
            const userId = pb.authStore.record!.id;
            const productId = product.id;

            if (userLikes.has(productId)) {
                // 取消收藏
                await removeLike(userId, productId);
                userLikes.delete(productId);
                console.log('取消收藏:', product.name_ja || product.name);
            } else {
                // 收藏
                await addLike(userId, productId);
                userLikes.add(productId);
                console.log('收藏商品:', product.name_ja || product.name);
            }

            // 更新商品收藏数显示
            await updateProductLikeCount(productId);
        } catch (error: any) {
            console.error('操作失败:', error.message || error);
        }
    }

    // 添加收藏到数据库
    async function addLike(userId: string, productId: string) {
        try {
            // 先检查是否已有收藏记录
            const existingRecord = await findFavoriteRecord(productId);

            if (existingRecord) {
                // 如果记录已存在，将新的product_id添加到数组中
                const updatedProductIds = [...(existingRecord.product_id || []), productId];
                await pb.collection('favorites').update(existingRecord.id, {
                    product_id: updatedProductIds
                });
            } else {
                // 创建新的收藏记录
                await pb.collection('favorites').create({
                    user: userId,
                    product_id: [productId]
                });
            }
        } catch (error: any) {
            console.error('添加收藏失败:', error.message || error);
            throw error;
        }
    }

    // 从数据库移除收藏
    async function removeLike(userId: string, productId: string) {
        try {
            const existingRecord = await findFavoriteRecord(productId);

            if (existingRecord) {
                // 从product_id数组中移除该商品ID
                const currentProductIds = existingRecord.product_id || [];
                const updatedProductIds = currentProductIds.filter((id: string) => id !== productId);

                if (updatedProductIds.length > 0) {
                    // 如果还有其他商品，更新数组
                    await pb.collection('favorites').update(existingRecord.id, {
                        product_id: updatedProductIds
                    });
                } else {
                    // 如果没有其他商品，删除整个记录
                    await pb.collection('favorites').delete(existingRecord.id);
                }
            }
        } catch (error: any) {
            console.error('取消收藏失败:', error.message || error);
            throw error;
        }
    }

    // 更新产品收藏数（可选）
    async function updateProductLikeCount(productId: string) {
        try {
            // 查询该商品的收藏总数
            const result = await pb.collection('favorites').getList(1, 1, {
                filter: `product_id ~ "${productId}"`,
                fields: 'id'
            });

            // 更新产品的收藏数字段
            if (products.some(p => p.id === productId)) {
                // 更新本地状态
                products = products.map(p => {
                    if (p.id === productId) {
                        return {
                            ...p,
                            likes_count: result.totalItems || 0
                        };
                    }
                    return p;
                });
            }
        } catch (error) {
            console.error('更新收藏数失败:', error);
        }
    }

    // 检查用户是否已收藏该商品
    function isLiked(productId: string): boolean {
        return userLikes.has(productId);
    }

    // 格式化价格
    function formatPrice(price: number) {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            maximumFractionDigits: 0
        }).format(price);
    }

    // 获取商品图片URL
    function getProductImageUrl(product: RecordModel) {
        if (product.image) {
            return product.image;
        } else if (product.images && product.images.length > 0) {
            return product.images[0];
        }
        return '/images/placeholder.jpg';
    }

    // 获取分类图片URL
    function getCategoryImageUrl(category: RecordModel) {
        if (category.icon) {
            return category.icon;
        }
        return '/icons/default-category.svg';
    }

    // 添加到购物车
    function addToCart(product: RecordModel, event: Event) {
        event.stopPropagation();
        event.preventDefault();
        console.log('添加到购物车:', product.name_ja || product.name);
    }

    // 排序变化
    async function handleSortChange() {
        currentPage = 1;
        await loadProducts();
    }

    // 价格筛选变化
    async function handlePriceChange() {
        currentPage = 1;
        await loadProducts();
    }

    // 品牌筛选变化
    async function handleBrandChange() {
        currentPage = 1;
        await loadProducts();
    }

    // 库存筛选变化
    async function handleStockChange() {
        currentPage = 1;
        await loadProducts();
    }

    // 翻页
    async function goToPage(pageNum: number) {
        if (pageNum < 1 || pageNum > totalPages) return;
        currentPage = pageNum;
        await loadProducts();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    // 关闭登录模态框
    function closeLoginModal() {
        showLoginModal = false;
    }
</script>

<div class="min-h-screen bg-white">
    <!-- 面包屑导航 -->
    <div class="border-b border-gray-200 bg-gray-50">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav class="py-3">
                <div class="flex items-center text-sm">
                    <a class="text-gray-600 hover:text-gray-900" href="/">ホーム</a>
                    {@html categoryBreadcrumbArrow}
                    <a class="text-gray-600 hover:text-gray-900" href="/category/{parentId}"
                    >{parentCategory?.name}</a
                    >
                    {@html categoryBreadcrumbArrow}
                    <span class="font-medium text-gray-900">{currentCategory?.name}</span>
                </div>
            </nav>
        </div>
    </div>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <!-- 页面头部 -->
        <div class="mb-8">
            <div class="mb-6 flex items-center gap-4">
                <div class="rounded-xl bg-gray-100 p-3">
                    {#if parentCategory?.icon}
                        <img
                                src={getCategoryImageUrl(parentCategory)}
                                alt={parentCategory.name}
                                class="h-10 w-10 object-contain"
                        />
                    {:else}
                        <div class="flex h-10 w-10 items-center justify-center text-gray-400">
                            {@html categoryIconPlaceholder}
                        </div>
                    {/if}
                </div>
                <div class="flex-1">
                    <h1 class="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                        {currentCategory?.name}
                    </h1>
                    <p class="text-gray-600">
                        {parentCategory?.name} › {currentCategory?.name} の専門商品
                    </p>
                </div>
            </div>

            <!-- 兄弟分类导航 -->
            {#if siblingCategories.length > 0}
                <div class="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                    <a
                            href="/category/{parentId}"
                            class="rounded-lg border border-gray-300 bg-white px-4 py-2 whitespace-nowrap text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        すべて
                    </a>
                    {#each siblingCategories as subcategory}
                        <a
                                href="/category/{parentId}/{subcategory.id}"
                                class="rounded-lg border px-4 py-2 whitespace-nowrap transition-colors {childId ===
                            subcategory.id
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
                        >
                            {subcategory.name}
                        </a>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="flex flex-col gap-8 lg:flex-row">
            <!-- 侧边栏筛选 -->
            <aside class="shrink-0 lg:w-64">
                <div class="sticky top-6 space-y-6">
                    <!-- 价格筛选 -->
                    <div class="rounded-lg border border-gray-200 bg-white">
                        <div class="border-b border-gray-200 p-4">
                            <h3 class="font-semibold text-gray-900">価格帯</h3>
                        </div>
                        <div class="space-y-3 p-4">
                            <label class="flex cursor-pointer items-center">
                                <input
                                        bind:group={priceRange}
                                        class="h-4 w-4 text-gray-900"
                                        name="price"
                                        onchange={handlePriceChange}
                                        type="radio"
                                        value="all"
                                />
                                <span class="ml-2 text-gray-700">すべて</span>
                            </label>
                            <label class="flex cursor-pointer items-center">
                                <input
                                        bind:group={priceRange}
                                        class="h-4 w-4 text-gray-900"
                                        name="price"
                                        onchange={handlePriceChange}
                                        type="radio"
                                        value="0-500"
                                />
                                <span class="ml-2 text-gray-700">¥0 - ¥500</span>
                            </label>
                            <label class="flex cursor-pointer items-center">
                                <input
                                        bind:group={priceRange}
                                        class="h-4 w-4 text-gray-900"
                                        name="price"
                                        onchange={handlePriceChange}
                                        type="radio"
                                        value="500-1000"
                                />
                                <span class="ml-2 text-gray-700">¥500 - ¥1000</span>
                            </label>
                            <label class="flex cursor-pointer items-center">
                                <input
                                        bind:group={priceRange}
                                        class="h-4 w-4 text-gray-900"
                                        name="price"
                                        onchange={handlePriceChange}
                                        type="radio"
                                        value="1000-10000"
                                />
                                <span class="ml-2 text-gray-700">¥1000 - ¥10,000</span>
                            </label>
                            <label class="flex cursor-pointer items-center">
                                <input
                                        bind:group={priceRange}
                                        class="h-4 w-4 text-gray-900"
                                        name="price"
                                        onchange={handlePriceChange}
                                        type="radio"
                                        value="10000+"
                                />
                                <span class="ml-2 text-gray-700">¥10,000以上</span>
                            </label>
                        </div>
                    </div>

                    <!-- 品牌筛选 -->
                    {#if availableBrands.length > 0}
                        <div class="rounded-lg border border-gray-200 bg-white">
                            <div class="border-b border-gray-200 p-4">
                                <h3 class="font-semibold text-gray-900">ブランド</h3>
                            </div>
                            <div class="max-h-80 space-y-3 overflow-y-auto p-4">
                                {#each availableBrands as brand}
                                    <label class="flex cursor-pointer items-center">
                                        <input
                                                type="checkbox"
                                                value={brand}
                                                bind:group={selectedBrands}
                                                onchange={handleBrandChange}
                                                class="h-4 w-4 rounded border-gray-300 text-gray-900"
                                        />
                                        <span class="ml-2 text-gray-700">{brand}</span>
                                    </label>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- 库存筛选 -->
                    <div class="rounded-lg border border-gray-200 bg-white p-4">
                        <label class="flex cursor-pointer items-center">
                            <input
                                    bind:checked={showOnlyInStock}
                                    class="h-4 w-4 rounded border-gray-300 text-gray-900"
                                    onchange={handleStockChange}
                                    type="checkbox"
                            />
                            <span class="ml-2 text-gray-700">在庫ありのみ表示</span>
                        </label>
                    </div>
                </div>
            </aside>

            <!-- 主内容区 -->
            <div class="flex-1">
                <!-- 排序和统计 -->
                <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div class="text-gray-600">
                        {#if totalItems > 0}
                            全 <span class="font-semibold">{totalItems}</span> 件の商品
                        {/if}
                    </div>
                    <div class="flex items-center gap-3">
                        <select
                                bind:value={sortBy}
                                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                                onchange={handleSortChange}
                        >
                            <option value="newest">新着順</option>
                            <option value="price-low">価格が安い順</option>
                            <option value="price-high">価格が高い順</option>
                            <option value="popular">人気順</option>
                            <option value="rating">評価順</option>
                        </select>
                    </div>
                </div>

                <!-- 加载状态 -->
                {#if isLoading}
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {#each Array(8) as _}
                            <div class="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
                                <div class="mb-4 h-48 rounded-lg bg-gray-200"></div>
                                <div class="mb-2 h-4 rounded bg-gray-200"></div>
                                <div class="mb-4 h-3 w-3/4 rounded bg-gray-200"></div>
                                <div class="h-6 w-1/2 rounded bg-gray-200"></div>
                            </div>
                        {/each}
                    </div>
                {:else if products.length === 0}
                    <div class="flex flex-col items-center justify-center py-20">
                        {@html categoryEmptyProducts}
                        <h3 class="mb-2 text-lg font-medium text-gray-900">商品が見つかりませんでした</h3>
                        <p class="text-gray-600">フィルター条件を変更してみてください</p>
                    </div>
                {:else}
                    <!-- 商品网格 -->
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {#each products as product}
                            <a
                                    href="/product/{product.id}"
                                    class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg"
                            >
                                <!-- 商品图片 -->
                                <div class="relative overflow-hidden bg-gray-100">
                                    <img
                                            src={getProductImageUrl(product)}
                                            alt={product.name_ja || product.name}
                                            class="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                    />
                                    <!-- 标签 -->
                                    <div class="absolute top-3 left-3 flex flex-col gap-2">
                                        {#if product.discount > 0}
                                            <span class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                                                -{product.discount}%
                                            </span>
                                        {/if}
                                        {#if product.isNew}
                                            <span class="rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                                                NEW
                                            </span>
                                        {/if}
                                        {#if product.isHot}
                                            <span class="rounded bg-orange-600 px-2 py-1 text-xs font-bold text-white">
                                                HOT
                                            </span>
                                        {/if}
                                    </div>

                                    <!-- 收藏按钮 -->
                                    <button
                                            onclick={(e) => toggleLike(product, e)}
                                            class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white {isLiked(product.id) ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-gray-600'}"
                                            aria-label="{isLiked(product.id) ? 'お気に入りから削除' : 'お気に入りに追加'}"
                                            title="{isLiked(product.id) ? 'お気に入りから削除' : 'お気に入りに追加'}"
                                            disabled={isLoadingLikes}
                                    >
                                        {#if isLiked(product.id)}
                                            <!-- 已收藏 - 填充的心形图标 -->
                                            <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                            </svg>
                                        {:else}
                                            <!-- 未收藏 - 空心心形图标 -->
                                            <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                                      fill="none" stroke="currentColor" stroke-width="2"/>
                                            </svg>
                                        {/if}
                                    </button>

                                    <!-- 收藏计数显示 -->
                                    {#if product.likes_count > 0}
                                        <div class="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                                            <svg class="h-3 w-3 fill-current" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                            </svg>
                                            <span>{product.likes_count || 0}</span>
                                        </div>
                                    {/if}

                                    <!-- 缺货标记 -->
                                    {#if !product.inStock}
                                        <div class="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <span class="text-sm font-semibold text-white">SOLD OUT</span>
                                        </div>
                                    {/if}
                                </div>

                                <!-- 商品信息 -->
                                <div class="p-4">
                                    <!-- 品牌 -->
                                    {#if product.brand}
                                        <div class="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                            {product.brand}
                                        </div>
                                    {/if}

                                    <!-- 评价 -->
                                    <div class="mb-2 flex items-center gap-1">
                                        <div class="flex">
                                            {#each Array(5) as _, i}
                                                <svg
                                                        class="h-4 w-4 {i < Math.floor(product.rating || 0)
                                                        ? 'fill-current text-yellow-400'
                                                        : 'text-gray-300'}"
                                                        viewBox="0 0 20 20"
                                                >
                                                    <path
                                                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                                    />
                                                </svg>
                                            {/each}
                                        </div>
                                        <span class="ml-1 text-sm text-gray-600"
                                        >{(product.rating || 0).toFixed(1)}</span
                                        >
                                        <span class="text-sm text-gray-400">({product.reviews || 0})</span>
                                    </div>

                                    <!-- 商品名 -->
                                    <h3 class="mb-2 line-clamp-2 font-medium text-gray-900 group-hover:text-gray-700">
                                        {product.name_ja || product.name}
                                    </h3>

                                    <!-- 价格 -->
                                    <div class="mb-4 flex items-center gap-2">
                                        <span class="text-lg font-bold text-gray-900">
                                            {formatPrice(product.price)}
                                        </span>
                                        {#if product.originalPrice > product.price}
                                            <span class="text-sm text-gray-500 line-through">
                                                {formatPrice(product.originalPrice)}
                                            </span>
                                        {/if}
                                    </div>

                                    <!-- 标签 -->
                                    {#if product.tags && product.tags.length > 0}
                                        <div class="mb-4 flex flex-wrap gap-1">
                                            {#each product.tags.slice(0, 3) as tag}
                                                <span
                                                        class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                                                >
                                                    {tag}
                                                </span>
                                            {/each}
                                        </div>
                                    {/if}

                                    <!-- 添加到购物车按钮 -->
                                    <button
                                            onclick={(e) => addToCart(product, e)}
                                            class="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                            disabled={!product.inStock}
                                    >
                                        {#if product.inStock}
                                            カートに追加
                                        {:else}
                                            売り切れ
                                        {/if}
                                    </button>
                                </div>
                            </a>
                        {/each}
                    </div>

                    <!-- 分页 -->
                    {#if totalPages > 1}
                        <div class="mt-8 flex justify-center">
                            <nav class="flex items-center gap-2">
                                <button
                                        onclick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {@html categoryPaginationPrev}
                                </button>

                                {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                    if (totalPages <= 5) return i + 1;
                                    if (currentPage <= 3) return i + 1;
                                    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                                    return currentPage - 2 + i;
                                }) as pageNum}
                                    <button
                                            onclick={() => goToPage(pageNum)}
                                            class="flex h-10 w-10 items-center justify-center rounded-lg font-medium transition-colors {currentPage ===
                                        pageNum
                                            ? 'bg-gray-900 text-white'
                                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}"
                                    >
                                        {pageNum}
                                    </button>
                                {/each}

                                <button
                                        onclick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {@html categoryPaginationNext}
                                </button>
                            </nav>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </main>
</div>

<!-- 在文件的最后部分，替换原来的模态框代码 -->

<!-- 登录提示 - 简洁的toast通知 -->
{#if showLoginModal}
    <div class="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div class="animate-in slide-in-from-top-5 fade-in flex w-full max-w-sm items-center justify-between rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg">
            <div class="flex items-center gap-3">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <div>
                    <p class="text-sm font-medium">ログインが必要です</p>
                    <p class="text-xs text-gray-300">お気に入り機能を使用するにはログインしてください</p>
                </div>
            </div>
            <button
                    onclick={closeLoginModal}
                    class="ml-4 text-gray-300 hover:text-white"
                    aria-label="閉じる"
            >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    </div>
{/if}


<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* 确保收藏按钮在移动设备上也可见 */
    @media (max-width: 640px) {
        button[aria-label*="お気に入り"] {
            opacity: 1 !important;
        }
    }
</style>