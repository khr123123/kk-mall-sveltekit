// Notification Store - manages notification state and polling
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { notificationService, type Notification, type NotificationType } from '$lib/services/notificationService';
import { toast } from '$lib/stores/toastStore';

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	totalItems: number;
	totalPages: number;
	currentPage: number;
	loading: boolean;
	error: string | null;
	lastCheckedAt: number;
}

function createNotificationStore() {
	const { subscribe, set, update } = writable<NotificationState>({
		notifications: [],
		unreadCount: 0,
		totalItems: 0,
		totalPages: 0,
		currentPage: 1,
		loading: false,
		error: null,
		lastCheckedAt: 0
	});

	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	let currentUserId: string | null = null;

	/**
	 * Initialize the store for a user and start polling
	 */
	async function init(userId: string) {
		currentUserId = userId;
		await refresh();
		startPolling();
	}

	/**
	 * Refresh notifications and unread count
	 */
	async function refresh() {
		if (!currentUserId) return;

		update((s) => ({ ...s, loading: true, error: null }));

		try {
			const [countResult, listResult] = await Promise.all([
				notificationService.getUnreadCount(currentUserId),
				notificationService.getNotifications(currentUserId, 1, 20)
			]);

			update((s) => ({
				...s,
				unreadCount: countResult,
				notifications: listResult.items,
				totalItems: listResult.totalItems,
				totalPages: listResult.totalPages,
				currentPage: 1,
				loading: false,
				lastCheckedAt: Date.now()
			}));
		} catch (error: any) {
			update((s) => ({
				...s,
				loading: false,
				error: error.message || 'Failed to load notifications'
			}));
		}
	}

	/**
	 * Load a specific page of notifications
	 */
	async function loadPage(page: number, filter?: { isRead?: boolean; type?: NotificationType }) {
		if (!currentUserId) return;

		update((s) => ({ ...s, loading: true }));

		try {
			const result = await notificationService.getNotifications(currentUserId, page, 20, filter);

			update((s) => ({
				...s,
				notifications: result.items,
				totalItems: result.totalItems,
				totalPages: result.totalPages,
				currentPage: page,
				loading: false
			}));
		} catch (error: any) {
			update((s) => ({ ...s, loading: false, error: error.message }));
		}
	}

	/**
	 * Check for new notifications (used by polling)
	 */
	async function checkNew() {
		if (!currentUserId) return;

		try {
			const state = get({ subscribe });
			const previousCount = state.unreadCount;
			const newCount = await notificationService.getUnreadCount(currentUserId);

			if (newCount > previousCount) {
				// New notifications arrived - show toast
				const diff = newCount - previousCount;
				toast.info(`${diff}件の新しい通知があります`);

				// Refresh the full list
				await refresh();
			} else {
				update((s) => ({ ...s, unreadCount: newCount }));
			}
		} catch (error) {
			// Silent failure for polling
			console.warn('Notification poll failed:', error);
		}
	}

	/**
	 * Start polling for new notifications (every 30 seconds)
	 */
	function startPolling() {
		stopPolling();
		if (browser) {
			pollingInterval = setInterval(checkNew, 30000);
		}
	}

	/**
	 * Stop polling
	 */
	function stopPolling() {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
	}

	/**
	 * Mark a single notification as read
	 */
	async function markAsRead(notificationId: string) {
		const success = await notificationService.markAsRead(notificationId);
		if (success) {
			update((s) => ({
				...s,
				notifications: s.notifications.map((n) =>
					n.id === notificationId ? { ...n, isRead: true } : n
				),
				unreadCount: Math.max(0, s.unreadCount - 1)
			}));
		}
		return success;
	}

	/**
	 * Mark all notifications as read
	 */
	async function markAllAsRead() {
		if (!currentUserId) return false;

		const success = await notificationService.markAllAsRead(currentUserId);
		if (success) {
			update((s) => ({
				...s,
				notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
				unreadCount: 0
			}));
			toast.success('すべての通知を既読にしました');
		} else {
			toast.error('既読処理に失敗しました');
		}
		return success;
	}

	/**
	 * Delete a notification
	 */
	async function deleteNotification(notificationId: string) {
		const state = get({ subscribe });
		const notification = state.notifications.find((n) => n.id === notificationId);

		const success = await notificationService.deleteNotification(notificationId);
		if (success) {
			update((s) => ({
				...s,
				notifications: s.notifications.filter((n) => n.id !== notificationId),
				totalItems: s.totalItems - 1,
				unreadCount: notification && !notification.isRead ? s.unreadCount - 1 : s.unreadCount
			}));
			toast.success('通知を削除しました');
		} else {
			toast.error('通知の削除に失敗しました');
		}
		return success;
	}

	/**
	 * Destroy store (cleanup)
	 */
	function destroy() {
		stopPolling();
		currentUserId = null;
		set({
			notifications: [],
			unreadCount: 0,
			totalItems: 0,
			totalPages: 0,
			currentPage: 1,
			loading: false,
			error: null,
			lastCheckedAt: 0
		});
	}

	return {
		subscribe,
		init,
		refresh,
		loadPage,
		checkNew,
		startPolling,
		stopPolling,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		destroy
	};
}

export const notificationStore = createNotificationStore();

// Derived stores for convenience
export const unreadCount = derived(notificationStore, ($s) => $s.unreadCount);
export const notifications = derived(notificationStore, ($s) => $s.notifications);
export const notificationLoading = derived(notificationStore, ($s) => $s.loading);
