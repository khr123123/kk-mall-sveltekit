<script lang="ts">
	import { onMount } from 'svelte';
	import PocketBase from 'pocketbase';

	const pb = new PocketBase('http://127.0.0.1:8090');

	let brands: any[] = [];
	let selectedCategory = 'all';
	let searchQuery = '';
	let viewMode = 'grid'; // grid, list
	let sortBy = 'popular'; // popular, name, rating
	let loading = true;

	// 从 PocketBase 加载品牌数据
	async function loadBrands() {
		try {
			loading = true;
			const records = await pb.collection('brands').getFullList({
				sort: '-created'
			});
			brands = records;
		} catch (error) {
			console.error('ブランドの読み込みに失敗:', error);
		} finally {
			loading = false;
		}
	}

	// 排序和过滤
	$: displayedBrands = brands
		.filter((brand) => {
			if (selectedCategory !== 'all' && brand.category !== selectedCategory) {
				return false;
			}
			if (searchQuery && !brand.name.toLowerCase().includes(searchQuery.toLowerCase())) {
				return false;
			}
			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case 'popular':
					return b.followers - a.followers;
				case 'name':
					return a.name.localeCompare(b.name);
				case 'rating':
					return b.rating - a.rating;
				default:
					return 0;
			}
		});

	// 跟随品牌
	function followBrand(brand: any, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('フォロー:', brand.name);
		alert(`${brand.name}をフォローしました！`);
	}

	onMount(() => {
		loadBrands();
	});
</script>

<svelte:head>
	<title>人気ブランド | Brand Store</title>
</svelte:head>

<main class="min-h-screen bg-neutral-50">
	<section class="bg-linear-to-r from-gray-600 to-gray-800 text-white">
		<div class=" mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center gap-3">
				<svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
					/>
				</svg>
				<div>
					<h1 class="mb-2 text-3xl font-bold">人気ブランド</h1>
					<p class="text-white/90">あなたのお気に入りブランドを見つけましょう</p>
				</div>
			</div>
		</div>
	</section>
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- 排序和视图切换 -->
		<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div class="text-neutral-600">
				<span class="font-semibold text-neutral-900">{displayedBrands.length}</span> 件のブランド
			</div>

			<div class="flex items-center gap-4">
				<!-- 视图切换 -->
				<div class="flex rounded-lg border border-neutral-300 bg-white p-1">
					<button
						on:click={() => (viewMode = 'grid')}
						class="rounded-md p-2 transition-colors {viewMode === 'grid'
							? 'bg-neutral-900 text-white'
							: 'text-neutral-600 hover:bg-neutral-100'}"
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
						class="rounded-md p-2 transition-colors {viewMode === 'list'
							? 'bg-neutral-900 text-white'
							: 'text-neutral-600 hover:bg-neutral-100'}"
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
					class="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
				>
					<option value="popular">人気順</option>
					<option value="name">名前順</option>
					<option value="rating">評価順</option>
				</select>
			</div>
		</div>

		<!-- 加载状态 -->
		{#if loading}
			<div class="flex items-center justify-center py-16">
				<div
					class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900"
				></div>
			</div>
		{:else if displayedBrands.length === 0}
			<!-- 空状态 -->
			<div class="rounded-lg border border-neutral-200 bg-white py-16 text-center">
				<svg
					class="mx-auto mb-4 h-16 w-16 text-neutral-300"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<h3 class="mb-2 text-lg font-medium text-neutral-900">ブランドが見つかりません</h3>
				<p class="text-neutral-600">検索条件に一致するブランドがありませんでした</p>
			</div>
		{:else if viewMode === 'list'}
			<!-- 列表视图 -->
			<div class="space-y-4">
				{#each displayedBrands as brand}
					<a
						href="/brands/{brand.id}"
						class="group flex gap-6 overflow-hidden rounded-lg border border-neutral-200 bg-white p-6 no-underline transition-all hover:border-neutral-300 hover:shadow-md"
					>
						<!-- 品牌Logo -->
						<div
							class="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
						>
							{#if brand.logo}
								<img src={brand.logo} alt={brand.name} class="h-full w-full object-contain p-2" />
							{:else}
								<div class="flex h-full w-full items-center justify-center">
									<span class="text-2xl font-bold text-neutral-300">{brand.name.charAt(0)}</span>
								</div>
							{/if}
							{#if brand.isPopular}
								<div
									class="absolute top-2 left-2 rounded bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white"
								>
									HOT
								</div>
							{/if}
						</div>

						<!-- 品牌信息 -->
						<div class="flex flex-1 flex-col justify-between">
							<div>
								<div class="mb-2 flex items-start justify-between">
									<h3 class="text-xl font-bold text-neutral-900 group-hover:text-neutral-700">
										{brand.name}
									</h3>
									{#if brand.discounts > 0}
										<span
											class="rounded-full bg-neutral-900 px-3 py-1 text-sm font-medium text-white"
										>
											{brand.discounts}%OFF
										</span>
									{/if}
								</div>

								<p class="mb-4 line-clamp-2 text-sm text-neutral-600">{brand.description}</p>

								<!-- 评价 -->
								<div class="mb-4 flex items-center gap-2">
									<div class="flex">
										{#each Array(5) as _, i}
											<svg
												class="h-4 w-4 {i < Math.floor(brand.rating)
													? 'fill-current text-neutral-900'
													: 'text-neutral-300'}"
												viewBox="0 0 20 20"
											>
												<path
													d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
												/>
											</svg>
										{/each}
									</div>
									<span class="text-sm font-medium text-neutral-900">{brand.rating.toFixed(1)}</span
									>
								</div>

								<!-- 统计信息 -->
								<div class="flex items-center gap-6 text-sm text-neutral-600">
									<div class="flex items-center gap-1">
										<svg
											class="h-5 w-5 text-neutral-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.5"
												d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
											/>
										</svg>
										<span class="font-medium text-neutral-900"
											>{(brand.followers / 1000).toFixed(0)}K</span
										>
										<span>フォロワー</span>
									</div>
								</div>
							</div>

							<!-- 按钮 -->
							<div class="mt-4 flex gap-3">
								<button
									on:click|preventDefault={(e) => followBrand(brand, e)}
									class="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
								>
									フォロー
								</button>
								<button
									class="flex-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
								>
									商品を見る
								</button>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<!-- 网格视图 -->
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each displayedBrands as brand}
					<div
						class="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-md"
					>
						<a href="/brands/{brand.id}" class="block no-underline">
							<!-- 品牌Logo -->
							<div
								class="relative aspect-video overflow-hidden border-b border-neutral-100 bg-neutral-50"
							>
								{#if brand.logo}
									<img src={brand.logo} alt={brand.name} class="h-full w-full object-contain p-8" />
								{:else}
									<div class="flex h-full w-full items-center justify-center">
										<span class="text-4xl font-bold text-neutral-300">{brand.name.charAt(0)}</span>
									</div>
								{/if}

								<!-- 热门标签 -->
								{#if brand.isPopular}
									<div class="absolute top-3 left-3">
										<div
											class="rounded bg-neutral-900 px-3 py-1 text-xs font-medium text-white shadow-sm"
										>
											人気ブランド
										</div>
									</div>
								{/if}

								<!-- 折扣标签 -->
								{#if brand.discounts > 0}
									<div class="absolute top-3 right-3">
										<div
											class="rounded bg-neutral-900 px-3 py-1 text-xs font-medium text-white shadow-sm"
										>
											{brand.discounts}%OFF
										</div>
									</div>
								{/if}
							</div>

							<!-- 品牌信息 -->
							<div class="p-6">
								<!-- 品牌名称和评价 -->
								<div class="mb-4">
									<h3 class="mb-2 text-xl font-bold text-neutral-900 group-hover:text-neutral-700">
										{brand.name}
									</h3>
									<div class="flex items-center gap-2">
										<div class="flex">
											{#each Array(5) as _, i}
												<svg
													class="h-4 w-4 {i < Math.floor(brand.rating)
														? 'fill-current text-neutral-900'
														: 'text-neutral-300'}"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											{/each}
										</div>
										<span class="text-sm font-medium text-neutral-900"
											>{brand.rating.toFixed(1)}</span
										>
									</div>
								</div>

								<!-- 描述 -->
								<p class="mb-6 line-clamp-2 text-sm text-neutral-600">{brand.description}</p>

								<!-- 统计信息 -->
								<div class="mb-6 flex items-center justify-between text-sm text-neutral-600">
									<span class="text-neutral-500">フォロワー</span>
									<span class="font-medium text-neutral-900"
										>{(brand.followers / 1000).toFixed(1)}K</span
									>
								</div>
							</div>
						</a>

						<!-- 按钮 -->
						<div class="border-t border-neutral-100 p-6 pt-0">
							<div class="flex gap-3">
								<button
									on:click|preventDefault={(e) => followBrand(brand, e)}
									class="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
								>
									フォロー
								</button>
								<a
									href="/brands/{brand.id}"
									class="flex-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white no-underline hover:bg-neutral-800"
								>
									商品を見る
								</a>
							</div>
						</div>
					</div>
				{/each}
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

	.aspect-video {
		aspect-ratio: 16 / 9;
	}
</style>
