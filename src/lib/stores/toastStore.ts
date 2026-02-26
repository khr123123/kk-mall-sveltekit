// Toast Store - Global toast notification system
import { writable, derived } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
	duration: number;
	dismissible: boolean;
	timestamp: number;
}

interface ToastState {
	toasts: ToastItem[];
}

function createToastStore() {
	const { subscribe, update } = writable<ToastState>({
		toasts: []
	});

	let counter = 0;

	function addToast(
		type: ToastType,
		message: string,
		options: { duration?: number; dismissible?: boolean } = {}
	): string {
		const id = `toast-${++counter}-${Date.now()}`;
		const duration = options.duration ?? 3000;
		const dismissible = options.dismissible ?? true;

		const toast: ToastItem = {
			id,
			type,
			message,
			duration,
			dismissible,
			timestamp: Date.now()
		};

		update((state) => ({
			toasts: [...state.toasts, toast]
		}));

		// Auto-dismiss after duration
		if (duration > 0) {
			setTimeout(() => {
				dismiss(id);
			}, duration);
		}

		return id;
	}

	function dismiss(id: string) {
		update((state) => ({
			toasts: state.toasts.filter((t) => t.id !== id)
		}));
	}

	function dismissAll() {
		update(() => ({ toasts: [] }));
	}

	return {
		subscribe,
		dismiss,
		dismissAll,
		success: (message: string, options?: { duration?: number; dismissible?: boolean }) =>
			addToast('success', message, options ?? {}),
		error: (message: string, options?: { duration?: number; dismissible?: boolean }) =>
			addToast('error', message, { duration: 5000, ...options }),
		warning: (message: string, options?: { duration?: number; dismissible?: boolean }) =>
			addToast('warning', message, { duration: 4000, ...options }),
		info: (message: string, options?: { duration?: number; dismissible?: boolean }) =>
			addToast('info', message, options ?? {})
	};
}

export const toastStore = createToastStore();

/**
 * Global Toast API - can be used anywhere (components, services, interceptors)
 *
 * Usage:
 *   import { toast } from '$lib/stores/toastStore';
 *   toast.success('Saved!');
 *   toast.error('Failed!');
 *   toast.warning('Warning!');
 *   toast.info('Info');
 */
export const toast = {
	success: toastStore.success,
	error: toastStore.error,
	warning: toastStore.warning,
	info: toastStore.info,
	dismiss: toastStore.dismiss,
	dismissAll: toastStore.dismissAll
};

export default toast;
