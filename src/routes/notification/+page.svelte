<!-- Notification Center Page -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/userStore';
	import { notificationStore } from '$lib/stores/notificationStore';
	import {
		NotificationService,
		type Notification,
		type NotificationType
	} from '$lib/services/notificationService';
	import { toast } from '$lib/stores/toastStore';

	// State
	let notifications: Notification[] = [];
	let loading = true;
	let totalPages = 0;
	let totalItems = 0;
	let currentPage = 1;
	let unreadCount = 0;
	let activeFilter: 'all' | 'unread' | 'read' = 'all';
	let activeType: NotificationType | 'all' = 'all';
	let selectedDetail: Notification | null = null;
	let showDetailModal = false;

	// Subscribe to store
	$: user = $currentUser;
	$: storeState = $notificationStore;

	// Notification types for filter
	const notificationTypes: { value: NotificationType | 'all'; label: string }[] = [
		{ value: 'all', label: 'すべて' },
		{ value: 'order', label: '注文' },
		{ value: 'promotion', label: 'お知らせ' },
		{ value: 'system', label: 'システム' },
		{ value: 'payment', label: '支払い' },
		{ value: 'review', label: 'レビュー' },
		{ value: 'account', label: 'アカウント' }
	];

	async function loadNotifications() {
		if (!user) return;

		loading = true;
		try {
			const filter: { isRead?: boolean; type?: NotificationType } = {};

			if (activeFilter === 'unread') filter.isRead = false;
			if (activeFilter === 'read') filter.isRead = true;
			if (activeType !== 'all') filter.type = activeType;

			const result = await import('$lib/services/notificationService').then((m) =>
				m.notificationService.getNotifications(user!.id, currentPage, 15, filter)
			);

			notifications = result.items;
			totalPages = result.totalPages;
			totalItems = result.totalItems;

			// Update unread count
			const count = await import('$lib/services/notificationService').then((m) =>
				m.notificationService.getUnreadCount(user!.id)
			);
			unreadCount = count;
		} catch (error) {
			toast.error('通知の読み込みに失敗しました');
		} finally {
			loading = false;
		}
	}

	function setFilter(filter: 'all' | 'unread' | 'read') {
		activeFilter = filter;
		currentPage = 1;
		loadNotifications();
	}

	function setTypeFilter(type: NotificationType | 'all') {
		activeType = type;
		currentPage = 1;
		loadNotifications();
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		loadNotifications();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function handleMarkAsRead(notification: Notification) {
		if (notification.isRead) return;
		await notificationStore.markAsRead(notification.id);
		notifications = notifications.map((n) =>
			n.id === notification.id ? { ...n, isRead: true } : n
		);
		unreadCount = Math.max(0, unreadCount - 1);
	}

	async function handleMarkAllAsRead() {
		await notificationStore.markAllAsRead();
		notifications = notifications.map((n) => ({ ...n, isRead: true }));
		unreadCount = 0;
	}

	async function handleDelete(notificationId: string) {
		const notification = notifications.find((n) => n.id === notificationId);
		await notificationStore.deleteNotification(notificationId);
		notifications = notifications.filter((n) => n.id !== notificationId);
		totalItems = totalItems - 1;
		if (!notification?.isRead) {
			unreadCount = Math.max(0, unreadCount - 1);
		}

		// Close detail modal if we deleted the viewed notification
		if (selectedDetail?.id === notificationId) {
			showDetailModal = false;
			selectedDetail = null;
		}
	}

	function openDetail(notification: Notification) {
		selectedDetail = notification;
		showDetailModal = true;

		// Mark as read when opened
		if (!notification.isRead) {
			handleMarkAsRead(notification);
		}
	}

	function closeDetail() {
		showDetailModal = false;
		selectedDetail = null;
	}

	function handleNotificationClick(notification: Notification) {
		if (notification.link) {
			handleMarkAsRead(notification);
			goto(notification.link);
		} else {
			openDetail(notification);
		}
	}

	function formatTime(dateStr: string): string {
		return NotificationService.formatRelativeTime(dateStr);
	}

	function formatFullDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Generate page numbers for pagination
	function getPageNumbers(): number[] {
		const pages: number[] = [];
		const maxVisible = 5;
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		let end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	}

	onMount(() => {
		if (!user) {
			toast.warning('ログインが必要です');
			goto('/');
			return;
		}
		loadNotifications();
	});
</script>

<svelte:head>
	<title>通知センター - K. Portfolio</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<!-- Page header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">通知センター</h1>
					<p class="mt-1 text-sm text-gray-500">
						{totalItems}件の通知 ・ {unreadCount}件未読
					</p>
				</div>
				{#if unreadCount > 0}
					<button
						class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
						onclick={handleMarkAllAsRead}
					>
						すべて既読にする
					</button>
				{/if}
			</div>
		</div>

		<!-- Filters -->
		<div class="mb-6 space-y-4">
			<!-- Read/Unread filter -->
			<div class="flex flex-wrap gap-2">
				{#each [{ value: 'all', label: 'すべて' }, { value: 'unread', label: '未読' }, { value: 'read', label: '既読' }] as filter}
					<button
						class="rounded-full px-4 py-2 text-sm font-medium transition-colors {activeFilter ===
						filter.value
							? 'bg-gray-900 text-white'
							: 'bg-white text-gray-600 hover:bg-gray-100'}"
						onclick={() => setFilter(filter.value)}
					>
						{filter.label}
					</button>
				{/each}
			</div>

			<!-- Type filter -->
			<div class="flex flex-wrap gap-2">
				{#each notificationTypes as type}
					<button
						class="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors {activeType ===
						type.value
							? 'border-gray-900 bg-gray-900 text-white'
							: 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'}"
						onclick={() => setTypeFilter(type.value)}
					>
						{type.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Notification list -->
		{#if loading}
			<div class="flex justify-center py-16">
				<div
					class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"
				></div>
			</div>
		{:else if notifications.length === 0}
			<div class="rounded-xl bg-white px-6 py-16 text-center shadow-sm">
				<div
					class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"
				>
					<svg
						class="h-10 w-10 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
						/>
					</svg>
				</div>
				<h2 class="mb-2 text-lg font-semibold text-gray-900">通知はありません</h2>
				<p class="text-sm text-gray-500">新しい通知が届くとここに表示されます</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each notifications as notification (notification.id)}
					<div
						class="group rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-6 {!notification.isRead
							? 'border-blue-200 bg-blue-50/30'
							: 'border-gray-200'}"
					>
						<div class="flex gap-4">
							<!-- Icon -->
							<div class="shrink-0">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-full {!notification.isRead ? 'bg-blue-100' : 'bg-gray-100'}"
								>
									<img
										src={NotificationService.getTypeIcon(notification.type)}
										alt={notification.type}
										class="h-7 w-7"
									/>
								</div>
							</div>

							<!-- Content -->
							<div class="min-w-0 flex-1">
								<div class="mb-1 flex items-start justify-between gap-3">
									<div class="flex flex-wrap items-center gap-2">
										<span
											class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {NotificationService.getTypeColor(
												notification.type
											)}"
										>
											{NotificationService.getTypeLabel(notification.type)}
										</span>
										{#if !notification.isRead}
											<span class="h-2 w-2 rounded-full bg-blue-500"></span>
										{/if}
									</div>
									<span class="shrink-0 text-xs text-gray-500">
										{formatTime(notification.created)}
									</span>
								</div>

								<button
									class="mb-1 block text-left text-sm font-semibold text-gray-900 transition-colors hover:text-blue-600"
									onclick={() => handleNotificationClick(notification)}
								>
									{notification.title}
								</button>

								<p class="mb-3 line-clamp-2 text-sm text-gray-600">
									{notification.content}
								</p>

								<div class="flex flex-wrap items-center gap-2">
									{#if !notification.isRead}
										<button
											class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
											onclick={() => handleMarkAsRead(notification)}
										>
											既読にする
										</button>
									{/if}
									<button
										class="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
										onclick={() => openDetail(notification)}
									>
										詳細を見る
									</button>
									<button
										class="rounded-full px-3 py-1 text-xs font-medium text-red-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50"
										onclick={() => handleDelete(notification.id)}
									>
										削除
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="mt-8 flex items-center justify-center gap-2">
					<button
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={currentPage <= 1}
						onclick={() => goToPage(currentPage - 1)}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					{#each getPageNumbers() as page}
						<button
							class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {currentPage ===
							page
								? 'bg-gray-900 text-white'
								: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
							onclick={() => goToPage(page)}
						>
							{page}
						</button>
					{/each}

					<button
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={currentPage >= totalPages}
						onclick={() => goToPage(currentPage + 1)}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Detail Modal -->
{#if showDetailModal && selectedDetail}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		onclick={closeDetail}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Modal header -->
			<div class="border-b border-gray-100 px-6 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
							<img
								src={NotificationService.getTypeIcon(selectedDetail.type)}
								alt={selectedDetail.type}
								class="h-6 w-6"
							/>
						</div>
						<div>
							<span
								class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {NotificationService.getTypeColor(
									selectedDetail.type
								)}"
							>
								{NotificationService.getTypeLabel(selectedDetail.type)}
							</span>
						</div>
					</div>
					<button
						class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
						onclick={closeDetail}
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Modal body -->
			<div class="px-6 py-5">
				<h2 class="mb-2 text-lg font-bold text-gray-900">{selectedDetail.title}</h2>
				<p class="mb-4 text-xs text-gray-500">{formatFullDate(selectedDetail.created)}</p>
				<div class="prose prose-sm max-w-none text-gray-700">
					<p class="whitespace-pre-wrap">{selectedDetail.content}</p>
				</div>

				{#if selectedDetail.link}
					<div class="mt-4">
						<a
							href={selectedDetail.link}
							class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
						>
							関連ページを見る
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
						</a>
					</div>
				{/if}
			</div>

			<!-- Modal footer -->
			<div class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
				<button
					class="text-sm text-red-500 transition-colors hover:text-red-700"
					onclick={() => handleDelete(selectedDetail.id)}
				>
					この通知を削除
				</button>
				<button
					class="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
					onclick={closeDetail}
				>
					閉じる
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
