<script lang="ts">
	import { createEventDispatcher } from 'svelte'; // Svelte 5 以降非推奨、代わりに $props() 経由でイベントを発行してください

	// Props
	export let user: {
		name: string;
		avatar: string;
		notifications?: number;
		messages?: number;
	};
	export let isLoggedIn: boolean = false;
	export let menuItems: Array<{ label: string; href: string; icon: string }> = [];

	// Events
	const dispatch = createEventDispatcher();

	// State
	let showMenu = false;
	let menuTimeout: number;

	function openMenu() {
		clearTimeout(menuTimeout);
		showMenu = true;
	}

	function closeMenu() {
		menuTimeout = window.setTimeout(() => {
			showMenu = false;
		}, 150);
	}

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function handleLogout() {
		dispatch('logout');
		showMenu = false;
	}

	function handleLogin() {
		dispatch('login');
	}
</script>

<div class="user-dropdown-container relative">
	{#if isLoggedIn}
		<!-- 已登录状态 -->
		<div class="hidden lg:block" on:mouseenter={openMenu} on:mouseleave={closeMenu}>
			<button
				class="user-button flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
				on:click={toggleMenu}
				aria-haspopup="true"
				aria-expanded={showMenu}
			>
				<img
					src={user.avatar}
					alt={user.name}
					class="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
				/>
				<span class="text-sm font-medium text-gray-700">{user.name}</span>
				<svg
					class="h-4 w-4 text-gray-500 transition-transform {showMenu ? 'rotate-180' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{#if showMenu}
				<div
					class="user-menu-dropdown absolute top-full right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-xl"
					on:mouseenter={openMenu}
					on:mouseleave={closeMenu}
					role="menu"
				>
					{#each menuItems as item}
						<a
							href={item.href}
							class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
							role="menuitem"
						>
							<img src={item.icon} alt={item.label} class="h-4 w-4" />
							{item.label}
						</a>
					{/each}
					<div class="my-1 border-t border-gray-100"></div>
					<button
						on:click={handleLogout}
						class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
			{/if}
		</div>

		<!-- 移动端用户头像 -->
		<button class="lg:hidden" on:click={handleLogout} aria-label="ユーザーメニュー">
			<img
				src={user.avatar}
				alt={user.name}
				class="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
			/>
		</button>
	{:else}
		<!-- 未登录状态 -->
		<div class="flex items-center gap-3">
			<button
				on:click={handleLogin}
				class="register-button hidden rounded-lg bg-gray-700 px-4 py-2 font-mono text-sm text-white transition-colors hover:bg-gray-600 lg:block"
			>
				ログイン / 新規登録
			</button>
		</div>
	{/if}
</div>

<style>
	.user-menu-dropdown {
		animation: fadeIn 0.2s ease-out;
		z-index: 50;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	button {
		transition: all 0.2s ease;
	}

	button:active {
		transform: scale(0.98);
	}
</style>
