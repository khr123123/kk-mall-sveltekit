<!-- routes/profile/components/dialogs/ConfirmDialog.svelte -->
<script lang="ts">
	import { dialogStore } from '$lib/stores/dialogStore';
	import { warningIcon, infoIcon, cancelIcon } from '$lib/icons/svgs';

	let dialog = $state<any>(null);

	$effect(() => {
		const unsubscribe = dialogStore.confirmDialog.subscribe((value) => {
			dialog = value;
		});
		return unsubscribe;
	});

	function handleConfirm() {
		dialogStore.confirmDialog.confirm();
	}

	function handleCancel() {
		dialogStore.confirmDialog.cancel();
	}
</script>

{#if dialog?.show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="confirm-dialog-overlay" onclick={handleCancel}>
		<div class="confirm-dialog-content {dialog.type}" onclick={(e) => e.stopPropagation()}>
			<div class="confirm-dialog-header">
				<div class="confirm-dialog-icon">
					{#if dialog.type === 'danger'}
						{@html cancelIcon}
					{:else if dialog.type === 'warning'}
						{@html warningIcon}
					{:else}
						{@html infoIcon}
					{/if}
				</div>
				<h3 class="confirm-dialog-title">{dialog.title}</h3>
			</div>
			<p class="confirm-dialog-message">{dialog.message}</p>
			<div class="confirm-dialog-actions">
				<button class="confirm-btn-cancel" onclick={handleCancel}>
					{dialog.cancelText}
				</button>
				<button class="confirm-btn-confirm" onclick={handleConfirm}>
					{dialog.confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.confirm-dialog-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 60;
		animation: fadeIn 0.2s ease-out;
	}

	.confirm-dialog-content {
		background: white;
		border-radius: 0.75rem;
		padding: 1.5rem;
		max-width: 420px;
		width: 100%;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
		animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.confirm-dialog-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.confirm-dialog-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 9999px;
	}

	.confirm-dialog-content.warning .confirm-dialog-icon {
		background: #fef3c7;
		color: #f59e0b;
	}

	.confirm-dialog-content.danger .confirm-dialog-icon {
		background: #fee2e2;
		color: #ef4444;
	}

	.confirm-dialog-content.info .confirm-dialog-icon {
		background: #dbeafe;
		color: #3b82f6;
	}

	.confirm-dialog-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1a1a1a;
		text-align: center;
	}

	.confirm-dialog-message {
		color: #4a5568;
		text-align: center;
		line-height: 1.6;
		margin-bottom: 1.5rem;
		white-space: pre-line;
	}

	.confirm-dialog-actions {
		display: flex;
		gap: 0.75rem;
	}

	.confirm-btn-cancel {
		flex: 1;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #4a5568;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.confirm-btn-cancel:hover {
		background: #f7fafc;
		border-color: #cbd5e0;
	}

	.confirm-btn-confirm {
		flex: 1;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: white;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.confirm-dialog-content.warning .confirm-btn-confirm {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	}

	.confirm-dialog-content.danger .confirm-btn-confirm {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	}

	.confirm-dialog-content.info .confirm-btn-confirm {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	}

	.confirm-btn-confirm:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.2);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleUp {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	:global(.confirm-dialog-icon svg) {
		width: 1.75rem;
		height: 1.75rem;
	}
</style>
