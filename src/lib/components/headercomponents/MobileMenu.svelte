<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { page } from '$app/state';

	// Props
	export let show: boolean = false;
	export let user: { name: string; avatar: string };
	export let isLoggedIn: boolean = false;
	export let navMenuItems: Array<any> = [];
	export let userMenuItems: Array<any> = [];

	// Events
	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function handleLogout() {
		dispatch('logout');
		close();
	}

	function handleLogin() {
		dispatch('login');
		close();
	}
</script>

{#if show}
	<div class="mobile-menu fixed inset-0 z-40 bg-white lg:hidden">
		<!-- 菜单头部 -->
		<div class="flex items-center justify-between border-b border-gray-100 px-4 py-4">
			<a href="/" class="flex items-center gap-2" on:click={close}>
				<img src="/logo.png" alt="Logo" class="h-8 w-8 rounded-lg object-cover" />
				<span class="text-lg font-bold tracking-tight text-gray-900">K. Portfolio</span>
			</a>
			<button on:click={close} class="rounded-lg p-2" aria-label="メニューを閉じる">
				<svg class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<!-- 菜单内容 -->
		<div class="mobile-menu-content overflow-y-auto px-4 py-6">
			<!-- 用户信息 -->
			{#if isLoggedIn}
				<div class="user-info mb-6 flex items-center gap-3">
					<img
						src={user.avatar}
						alt={user.name}
						class="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
					/>
					<div>
						<p class="font-medium text-gray-900">{user.name}</p>
						<p class="text-sm text-gray-500">マイページを見る</p>
					</div>
				</div>
			{/if}

			<!-- 导航菜单 -->
			<nav class="mobile-nav mb-6 space-y-1">
				{#each navMenuItems as item}
					<a
						href={item.path}
						class="mobile-nav-link flex items-center justify-between rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50 {page
							.url.pathname === item.path
							? 'bg-gray-50 font-medium text-gray-900'
							: ''}"
						on:click={close}
					>
						<span class="flex items-center gap-2">
							{#if item.icon !== 'info'}
								<img src={item.icon} alt={item.label} class="h-5 w-5" />
							{:else}
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							{/if}
							{item.label}
						</span>
						<svg
							class="h-5 w-5 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</a>
				{/each}
			</nav>

			<!-- 用户菜单项 -->
			{#if isLoggedIn}
				<div class="user-menu-items mb-6 space-y-1">
					{#each userMenuItems as item}
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
							on:click={close}
						>
							<img src={item.icon} alt={item.label} class="h-5 w-5" />
							{item.label}
						</a>
					{/each}
					<button
						on:click={handleLogout}
						class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition-colors hover:bg-red-50"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						ログアウト
					</button>
				</div>
			{:else}
				<div class="auth-buttons mb-6 flex gap-3">
					<button
						on:click={handleLogin}
						class="flex-1 rounded-lg border border-gray-600 py-2.5 text-sm font-medium text-gray-600"
					>
						ログイン
					</button>
					<button class="flex-1 rounded-lg bg-gray-200 py-2.5 text-sm font-medium text-white">
						新規登録
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.mobile-menu {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.mobile-menu-content {
		height: calc(100vh - 64px);
	}
</style>
