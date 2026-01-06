<!-- routes/profile/components/tabs/FavoritesTab.svelte -->
<script lang="ts">
	import type { Favorite } from '$lib/types/profile';
	import { deleteProfile, emptyHeart } from '$lib/icons/svgs';
	import ProductCard from '../cards/ProductCard.svelte';

	interface Props {
		favorites: Favorite[];
		onRemove: (id: string) => Promise<boolean>;
		onClearAll: () => Promise<boolean>;
	}

	let { favorites, onRemove, onClearAll }: Props = $props();

	async function handleAddToCart(productId: string) {
		// 添加到购物车逻辑
		console.log('Add to cart:', productId);
	}
</script>

<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-xl font-semibold text-[#1a1a1a]">お気に入り商品</h2>
		{#if favorites.length > 0}
			<button class="btn-secondary" onclick={onClearAll}>
				{@html deleteProfile}
				<span>すべて削除</span>
			</button>
		{/if}
	</div>

	{#if favorites.length > 0}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each favorites as favorite}
				<ProductCard {favorite} {onRemove} onAddToCart={handleAddToCart} />
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<div class="mb-3 flex justify-center text-gray-300">
				{@html emptyHeart}
			</div>
			<p class="text-[#718096]">お気に入り商品がありません</p>
		</div>
	{/if}
</div>

<style>
	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #4a5568;
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background-color: #edf2f7;
		border-color: #cbd5e0;
	}
</style>
