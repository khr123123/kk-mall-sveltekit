<!-- MessageDropdown.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let messages: Array<{
		id: number;
		type: string;
		title: string;
		content: string;
		time: string;
		read: boolean;
		icon: string;
	}> = [];

	export let unreadCount = 0;

	let isOpen = false;
	let dropdownElement: HTMLElement;
	let isBrowser = false;

	// 模拟消息数据
	const mockMessages = [
		{
			id: 1,
			type: 'order',
			title: '注文が発送されました',
			content: 'ご注文の商品#12345が発送されました。お届けまでもうしばらくお待ちください。',
			time: '2時間前',
			read: false,
			icon: '📦'
		},
		{
			id: 2,
			type: 'promotion',
			title: '限定セール開始',
			content: '週末限定！全商品20%オフセール開催中です。',
			time: '5時間前',
			read: false,
			icon: '🎉'
		},
		{
			id: 3,
			type: 'system',
			title: 'ポイント付与のお知らせ',
			content: '500ポイントが付与されました。次回のお買い物でご利用いただけます。',
			time: '1日前',
			read: true,
			icon: '💎'
		},
		{
			id: 4,
			type: 'order',
			title: 'レビュー依頼',
			content: '購入された商品のレビューをお待ちしています。',
			time: '2日前',
			read: true,
			icon: '⭐'
		},
		{
			id: 5,
			type: 'system',
			title: 'アカウント更新',
			content: 'プロフィール情報が正常に更新されました。',
			time: '3日前',
			read: true,
			icon: '✓'
		}
	];

	// 使用模拟数据或传入的数据
	$: displayMessages = messages.length > 0 ? messages : mockMessages;
	$: unreadMessages = displayMessages.filter((m) => !m.read).length;
	$: displayCount = unreadCount > 0 ? unreadCount : unreadMessages;

	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen) {
			dispatch('open');
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

	function markAsRead(messageId: number) {
		displayMessages = displayMessages.map((msg) =>
			msg.id === messageId ? { ...msg, read: true } : msg
		);
		dispatch('markRead', messageId);
	}

	function markAllAsRead() {
		displayMessages = displayMessages.map((msg) => ({ ...msg, read: true }));
		dispatch('markAllRead');
	}

	function deleteMessage(messageId: number) {
		displayMessages = displayMessages.filter((msg) => msg.id !== messageId);
		dispatch('delete', messageId);
	}

	function goToMessage(messageId: number) {
		dispatch('messageClick', messageId);
		closeDropdown();
	}

	function getTypeColor(type: string): string {
		const colors = {
			order: 'bg-blue-100 text-blue-800',
			promotion: 'bg-purple-100 text-purple-800',
			system: 'bg-green-100 text-green-800'
		};
		return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
	}

	function getTypeLabel(type: string): string {
		const labels = {
			order: '注文',
			promotion: 'お知らせ',
			system: 'システム'
		};
		return labels[type as keyof typeof labels] || type;
	}

	onMount(() => {
		isBrowser = typeof window !== 'undefined';

		if (isBrowser) {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (isBrowser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="relative" bind:this={dropdownElement}>
	<!-- 消息按钮 -->
	<button
		class="cursor-pointer relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
		on:click={toggleDropdown}
		aria-label="メッセージ"
		aria-expanded={isOpen}
	>
		<img src="/svgs/mail.svg" alt="message" class="h-5 w-5" />
		{#if displayCount > 0}
			<span
				class="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white"
				aria-label="{displayCount}件の未読メッセージ"
			>
				{displayCount > 99 ? '99+' : displayCount}
			</span>
		{/if}
	</button>

	<!-- 下拉面板 -->
	{#if isOpen && isBrowser}
		<div
			class="absolute top-full right-0 z-50 mt-2 w-96 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all"
			style="animation: scaleIn 0.2s ease-out;"
		>
			<!-- 头部 -->
			<div class="border-b border-gray-100 px-6 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<h3 class="text-lg font-semibold text-gray-900">メッセージ</h3>
						{#if displayCount > 0}
							<span class="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
								{displayCount}件未読
							</span>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						{#if unreadMessages > 0}
							<button
								class="rounded-full px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
								on:click={markAllAsRead}
							>
								すべて既読
							</button>
						{/if}
						<button
							class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
							on:click={closeDropdown}
							aria-label="閉じる"
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

			<!-- 消息列表 -->
			<div class="max-h-[32rem] overflow-y-auto">
				{#if displayMessages.length === 0}
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
						<p class="mb-1 text-sm font-medium text-gray-900">メッセージはありません</p>
						<p class="text-sm text-gray-500">新しい通知が届くとここに表示されます</p>
					</div>
				{:else}
					<div class="divide-y divide-gray-100">
						{#each displayMessages as message (message.id)}
							<div
								class="group px-6 py-4 transition-colors hover:bg-gray-50"
								role="button"
								on:click={() => goToMessage(message.id)}
							>
								<div class="flex gap-4">
									<!-- 图标 -->
									<div class="flex shrink-0 flex-col items-center">
										<div
											class={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${!message.read ? 'bg-blue-50' : 'bg-gray-100'}`}
										>
											{message.icon}
										</div>
										<div class="mt-2">
											<span
												class={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(message.type)}`}
											>
												{getTypeLabel(message.type)}
											</span>
										</div>
									</div>

									<!-- 内容 -->
									<div class="min-w-0 flex-1">
										<div class="mb-2 flex items-start justify-between">
											<div class="gap小二 flex items-center">
												<h4
													class={`text-sm font-semibold ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}
												>
													{message.title}
												</h4>
												{#if !message.read}
													<span class="h-2 w-2 rounded-full bg-blue-500"></span>
												{/if}
											</div>
											<button
												class="ml-2 shrink-0 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
												on:click|stopPropagation={() => deleteMessage(message.id)}
												aria-label="メッセージを削除"
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
											{message.content}
										</p>
										<div class="flex items-center justify-between">
											<span class="text-xs text-gray-500">
												{message.time}
											</span>
											<div class="flex gap-2">
												{#if !message.read}
													<button
														class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
														on:click|stopPropagation={() => markAsRead(message.id)}
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

			<!-- 底部 -->
			<div class="border-t border-gray-100 bg-gray-50 px-6 py-4">
				<a
					href="/messages"
					class="block rounded-lg bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
					on:click={closeDropdown}
				>
					すべてのメッセージを見る
				</a>
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

	/* 自定义滚动条 */
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
