<!-- Toast.svelte - Global Toast Notification Component -->
<script lang="ts">
	import { toastStore, type ToastItem } from '$lib/stores/toastStore';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let toasts: ToastItem[] = [];
	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		unsubscribe = toastStore.subscribe((state) => {
			toasts = state.toasts;
		});

		return () => {
			if (unsubscribe) unsubscribe();
		};
	});

	function getIcon(type: string): string {
		switch (type) {
			case 'success':
				return `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
			case 'error':
				return `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
			case 'warning':
				return `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>`;
			case 'info':
				return `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
			default:
				return '';
		}
	}

	function getStyles(type: string) {
		switch (type) {
			case 'success':
				return {
					bg: 'bg-emerald-50 border-emerald-200',
					icon: 'text-emerald-500 bg-emerald-100',
					text: 'text-emerald-800',
					close: 'text-emerald-400 hover:text-emerald-600',
					bar: 'bg-emerald-500'
				};
			case 'error':
				return {
					bg: 'bg-red-50 border-red-200',
					icon: 'text-red-500 bg-red-100',
					text: 'text-red-800',
					close: 'text-red-400 hover:text-red-600',
					bar: 'bg-red-500'
				};
			case 'warning':
				return {
					bg: 'bg-amber-50 border-amber-200',
					icon: 'text-amber-500 bg-amber-100',
					text: 'text-amber-800',
					close: 'text-amber-400 hover:text-amber-600',
					bar: 'bg-amber-500'
				};
			case 'info':
				return {
					bg: 'bg-blue-50 border-blue-200',
					icon: 'text-blue-500 bg-blue-100',
					text: 'text-blue-800',
					close: 'text-blue-400 hover:text-blue-600',
					bar: 'bg-blue-500'
				};
			default:
				return {
					bg: 'bg-gray-50 border-gray-200',
					icon: 'text-gray-500 bg-gray-100',
					text: 'text-gray-800',
					close: 'text-gray-400 hover:text-gray-600',
					bar: 'bg-gray-500'
				};
		}
	}
</script>

{#if browser}
	<div
		class="toast-container fixed top-0 left-1/2 z-[9999] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-3 px-4 pt-4"
		aria-live="polite"
		aria-atomic="true"
	>
		{#each toasts as toast (toast.id)}
			{@const styles = getStyles(toast.type)}
			<div
				class="toast-item w-full overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm {styles.bg}"
				role="alert"
			>
				<div class="flex items-start gap-3 px-4 py-3">
					<!-- Icon -->
					<div class="flex shrink-0 items-center justify-center rounded-full p-1 {styles.icon}">
						{@html getIcon(toast.type)}
					</div>

					<!-- Message -->
					<div class="min-w-0 flex-1 pt-0.5">
						<p class="text-sm font-medium {styles.text}">{toast.message}</p>
					</div>

					<!-- Close button -->
					{#if toast.dismissible}
						<button
							class="shrink-0 rounded-lg p-1 transition-colors {styles.close}"
							onclick={() => toastStore.dismiss(toast.id)}
							aria-label="Close notification"
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
					{/if}
				</div>

				<!-- Progress bar -->
				{#if toast.duration > 0}
					<div class="h-1 w-full bg-black/5">
						<div
							class="toast-progress h-full {styles.bar}"
							style="animation-duration: {toast.duration}ms"
						></div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	/* Slide-in animation from top */
	.toast-item {
		animation: toastSlideIn 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
	}

	@keyframes toastSlideIn {
		from {
			opacity: 0;
			transform: translateY(-100%) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Progress bar shrink animation */
	.toast-progress {
		animation: toastProgress linear forwards;
		transform-origin: left;
	}

	@keyframes toastProgress {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}

	/* Container stacking */
	.toast-container {
		pointer-events: none;
	}

	.toast-item {
		pointer-events: auto;
	}
</style>
