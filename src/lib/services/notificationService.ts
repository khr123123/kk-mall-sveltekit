// Notification Service - PocketBase API wrapper for notifications
import { pb } from '$lib/services/PBConfig';
import type { RecordModel } from 'pocketbase';

export type NotificationType = 'order' | 'promotion' | 'system' | 'payment' | 'review' | 'account';

export interface Notification extends RecordModel {
	userId: string;
	title: string;
	content: string;
	type: NotificationType;
	isRead: boolean;
	link: string;
	extra: Record<string, any> | null;
	created: string;
	updated: string;
}

export interface NotificationListResult {
	items: Notification[];
	totalItems: number;
	totalPages: number;
	page: number;
}

export class NotificationService {
	/**
	 * Get paginated notifications for a user
	 */
	async getNotifications(
		userId: string,
		page: number = 1,
		perPage: number = 20,
		filter?: { isRead?: boolean; type?: NotificationType }
	): Promise<NotificationListResult> {
		try {
			const filterParts: string[] = [`userId = "${userId}"`];

			if (filter?.isRead !== undefined) {
				filterParts.push(`isRead = ${filter.isRead}`);
			}

			if (filter?.type) {
				filterParts.push(`type = "${filter.type}"`);
			}

			const result = await pb.collection('notifications').getList<Notification>(page, perPage, {
				filter: filterParts.join(' && '),
				sort: '-created'
			});

			return {
				items: result.items,
				totalItems: result.totalItems,
				totalPages: result.totalPages,
				page: result.page
			};
		} catch (error: any) {
			console.error('Failed to fetch notifications:', error);
			return {
				items: [],
				totalItems: 0,
				totalPages: 0,
				page: 1
			};
		}
	}

	/**
	 * Get unread notification count for a user
	 */
	async getUnreadCount(userId: string): Promise<number> {
		try {
			const result = await pb.collection('notifications').getList<Notification>(1, 1, {
				filter: `userId = "${userId}" && isRead = false`
			});
			return result.totalItems;
		} catch (error: any) {
			console.error('Failed to get unread count:', error);
			return 0;
		}
	}

	/**
	 * Get latest unread notifications (for dropdown)
	 */
	async getLatestUnread(userId: string, limit: number = 5): Promise<Notification[]> {
		try {
			const result = await pb.collection('notifications').getList<Notification>(1, limit, {
				filter: `userId = "${userId}" && isRead = false`,
				sort: '-created'
			});
			return result.items;
		} catch (error: any) {
			console.error('Failed to get latest unread:', error);
			return [];
		}
	}

	/**
	 * Mark a single notification as read
	 */
	async markAsRead(notificationId: string): Promise<boolean> {
		try {
			await pb.collection('notifications').update(notificationId, {
				isRead: true
			});
			return true;
		} catch (error: any) {
			console.error('Failed to mark notification as read:', error);
			return false;
		}
	}

	/**
	 * Mark all notifications as read for a user
	 */
	async markAllAsRead(userId: string): Promise<boolean> {
		try {
			const unreadList = await pb.collection('notifications').getFullList<Notification>({
				filter: `userId = "${userId}" && isRead = false`
			});

			await Promise.all(
				unreadList.map((n) =>
					pb.collection('notifications').update(n.id, { isRead: true })
				)
			);

			return true;
		} catch (error: any) {
			console.error('Failed to mark all as read:', error);
			return false;
		}
	}

	/**
	 * Delete a notification
	 */
	async deleteNotification(notificationId: string): Promise<boolean> {
		try {
			await pb.collection('notifications').delete(notificationId);
			return true;
		} catch (error: any) {
			console.error('Failed to delete notification:', error);
			return false;
		}
	}

	/**
	 * Get a single notification by ID
	 */
	async getNotificationById(notificationId: string): Promise<Notification | null> {
		try {
			const record = await pb.collection('notifications').getOne<Notification>(notificationId);
			return record;
		} catch (error: any) {
			console.error('Failed to get notification:', error);
			return null;
		}
	}

	/**
	 * Get relative time string (Japanese)
	 */
	static formatRelativeTime(dateStr: string): string {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHour / 24);

		if (diffSec < 60) return 'たった今';
		if (diffMin < 60) return `${diffMin}分前`;
		if (diffHour < 24) return `${diffHour}時間前`;
		if (diffDay < 7) return `${diffDay}日前`;
		if (diffDay < 30) return `${Math.floor(diffDay / 7)}週間前`;
		return date.toLocaleDateString('ja-JP');
	}

	/**
	 * Get icon for notification type
	 */
	static getTypeIcon(type: NotificationType): string {
		const icons: Record<NotificationType, string> = {
			order: '/logo.png',
			promotion: '/svgs/notification.svg',
			system: '/svgs/system.svg',
			payment: '/svgs/orders.svg',
			review: '/svgs/heart.svg',
			account: '/svgs/user.svg'
		};
		return icons[type] || '/svgs/system.svg';
	}

	/**
	 * Get label for notification type (Japanese)
	 */
	static getTypeLabel(type: NotificationType): string {
		const labels: Record<NotificationType, string> = {
			order: '注文',
			promotion: 'お知らせ',
			system: 'システム',
			payment: '支払い',
			review: 'レビュー',
			account: 'アカウント'
		};
		return labels[type] || type;
	}

	/**
	 * Get color classes for notification type
	 */
	static getTypeColor(type: NotificationType): string {
		const colors: Record<NotificationType, string> = {
			order: 'bg-blue-100 text-blue-800',
			promotion: 'bg-purple-100 text-purple-800',
			system: 'bg-green-100 text-green-800',
			payment: 'bg-amber-100 text-amber-800',
			review: 'bg-pink-100 text-pink-800',
			account: 'bg-gray-100 text-gray-800'
		};
		return colors[type] || 'bg-gray-100 text-gray-800';
	}
}

export const notificationService = new NotificationService();
export default notificationService;
