// lib/stores/dialogStore.ts
import { writable } from 'svelte/store';

interface ConfirmOptions {
	title: string;
	message: string;
	type?: 'warning' | 'danger' | 'info';
	confirmText?: string;
	cancelText?: string;
}

interface AlertOptions {
	title: string;
	message: string;
	type?: 'error' | 'success' | 'info';
}

interface ConfirmDialogState extends ConfirmOptions {
	show: boolean;
	type: 'warning' | 'danger' | 'info';
	confirmText: string;
	cancelText: string;
	resolve?: (value: boolean) => void;
}

interface AlertDialogState extends AlertOptions {
	show: boolean;
	type: 'error' | 'success' | 'info';
}

function createDialogStore() {
	const confirmDialog = writable<ConfirmDialogState | null>(null);
	const alertDialog = writable<AlertDialogState | null>(null);

	return {
		confirmDialog: {
			subscribe: confirmDialog.subscribe,
			show: (options: ConfirmOptions): Promise<boolean> => {
				return new Promise((resolve) => {
					confirmDialog.set({
						...options,
						show: true,
						type: options.type || 'warning',
						confirmText: options.confirmText || '確認',
						cancelText: options.cancelText || 'キャンセル',
						resolve
					});
				});
			},
			hide: () => confirmDialog.set(null),
			confirm: () => {
				confirmDialog.update((state) => {
					if (state?.resolve) {
						state.resolve(true);
					}
					return null;
				});
			},
			cancel: () => {
				confirmDialog.update((state) => {
					if (state?.resolve) {
						state.resolve(false);
					}
					return null;
				});
			}
		},
		alertDialog: {
			subscribe: alertDialog.subscribe,
			show: (options: AlertOptions) => {
				alertDialog.set({
					...options,
					show: true,
					type: options.type || 'error'
				});
			},
			hide: () => alertDialog.set(null)
		}
	};
}

export const dialogStore = createDialogStore();
