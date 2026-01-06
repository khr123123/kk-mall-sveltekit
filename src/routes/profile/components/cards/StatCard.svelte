<!-- routes/profile/components/cards/StatCard.svelte -->
<script lang="ts">
	interface Props {
		value: number | string;
		label: string;
		icon?: string;
	}

	let { value, label, icon }: Props = $props();
</script>

<div class="stat-card">
	{#if icon}
		<div class="stat-card-icon">
			{@html icon}
		</div>
	{/if}
	<div class="stat-card-value">{value}</div>
	<div class="stat-card-label">{label}</div>
</div>

<style>
	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.stat-card:hover {
		border-color: #cbd5e0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		transform: translateY(-2px);
	}

	.stat-card-icon {
		margin-bottom: 0.5rem;
		color: #4a5568;
	}

	.stat-card-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: #1a1a1a;
		line-height: 1;
		margin-bottom: 0.375rem;
	}

	.stat-card-label {
		font-size: 0.875rem;
		color: #718096;
		text-align: center;
	}

	:global(.stat-card-icon svg) {
		width: 1.5rem;
		height: 1.5rem;
	}
</style>
