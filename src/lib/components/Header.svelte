<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { quickCategories } from '$lib/mockdata/Category.js';
	import { onMount, onDestroy } from 'svelte';

	// 导入组件
	import UserDropdown from './headercomponents/UserDropdown.svelte';
	import CategoryDropdown from './headercomponents/CategoryDropdown.svelte';
	import QRCodeDropdown from './headercomponents/QRCodeDropdown.svelte';
	import LocaleDropdown from './headercomponents/LocaleDropdown.svelte';
	import MobileMenu from './headercomponents/MobileMenu.svelte';
	import LoginModal from './headercomponents/LoginModal.svelte';

	// ==================== 状态管理 ====================
	let isLoggedIn = true;
	let user = {
		name: 'K.',
		avatar: '/logo.png',
		notifications: 3,
		messages: 2,
		cartItems: 5
	};

	let searchKeyword = '';
	let showLoginModal = false;
	let showMobileMenu = false;
	let showMobileSearch = false;

	// 用户菜单项
	const userMenuItems = [
		{ label: 'マイページ', href: '/profile/profile', icon: '/svgs/user.svg' },
		{ label: '注文履歴', href: '/profile/orders', icon: '/svgs/orders.svg' },
		{ label: 'お気に入り', href: '/profile/favorites', icon: '/svgs/heart.svg' },
		{ label: 'アドレス', href: '/profile/addresses', icon: '/svgs/addresses.svg' },
		{ label: '設定', href: '/profile/settings', icon: '/svgs/settings.svg' }
	];

	// 底部导航菜单项配置
	const navMenuItems = [
		{ path: '/', label: 'ホーム', exact: true, icon: '/mall/首页.svg' },
		{ path: '/hot', label: '人気商品', exact: false, icon: '/mall/人气.svg' },
		{ path: '/new', label: '新着商品', exact: false, icon: '/mall/闪电.svg' },
		{
			path: '/deals',
			label: 'タイムセール',
			exact: false,
			isSpecial: true,
			icon: '/mall/时间.svg'
		},
		{ path: '/brands', label: 'ブランド', exact: false, icon: '/mall/砍价记录.svg' },
		{ path: '/about', label: '会社概要', exact: false, icon: 'info' }
	];

	// ==================== 事件处理 ====================
	function handleSearch() {
		if (searchKeyword.trim()) {
			goto(`/product?q=${encodeURIComponent(searchKeyword)}`);
		}
	}

	function toggleMobileMenu() {
		showMobileMenu = !showMobileMenu;
	}

	function toggleMobileSearch() {
		showMobileSearch = !showMobileSearch;
		if (showMobileSearch) {
			setTimeout(() => {
				const searchInput = document.querySelector('.mobile-search-input');
				if (searchInput) (searchInput as HTMLInputElement).focus();
			}, 100);
		}
	}

	// 处理用户登录相关事件
	function handleUserLogin() {
		showLoginModal = true;
	}

	function handleUserLogout() {
		isLoggedIn = false;
		user = {
			name: '',
			avatar: '/logo.png',
			notifications: 0,
			messages: 0,
			cartItems: 0
		};
		console.log('用户已登出');
		// 这里可以添加登出的API调用
		// 清除本地存储的token等
	}

	// LoginModal关闭时的处理
	function handleCloseModal() {
		showLoginModal = false;
	}

	// LoginModal登录成功后的处理
	function handleLoginSuccess(userData: any) {
		isLoggedIn = true;
		user = {
			...user,
			name: userData.name || 'ユーザー',
			avatar: userData.avatar || '/logo.png'
		};
		showLoginModal = false;
		console.log('登录成功:', userData);
		// 这里可以更新用户信息，跳转页面等
	}

	function handleLocaleChange(event: CustomEvent) {
		console.log('Locale changed to:', event.detail);
	}

	// 处理Keyboard事件
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && showLoginModal) {
			handleCloseModal();
		}
	}

	// 确保只在客户端执行浏览器相关代码
	let isBrowser = false;

	onMount(() => {
		isBrowser = typeof window !== 'undefined';

		if (isBrowser) {
			document.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (isBrowser) {
			document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

<header class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
	<!-- 主导航栏 -->
	<div class="px-4 py-3">
		<div class="mx-auto flex max-w-7xl items-center justify-between gap-3">
			<!-- 左侧区域 -->
			<div class="flex items-center gap-3 lg:gap-4">
				<!-- 移动端汉堡菜单按钮 -->
				<button class="lg:hidden" on:click={toggleMobileMenu} aria-label="メニューを開く">
					<svg class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				<!-- Logo -->
				<a href="/" class="logo shrink-0">
					<div class="flex items-center gap-2">
						<img
							src="/logo.png"
							alt="Logo"
							class="h-8 w-8 rounded-lg object-cover lg:h-10 lg:w-10"
						/>
						<span class="text-lg font-bold tracking-tight text-gray-900 lg:text-xl"
							>K. Portfolio</span
						>
					</div>
				</a>
			</div>

			<!-- 桌面端分类和搜索 -->
			<div class="hidden flex-1 items-center gap-4 lg:flex">
				<!-- 分类下拉组件 -->
				<CategoryDropdown categories={quickCategories} />

				<!-- 搜索框 -->
				<div class="relative max-w-xl flex-1">
					<div class="relative">
						<input
							type="text"
							bind:value={searchKeyword}
							placeholder="商品やブランドを検索..."
							class="search-input w-full rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
							on:keypress={(e) => e.key === 'Enter' && handleSearch()}
						/>
						<button
							class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-gray-200 p-2 text-white transition-colors hover:bg-gray-400"
							on:click={handleSearch}
							aria-label="検索"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			<!-- 右侧区域 -->
			<div class="flex items-center gap-3 lg:gap-4">
				<!-- 移动端搜索按钮 -->
				<button class="lg:hidden" on:click={toggleMobileSearch} aria-label="検索">
					<svg class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>

				<!-- 二维码下拉组件 -->
				<QRCodeDropdown />

				<!-- 地区切换下拉组件 -->
				<LocaleDropdown on:change={handleLocaleChange} />

				<!-- 购物车按钮 -->
				<button
					class="cart-button relative flex items-center rounded-lg px-2 py-2 transition hover:bg-gray-100"
				>
					<img src="/svgs/购物车.svg" alt="cart" class="h-6 w-6" />
					<span
						class="cart-badge absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white lg:top-0 lg:right-0 lg:h-4 lg:w-6 lg:text-[12px]"
					>
						{user.cartItems}
					</span>
				</button>

				<!-- 桌面端消息按钮 -->
				<button
					class="message-button relative hidden rounded-lg p-2 transition-colors hover:bg-gray-100 lg:block"
				>
					<svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
					{#if user.messages > 0}
						<span
							class="message-badge absolute top-0 right-0 flex h-4 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-medium text-white"
						>
							{user.messages}
						</span>
					{/if}
				</button>

				<!-- 用户下拉组件 -->
				<UserDropdown
					{user}
					{isLoggedIn}
					menuItems={userMenuItems}
					on:login={handleUserLogin}
					on:logout={handleUserLogout}
				/>
			</div>
		</div>
	</div>

	<!-- 移动端搜索栏 -->
	{#if showMobileSearch}
		<div class="mobile-search-bar border-t border-gray-100 bg-white px-4 py-3 lg:hidden">
			<div class="flex items-center gap-2">
				<div class="relative flex-1">
					<input
						type="text"
						bind:value={searchKeyword}
						placeholder="商品やブランドを検索..."
						class="mobile-search-input w-full rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
						on:keypress={(e) => e.key === 'Enter' && handleSearch()}
					/>
					<button
						class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-gray-200 p-2 text-white transition-colors hover:bg-gray-400"
						on:click={handleSearch}
						aria-label="検索"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</button>
				</div>
				<button
					on:click={toggleMobileSearch}
					class="cancel-button rounded-lg px-3 py-2 text-sm text-gray-600"
				>
					キャンセル
				</button>
			</div>
		</div>
	{/if}

	<!-- 桌面端底部导航 -->
	<nav class="desktop-nav hidden border-t border-gray-100 bg-white px-4 py-2 lg:block">
		<div class="mx-auto flex max-w-7xl items-center gap-6 text-sm">
			{#each navMenuItems as item}
				<a
					href={item.path}
					class="nav-link relative py-1 transition-colors {page.url.pathname !== item.path
						? 'hover:bg-gray-50 hover:text-gray-600'
						: ''} {page.url.pathname === item.path
						? item.isSpecial
							? 'font-semibold text-red-600'
							: 'font-semibold text-gray-900'
						: 'text-gray-700'}"
				>
					{#if item.isSpecial}
						<span class="flex items-center gap-1 text-sm">
							<img src={item.icon} alt={item.label} class="h-4 w-4" />
							{item.label}
						</span>
					{:else}
						<div class="flex items-center gap-1">
							{#if item.icon !== 'info'}
								<img src={item.icon} alt={item.label} class="h-4 w-4" />
							{:else}
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							{/if}
							{item.label}
						</div>
					{/if}

					{#if page.url.pathname === item.path}
						<svg
							class="nav-underline absolute -bottom-1 left-0"
							width="100%"
							height="6"
							viewBox="0 0 100 6"
							preserveAspectRatio="none"
						>
							<path
								d="M 0,3 Q 10,1 20,3 T 40,3 T 60,3 T 80,3 T 100,3"
								stroke="#00C050"
								stroke-width="2.5"
								fill="none"
								stroke-linecap="round"
							/>
						</svg>
					{/if}
				</a>
			{/each}
		</div>
	</nav>

	<!-- 移动端菜单组件 -->
	<MobileMenu
		show={showMobileMenu}
		{user}
		{isLoggedIn}
		{navMenuItems}
		{userMenuItems}
		on:close={() => (showMobileMenu = false)}
		on:login={handleUserLogin}
		on:logout={handleUserLogout}
	/>
</header>

<!-- 登录模态框组件 -->
<LoginModal show={showLoginModal} onClose={handleCloseModal} on:loginSuccess={handleLoginSuccess} />

<style>
	/* 保留原有样式 */
	.nav-link {
		position: relative;
		font-weight: 500;
		padding: 0.25rem 0;
	}

	.nav-underline {
		animation: drawLine 0.4s ease-out;
	}

	@keyframes drawLine {
		from {
			opacity: 0;
			stroke-dasharray: 100;
			stroke-dashoffset: 100;
		}
		to {
			opacity: 1;
			stroke-dasharray: 100;
			stroke-dashoffset: 0;
		}
	}

	button,
	a {
		transition: all 0.2s ease;
		outline: none;
	}

	button:active {
		transform: scale(0.98);
	}

	.cart-badge {
		line-height: 1;
	}

	@media (min-width: 1024px) {
		.cart-badge {
			transform: translate(25%, -25%);
		}
	}

	/* 模态框样式覆盖 */
	.modal-overlay {
		z-index: 9999 !important;
	}
</style>