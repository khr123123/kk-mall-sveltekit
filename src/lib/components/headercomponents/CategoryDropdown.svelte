<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/services/categoryService';

	// Props
	export let categories: Category[] = [];

	// State
	let showMenu = false;
	let activeParentId: string | null = null;
	let menuTimeout: number;

	$: activeCategory = categories.find((cat) => cat.id === activeParentId);

	function openMenu() {
		clearTimeout(menuTimeout);
		showMenu = true;
		activeParentId = categories[0]?.id || null;
		console.log(activeCategory);
		console.log(categories);
	}

	function closeMenu() {
		menuTimeout = window.setTimeout(() => {
			showMenu = false;
			activeParentId = null;
		}, 150);
	}

	function handleMouseEnterCategory(categoryId: string) {
		clearTimeout(menuTimeout);
		activeParentId = categoryId;
	}

	function navigateToCategory(categoryId: string) {
		goto(`/category/${categoryId}`);
	}
</script>

<div
	class="category-dropdown-container relative"
	on:mouseenter={openMenu}
	on:mouseleave={closeMenu}
>
	<button
		class="category-button ml-5 flex min-w-[180px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
		aria-haspopup="true"
		aria-expanded={showMenu}
	>
		<img src="/mall/分类.svg" alt="" class="h-5 w-5" />
		<span class="font-medium">すべてのカテゴリ</span>
	</button>

	<!-- 分类下拉菜单 -->
	{#if showMenu}
		<div
			class="category-menu-wrapper absolute top-full left-0 mt-1 flex w-[800px] rounded-lg border border-gray-200 bg-white shadow-xl"
			on:mouseenter={openMenu}
			on:mouseleave={closeMenu}
			role="menu"
		>
			<!-- 父分类 -->
			<div class="w-62 border-r border-gray-100 bg-gray-50 p-2">
				{#each categories as category}
					<div
						class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors {activeParentId ===
						category.id
							? 'bg-gray-100 text-gray-900'
							: 'text-gray-700 hover:bg-gray-100'}"
						on:mouseenter={() => handleMouseEnterCategory(category.id)}
						role="menuitem"
						tabindex="0"
						on:click={() => navigateToCategory(category.id)}
					>
						<img src={category.icon} alt={category.name} class="h-5 w-5 object-cover" />
						<span class="font-medium">{category.name}</span>
						<svg class="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</div>
				{/each}
			</div>

			<!-- 子分类 -->
			{#if activeCategory?.expand?.children}
				<div class="flex-1 p-6">
					<div class="grid grid-cols-2 gap-6">
						{#each activeCategory.expand.children as child}
							<a
								href="/category/{activeCategory.id}/{child.id}"
								class="block rounded-lg px-3 py-2 font-semibold text-gray-900 transition hover:bg-gray-100"
								role="menuitem"
							>
								{child.name}
							</a>
						{/each}
					</div>
				</div>
			{:else}
				<div class="flex flex-1 items-center justify-center p-6">
					<p class="text-gray-500">サブカテゴリーを選択してください</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.category-menu-wrapper {
		animation: fadeIn 0.2s ease-out;
		z-index: 50;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 1280px) {
		.category-button {
			min-width: 160px;
		}
	}
</style>
