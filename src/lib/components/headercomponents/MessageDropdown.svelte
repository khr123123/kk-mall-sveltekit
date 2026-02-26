<!-- MessageDropdown.svelte - Real notification data from PocketBase -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { notificationStore, unreadCount } from '$lib/stores/notificationStore';
	import { NotificationService, type Notification } from '$lib/services/notificationService';
	import { currentUser } from '$lib/stores/userStore';

	let isOpen = false;
	let dropdownElement: HTMLElement;
	let isBrowser = false;
	let latestNotifications: Notification[] = [];
	let displayCount = 0;

	// Subscribe to stores
	$: user = $currentUser;
	$: displayCount = $unreadCount;

	// Get latest 5 notifications for dropdown
	$: if (user && isOpen) {
		loadLatest();
	}

	async function loadLatest() {
		if (!user) return;
		const result = await import('$lib/services/notificationService').then((m) =>
			m.notificationService.getLatestUnread(user!.id, 5)
		);
		latestNotifications = result;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen && user) {
			loadLatest();
		}
	}

	function closeDropdown() {
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
			closeDropdown();
		}
	}

	async function markAsRead(notificationId: string) {
		await notificationStore.markAsRead(notificationId);
		latestNotifications = latestNotifications.map((n) =>
			n.id === notificationId ? { ...n, isRead: true } : n
		);
	}

	async function markAllAsRead() {
		await notificationStore.markAllAsRead();
		latestNotifications = latestNotifications.map((n) => ({ ...n, isRead: true }));
	}

	async function deleteMessage(notificationId: string) {
		await notificationStore.deleteNotification(notificationId);
		latestNotifications = latestNotifications.filter((n) => n.id !== notificationId);
	}

	function goToNotification(notification: Notification) {
		// Mark as read
		if (!notification.isRead) {
			markAsRead(notification.id);
		}

		closeDropdown();

		// Navigate to link or notification center
		if (notification.link) {
			goto(notification.link);
		} else {
			goto('/notification');
		}
	}

	function goToAllNotifications() {
		closeDropdown();
		goto('/notification');
	}

	function getTypeColor(type: string): string {
		return NotificationService.getTypeColor(type as any);
	}

	function getTypeLabel(type: string): string {
		return NotificationService.getTypeLabel(type as any);
	}

	function getTypeIcon(type: string): string {
		return NotificationService.getTypeIcon(type as any);
	}

	function formatTime(dateStr: string): string {
		return NotificationService.formatRelativeTime(dateStr);
	}

	onMount(() => {
		isBrowser = typeof window !== 'undefined';

		if (isBrowser) {
			document.addEventListener('click', handleClickOutside);
		}

		// Initialize notification store when user is available
		if (user) {
			notificationStore.init(user.id);
		}
	});

	onDestroy(() => {
		if (isBrowser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});

	// Re-initialize when user changes
	$: if (user) {
		notificationStore.init(user.id);
	} else {
		notificationStore.destroy();
	}
</script>

<div class="relative" bind:this={dropdownElement}>
	<!-- Message button -->
	<button
		class="relative cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
		onclick={toggleDropdown}
		aria-label="Notification"
		aria-expanded={isOpen}
	>
		<img src="/svgs/mail.svg" alt="message" class="h-5 w-5" />
		{#if displayCount > 0}
			<span
				class="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white"
				aria-label="{displayCount} unread"
			>
				{displayCount > 99 ? '99+' : displayCount}
			</span>
		{/if}
	</button>

	<!-- Dropdown panel -->
	{#if isOpen && isBrowser}
		<div
			class="absolute top-full right-0 z-50 mt-2 w-96 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all"
			style="animation: scaleIn 0.2s ease-out;"
		>
			<!-- Header -->
			<div class="border-b border-gray-100 px-6 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<h3 class="text-lg font-semibold text-gray-900">通知</h3>
						{#if displayCount > 0}
							<span class="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
								{displayCount}件未読
							</span>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						{#if displayCount > 0}
							<button
								class="rounded-full px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
								onclick={markAllAsRead}
							>
								すべて既読
							</button>
						{/if}
						<button
							class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
							onclick={closeDropdown}
							aria-label="Close"
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
			</div>

			<!-- Notification list -->
			<div class="max-h-[32rem] overflow-y-auto">
				{#if !user}
					<div class="flex flex-col items-center justify-center py-12">
						<p class="text-sm text-gray-500">ログインして通知を確認してください</p>
					</div>
				{:else if latestNotifications.length === 0}
					<div class="flex flex-col items-center justify-center py-12">
						<div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
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
									d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
								/>
							</svg>
						</div>
						<p class="mb-1 text-sm font-medium text-gray-900">未読の通知はありません</p>
						<p class="text-sm text-gray-500">新しい通知が届くとここに表示されます</p>
					</div>
				{:else}
					<div class="divide-y divide-gray-100">
						{#each latestNotifications as notification (notification.id)}
							<div
								class="group px-6 py-4 transition-colors hover:bg-gray-50"
								role="button"
								tabindex="0"
								onclick={() => goToNotification(notification)}
								onkeydown={(e) => e.key === 'Enter' && goToNotification(notification)}
							>
								<div class="flex gap-4">
									<!-- Icon -->
									<div class="flex shrink-0 flex-col items-center">
										<div
											class="flex h-12 w-12 items-center justify-center rounded-full text-xl {!notification.isRead ? 'bg-blue-50' : 'bg-gray-100'}"
										>
											<img
												src={getTypeIcon(notification.type)}
												alt={notification.type}
												class="h-7 w-7"
											/>
										</div>
										<div class="mt-2">
											<span
												class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {getTypeColor(notification.type)}"
											>
												{getTypeLabel(notification.type)}
											</span>
										</div>
									</div>

									<!-- Content -->
									<div class="min-w-0 flex-1">
										<div class="mb-2 flex items-start justify-between">
											<div class="flex items-center gap-2">
												<h4
													class="text-sm font-semibold {!notification.isRead ? 'text-gray-900' : 'text-gray-700'}"
												>
													{notification.title}
												</h4>
												{#if !notification.isRead}
													<span class="h-2 w-2 rounded-full bg-blue-500"></span>
												{/if}
											</div>
											<button
												class="ml-2 shrink-0 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
												onclick={(e) => { e.stopPropagation(); deleteMessage(notification.id); }}
												aria-label="Delete notification"
											>
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</div>
										<p class="mb-3 line-clamp-2 text-sm text-gray-600 group-hover:text-gray-900">
											{notification.content}
										</p>
										<div class="flex items-center justify-between">
											<span class="text-xs text-gray-500">
												{formatTime(notification.created)}
											</span>
											<div class="flex gap-2">
												{#if !notification.isRead}
													<button
														class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
														onclick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
													>
														既読にする
													</button>
												{/if}
											</div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="border-t border-gray-100 bg-gray-50 px-6 py-4">
				<button
					class="block w-full rounded-lg bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
					onclick={goToAllNotifications}
				>
					すべての通知を見る
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.max-h-\[32rem\]::-webkit-scrollbar {
		width: 8px;
	}

	.max-h-\[32rem\]::-webkit-scrollbar-track {
		background: #f8fafc;
		border-radius: 4px;
	}

	.max-h-\[32rem\]::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 4px;
		border: 2px solid #f8fafc;
	}

	.max-h-\[32rem\]::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>
