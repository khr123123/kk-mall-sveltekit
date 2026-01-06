<!-- routes/profile/components/cards/ProductCard.svelte -->
<script lang="ts">
	import type { Favorite } from '$lib/types/profile';
	import { cart, close } from '$lib/icons/svgs';
	import { formatters } from '$lib/utils/formatters';

	interface Props {
		favorite: Favorite;
		onRemove: (id: string) => void;
		onAddToCart?: (productId: string) => void;
	}

	let { favorite, onRemove, onAddToCart }: Props = $props();

	function handleAddToCart() {
		if (onAddToCart && favorite.product_id) {
			onAddToCart(favorite.product_id);
		}
	}
</script>

<div class="product-card">
	<div class="product-card-image-wrapper">
		<img
			src={favorite.product_image || 'https://via.placeholder.com/200'}
			alt={favorite.product_name}
			class="product-card-image"
		/>
	</div>

	<div class="product-card-content">
		<h3 class="product-card-title">{favorite.product_name}</h3>
		<div class="product-card-price">{formatters.currency(favorite.product_price)}</div>
	</div>

	<div class="product-card-actions">
		<button class="product-card-cart-btn" onclick={handleAddToCart}>
			{@html cart}
			<span>カートに入れる</span>
		</button>
		<button
			class="product-card-remove-btn"
			onclick={() => onRemove(favorite.id)}
			title="お気に入りから削除"
		>
			{@html close}
		</button>
	</div>
</div>

<style>
	.product-card {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		background: white;
		transition: all 0.2s;
	}

	.product-card:hover {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border-color: #cbd5e0;
	}

	.product-card-image-wrapper {
		width: 100%;
		margin-bottom: 0.75rem;
		overflow: hidden;
		border-radius: 0.375rem;
	}

	.product-card-image {
		width: 100%;
		height: 10rem;
		object-fit: cover;
		border: 1px solid #e0e0e0;
		border-radius: 0.375rem;
		transition: transform 0.3s;
	}

	.product-card:hover .product-card-image {
		transform: scale(1.05);
	}

	.product-card-content {
		flex: 1;
		margin-bottom: 0.75rem;
	}

	.product-card-title {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		font-size: 0.875rem;
		font-weight: 600;
		color: #1a1a1a;
		line-height: 1.4;
		min-height: 2.4em;
		margin: 0 0 0.5rem 0;
	}

	.product-card-price {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	.product-card-actions {
		display: flex;
		gap: 0.5rem;
	}

	.product-card-cart-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.625rem 1rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: white;
		background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.product-card-cart-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px -2px rgba(45, 55, 72, 0.4);
	}

	.product-card-remove-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.625rem;
		color: #e53e3e;
		background: transparent;
		border: 1px solid #fc8181;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.product-card-remove-btn:hover {
		background: #fff5f5;
		border-color: #e53e3e;
	}

	:global(.product-card-cart-btn svg) {
		width: 1rem;
		height: 1rem;
	}

	:global(.product-card-remove-btn svg) {
		width: 1rem;
		height: 1rem;
	}
</style>
