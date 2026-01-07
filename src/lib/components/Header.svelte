<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, onDestroy } from 'svelte';
	import UserDropdown from './headercomponents/UserDropdown.svelte';
	import CategoryDropdown from './headercomponents/CategoryDropdown.svelte';
	import QRCodeDropdown from './headercomponents/QRCodeDropdown.svelte';
	import LocaleDropdown from './headercomponents/LocaleDropdown.svelte';
	import MobileMenu from './headercomponents/MobileMenu.svelte';
	import AuthModal from './headercomponents/LoginModal.svelte';
	import MessageDropdown from './headercomponents/MessageDropdown.svelte';
	import CartDropdown from './headercomponents/CartDropdown.svelte';
	import { CategoryService, type Category } from '$lib/services/categoryService';
	import { categoryStore } from '$lib/stores/categoryStore';
	import { userStore, currentUser, isLoggedIn } from '$lib/stores/userStore';

	let searchKeyword = '';
	let showAuthModal = false;
	let showMobileMenu = false;
	let showMobileSearch = false;

	// 订阅用户状态
	$: user = $currentUser;
	$: loggedIn = $isLoggedIn;

	// 用户显示信息（兼容旧代码）
	$: displayUser = {
		name: user?.name || 'ゲスト',
		avatar: user?.avatar || '/logo.png',
		messages: 2, // 这个需要从API获取
		cartItems: 5 // 这个需要从API获取
	};

	// 用户菜单项
	const userMenuItems = [
		{ label: 'マイページ', href: '/profile/profile', icon :'/svgs/user.svg' },
		{ label: '注文履歴', href: '/profile/orders', icon :'/svgs/orders.svg' },
		{ label: 'お気に入り', href: '/profile/favorites', icon :'/svgs/heart.svg' },
		{ label: 'アドレス', href: '/profile/addresses', icon :'/svgs/addresses.svg' },
		{ label: '設定', href: '/profile/settings', icon: '/svgs/settings.svg' }
	];

	// 底部导航菜单项配置
	const navMenuItems = [
		{ path: '/', label: 'ホーム', exact: true, icon: '/mall/首页.svg' },
		{ path: '/hot', label: '人気商品', exact: false, icon :'/mall/人气.svg' },
		{ path: '/new', label: '新着商品', exact: false, icon :'/mall/闪电.svg' },
		{
			path: '/deals',
			label: 'タイムセール',
			exact: false,
			isSpecial: true,
			icon :'/mall/时间.svg'
		},
		{ path: '/brands', label: 'ブランド', exact: false, icon: '/mall/砍价记录.svg' },
		{ path: '/about', label: '会社概要', exact: false, icon: 'info' }
	];

	// 消息数据
	const messageItems = [
		{
			id: 1,
			type: 'order',
			title: '注文が発送されました',
			content: 'ご注文の商品#12345が発送されました。',
			time: '2時間前',
			read: false,
			icon :'📦'
		},
		{
			id: 2,
			type: 'promotion',
			title: '限定セール開始',
			content: '週末限定！全商品20%オフセール開催中です。',
			time: '5時間前',
			read: false,
			icon :'🎉'
		}
	];

	// 购物车数据
	const cartItems = [
		{
			id: 1,
			name: 'ワイヤレスイヤホン Pro',
			image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop',
			price: 12800,
			originalPrice: 15800,
			quantity: 1,
			color: 'ブラック',
			inStock: true
		},
		{
			id: 2,
			name: 'スマートウォッチ Series 5',
			image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
			price: 28900,
			quantity: 1,
			color: 'シルバー',
			inStock: true
		}
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
		showAuthModal = true;
	}

	function handleUserLogout() {
		// 调用 userStore 的 logout 方法
		userStore.logout();
		console.log('用户已登出');

		// 可选：显示退出成功提示
		// toast.success('ログアウトしました');
	}

	// AuthModal关闭时的处理
	function handleCloseModal() {
		showAuthModal = false;
	}

	// AuthModal登录成功后的处理
	function handleLoginSuccess(event: CustomEvent) {
		console.log('登录成功:', event.detail);
		showAuthModal = false;
		// 可选：显示登录成功提示
		// toast.success('ログインしました！');
	}

	// AuthModal注册成功后的处理
	function handleRegisterSuccess(event: CustomEvent) {
		console.log('注册成功:', event.detail);
		showAuthModal = false;
		// 可选：显示注册成功提示
		// toast.success('アカウントを作成しました！');
	}

	function handleLocaleChange(event: CustomEvent) {
		console.log('Locale changed to:', event.detail);
	}

	// 处理Keyboard事件
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && showAuthModal) {
			handleCloseModal();
		}
	}

	// 处理消息相关事件
	function handleMessageOpen() {
		console.log('消息面板打开');
	}

	function handleMarkRead(event: CustomEvent) {
		console.log('标记为已读:', event.detail);
	}

	function handleMarkAllRead() {
		console.log('全部标记为已读');
		displayUser.messages = 0;
	}

	function handleDeleteMessage(event: CustomEvent) {
		console.log('删除消息:', event.detail);
	}

	function handleMessageClick(event: CustomEvent) {
		console.log('点击消息:', event.detail);
		goto(`/messages/${event.detail}`);
	}

	// 处理购物车相关事件
	function handleCartOpen() {
		console.log('购物车面板打开');
	}

	function handleUpdateQuantity(event: CustomEvent) {
		console.log('更新数量:', event.detail);
	}

	function handleRemoveItem(event: CustomEvent) {
		console.log('删除商品:', event.detail);
		if (displayUser.cartItems > 0) {
			displayUser.cartItems--;
		}
	}

	let isBrowser = false;
	let quickCategories: Category[] = [];

	onMount(async () => {
		// 先检查 store 中是否已有数据
		if (!$categoryStore.isLoaded) {
			quickCategories = await CategoryService.getAllCategories();
			categoryStore.setCategories(quickCategories);
		} else {
			quickCategories = $categoryStore.categories;
		}

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
				<button
					class="p-2 text-gray-600 hover:text-gray-900 focus:outline-none lg:hidden"
					onclick={toggleMobileMenu}
					aria-label="メニューを開く"
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				<!-- Logo -->
				<a href="/" class="logo shrink-0" aria-label="ホームページ">
					<div class="flex items-center gap-2">
						<img
							src="/logo.png"
							alt="K. Portfolio Logo"
							class="h-8 w-8 rounded-lg object-cover transition-transform hover:scale-105 lg:h-10 lg:w-10"
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
				{#if quickCategories.length > 0}
					<CategoryDropdown categories={quickCategories} />
				{/if}
				<!-- 搜索框 -->
				<div class="relative max-w-xl flex-1">
					<div class="relative">
						<input
							type="text"
							bind:value={searchKeyword}
							placeholder="商品やブランドを検索..."
							class="search-input w-full rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
							onkeypress={(e) => e.key === 'Enter' && handleSearch()}
						/>
						<button
							class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-gray-800 p-2 text-white transition-all hover:bg-gray-900 active:scale-95"
							onclick={handleSearch}
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
			<div class="flex items-center gap-2 lg:gap-4">
				<!-- 移动端搜索按钮 -->
				<button
					class="p-2 text-gray-600 hover:text-gray-900 focus:outline-none lg:hidden"
					onclick={toggleMobileSearch}
					aria-label="検索"
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

				<!-- 购物车下拉组件 -->
				<CartDropdown
					on:open={handleCartOpen}
					on:updateQuantity={handleUpdateQuantity}
					on:removeItem={handleRemoveItem}
				/>

				<!-- 消息下拉组件 -->
				<MessageDropdown
					messages={messageItems}
					unreadCount={displayUser.messages}
					on:open={handleMessageOpen}
					on:markRead={handleMarkRead}
					on:markAllRead={handleMarkAllRead}
					on:delete={handleDeleteMessage}
					on:messageClick={handleMessageClick}
				/>

				<!-- 用户下拉组件 -->
				<UserDropdown
					user={displayUser}
					isLoggedIn={loggedIn}
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
						onkeypress={(e) => e.key === 'Enter' && handleSearch()}
					/>
					<button
						class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-gray-800 p-2 text-white transition-all hover:bg-gray-900 active:scale-95"
						onclick={handleSearch}
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
					onclick={toggleMobileSearch}
					class="cancel-button rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
						? 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
						: ''} {page.url.pathname === item.path
						? item.isSpecial
							? 'font-semibold text-red-600'
							: 'font-semibold text-gray-900'
						: ''}"
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
		user={displayUser}
		isLoggedIn={loggedIn}
		{navMenuItems}
		{userMenuItems}
		on:close={() => (showMobileMenu = false)}
		on:login={handleUserLogin}
		on:logout={handleUserLogout}
	/>
</header>

<!-- 认证模态框组件（登录/注册） -->
<AuthModal
	show={showAuthModal}
	onClose={handleCloseModal}
	on:loginSuccess={handleLoginSuccess}
	on:registerSuccess={handleRegisterSuccess}
/>

<style>
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

	/* 交互效果 */
	button,
	a {
		transition: all 0.2s ease;
		outline: none;
	}

	buttonactive {
		transform: scale(0.95);
	}

	/* 搜索框样式 */
	.search-input,
	.mobile-search-input {
		transition :all 0.2s;
	}

	.search-input:focus,
	.mobile-search-input:focus {
		border-color: #9ca3af;
		box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.2);
	}

	/* 响应式调整 */
	@media (max-width: 640px) {
		.cancel-button {
			font-size: 0.875rem;
			padding: 0.5rem 0.75rem;
		}
	}
</style>
