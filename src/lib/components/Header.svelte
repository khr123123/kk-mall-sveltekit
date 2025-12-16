<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { quickCategories } from '$lib/mockdata/Category.js';

	// ==================== 状态管理 ====================
	// 用户登录状态
	let isLoggedIn = true;
	let user = {
		name: 'K.',
		avatar: '/logo.png',
		notifications: 3,
		messages: 2,
		cartItems: 5
	};

	// 搜索关键词
	let searchKeyword = '';

	// 菜单状态
	let showCategoryMenu = false;
	let activeParentCategory: number | null = null;
	let categoryMenuTimeout: number;

	let showUserMenu = false;
	let userMenuTimeout: number;

	let showLoginModal = false;
	let showMobileMenu = false;
	let showMobileSearch = false;

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

	// 用户菜单项
	const userMenuItems = [
		{ label: 'マイページ', href: '/profile/profile', icon: '/svgs/user.svg' },
		{ label: '注文履歴', href: '/profile/orders', icon: '/svgs/orders.svg' },
		{ label: 'お気に入り', href: '/profile/favorites', icon: '/svgs/heart.svg' },
		{ label: 'アドレス', href: '/profile/addresses', icon: '/svgs/addresses.svg' },
		{ label: '設定', href: '/profile/settings', icon: '/svgs/settings.svg' }
	];

	// ==================== 响应式状态 ====================
	$: activeCategory = quickCategories.find((cat) => cat.id === activeParentCategory);

	// ==================== 搜索功能 ====================
	function handleSearch() {
		if (searchKeyword.trim()) {
			goto(`/product?q=${encodeURIComponent(searchKeyword)}`);
		}
	}
	// ==================== 分类菜单功能 ====================
	function openCategoryMenu() {
		clearTimeout(categoryMenuTimeout);
		showCategoryMenu = true;
		activeParentCategory = quickCategories[0]?.id || null;
	}

	function closeCategoryMenu() {
		categoryMenuTimeout = window.setTimeout(() => {
			showCategoryMenu = false;
			activeParentCategory = null;
		}, 150);
	}

	function handleMouseEnterCategory(categoryId: number) {
		clearTimeout(categoryMenuTimeout);
		activeParentCategory = categoryId;
	}

	// ==================== 用户菜单功能 ====================
	function openUserMenu() {
		clearTimeout(userMenuTimeout);
		showUserMenu = true;
	}

	function closeUserMenu() {
		userMenuTimeout = window.setTimeout(() => {
			showUserMenu = false;
		}, 150);
	}

	function toggleUserMenu() {
		if (window.innerWidth >= 1024) {
			// 桌面端保持下拉菜单
			showUserMenu = !showUserMenu;
		} else {
			// 移动端直接打开登录框
			toggleLogin();
		}
	}

	// ==================== 移动端功能 ====================
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

	// ==================== 登录/登出功能 ====================
	function toggleLogin() {
		if (isLoggedIn) {
			isLoggedIn = false;
			showUserMenu = false;
			console.log('用户已登出');
		} else {
			showLoginModal = true;
		}
	}

	function handleLogin(event: Event) {
		event.preventDefault();
		isLoggedIn = true;
		showLoginModal = false;
		console.log('用户已登录');
	}

	function handleCloseModal() {
		showLoginModal = false;
	}

	// ==================== 键盘事件处理 ====================
	function handleKeydown(event: KeyboardEvent, callback: () => void) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			callback();
		}
	}

	// ==================== 图标组件函数 ====================
	// 这是一个独立的图标组件，我们将在模板中直接使用条件语句
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
						<span class="text-lg font-bold tracking-tight text-gray-900 lg:text-xl">
							K. Portfolio
						</span>
					</div>
				</a>
			</div>

			<!-- 桌面端分类按钮 -->
			<div class="hidden flex-1 items-center gap-4 lg:flex">
				<!-- 所有分类按钮 -->
				<div
					class="category-menu-container relative"
					role="button"
					tabindex="0"
					on:mouseenter={openCategoryMenu}
					on:mouseleave={closeCategoryMenu}
					on:keydown={(e) => handleKeydown(e, openCategoryMenu)}
				>
					<button
						class="category-button ml-5 flex min-w-[180px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
						aria-haspopup="true"
						aria-expanded={showCategoryMenu}
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
						<span>すべてのカテゴリ</span>
					</button>

					<!-- 分类下拉菜单 -->
					{#if showCategoryMenu}
						<div
							class="category-menu-wrapper absolute top-full left-0 mt-1 flex w-[800px] rounded-lg border border-gray-200 bg-white shadow-xl"
							on:mouseenter={openCategoryMenu}
							on:mouseleave={closeCategoryMenu}
							role="menu"
						>
							<!-- 父分类 -->
							<div class="w-62 border-r border-gray-100 bg-gray-50 p-2">
								{#each quickCategories as category}
									<div
										class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors {activeParentCategory ===
										category.id
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700 hover:bg-gray-100'}"
										on:mouseenter={() => handleMouseEnterCategory(category.id)}
										role="menuitem"
										tabindex="0"
										on:click={() => goto(`/category/${category.id}`)}
									>
										<img src={category.icon} alt={category.name} class="h-5 w-5 object-cover" />
										<span class="font-medium">{category.name}</span>
										<svg
											class="ml-auto h-4 w-4"
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
									</div>
								{/each}
							</div>

							<!-- 子分类 -->
							{#if activeCategory?.children}
								<div class="flex-1 p-6">
									<div class="grid grid-cols-2 gap-6">
										{#each activeCategory.children as child}
											<a
												href="/category/{activeCategory.id}/{child.id}"
												class="block rounded-lg px-3 py-2 font-semibold text-gray-900 transition hover:bg-gray-100"
												role="categoryitem"
											>
												{child.name}
											</a>
										{/each}
									</div>
								</div>
							{:else}
								<div class="flex flex-1 items-center justify-center p-6">
									<p class="text-gray-500">サブカテゴリーを選択してください</p>
								</div>
							{/if}
						</div>
					{/if}
				</div>

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

				<!-- 下载APP按钮 (桌面端) -->
				<button
					class="app-button hidden min-w-[150px] items-center gap-2 rounded-lg bg-white px-3 py-2 font-mono text-xs text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 lg:flex"
				>
					<img src="/svgs/二维码.svg" alt="QRコード" class="h-6 w-6 shrink-0" />
					<div class="flex flex-col overflow-hidden text-left leading-tight">
						<span class="truncate text-xs text-gray-500">モバイルアプリを</span>
						<span class="truncate text-xs font-medium">ダウンロード</span>
					</div>
				</button>

				<!-- 语言/货币切换按钮 (桌面端) -->
				<button
					class="locale-button hidden min-w-[110px] items-center gap-2 rounded-lg bg-white px-3 py-2 font-mono text-xs text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 lg:flex"
				>
					<svg class="h-6 w-6 shrink-0 rounded-lg border border-gray-300" viewBox="0 0 24 24">
						<rect width="24" height="24" rx="4" fill="#fff" />
						<circle cx="12" cy="12" r="6" fill="#dc2626" />
					</svg>
					<div class="flex flex-col overflow-hidden text-left leading-tight">
						<span class="truncate text-xs text-gray-500">日本 / JA</span>
						<span class="truncate text-xs font-medium">JPY</span>
					</div>
				</button>

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

				<!-- 用户区域 -->
				<div class="user-menu-container relative">
					{#if isLoggedIn}
						<!-- 已登录状态 -->
						<div class="hidden lg:block" on:mouseenter={openUserMenu} on:mouseleave={closeUserMenu}>
							<button
								class="user-button flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
								on:click={toggleUserMenu}
								aria-haspopup="true"
								aria-expanded={showUserMenu}
							>
								<img
									src={user.avatar}
									alt={user.name}
									class="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
								/>
								<span class="text-sm font-medium text-gray-700">{user.name}</span>
								<svg
									class="h-4 w-4 text-gray-500 transition-transform {showUserMenu
										? 'rotate-180'
										: ''}"
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

							{#if showUserMenu}
								<div
									class="user-menu-dropdown absolute top-full right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-xl"
									on:mouseenter={openUserMenu}
									on:mouseleave={closeUserMenu}
									role="menu"
								>
									{#each userMenuItems as item}
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
										on:click={toggleLogin}
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
						<button class="lg:hidden" on:click={toggleLogin} aria-label="ユーザーメニュー">
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
								on:click={toggleLogin}
								class="login-button rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 lg:px-4 lg:py-2 lg:text-sm"
							>
								ログイン
							</button>
							<button
								class="register-button hidden rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-400 lg:block"
							>
								新規登録
							</button>
						</div>
					{/if}
				</div>
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
						: 'text-gray-700 '}"
				>
					{#if item.isSpecial}
						<data class="flex items-center gap-1 text-sm">
							<img src={item.icon} alt={item.label} class="h-4 w-4" />
							{item.label}
						</data>
					{:else}
						<div class="flex items-center gap-1">
							<!-- 直接使用条件语句渲染不同的图标 -->
							{#if item.icon === '/mall/首页.svg'}
								<img src={item.icon} alt={item.label} class="h-4 w-4" />
							{:else if item.icon === '/mall/人气.svg'}
								<img src={item.icon} alt={item.label} class="h-4 w-4" />
							{:else if item.icon === '/mall/闪电.svg'}
								<img src={item.icon} alt={item.label} class="h-5 w-5" />
							{:else if item.icon === '/mall/时间.svg'}
								<img src={item.icon} alt={item.label} class="h-4 w-4" />
							{:else if item.icon === '/mall/砍价记录.svg'}
								<img src={item.icon} alt={item.label} class="h-4 w-4" />
							{:else if item.icon === 'info'}
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

	<!-- 移动端全屏菜单 -->
	{#if showMobileMenu}
		<div class="mobile-menu fixed inset-0 z-40 bg-white lg:hidden">
			<!-- 菜单头部 -->
			<div class="flex items-center justify-between border-b border-gray-100 px-4 py-4">
				<a href="/" class="flex items-center gap-2" on:click={toggleMobileMenu}>
					<img src="/logo.png" alt="Logo" class="h-8 w-8 rounded-lg object-cover" />
					<span class="text-lg font-bold tracking-tight text-gray-900">K. Portfolio</span>
				</a>
				<button on:click={toggleMobileMenu} class="rounded-lg p-2" aria-label="メニューを閉じる">
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
							on:click={toggleMobileMenu}
						>
							<span class="flex items-center gap-2">
								<!-- 移动端菜单图标 -->
								{#if item.icon === '/mall/首页.svg'}
									<img src={item.icon} alt={item.label} class="h-5 w-5" />
								{:else if item.icon === '/mall/人气.svg'}
									<img src={item.icon} alt={item.label} class="h-5 w-5" />
								{:else if item.icon === '/mall/闪电.svg'}
									<img src={item.icon} alt={item.label} class="h-5 w-5" />
								{:else if item.icon === '/mall/时间.svg'}
									<img src={item.icon} alt={item.label} class="h-5 w-5" />
								{:else if item.icon === 'clock'}
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								{:else if item.icon === '/mall/砍价记录.svg'}
									<img src={item.icon} alt={item.label} class="h-4 w-4" />
								{:else if item.icon === 'info'}
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
								on:click={toggleMobileMenu}
							>
								<img src={item.icon} alt={item.label} class="h-5 w-5" />
								{item.label}
							</a>
						{/each}
						<button
							on:click={() => {
								toggleLogin();
								toggleMobileMenu();
							}}
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
							on:click={() => {
								toggleLogin();
								toggleMobileMenu();
							}}
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
</header>

<!-- 登录模态框 -->
{#if showLoginModal}
	<div
		class="modal-overlay fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
		on:click={handleCloseModal}
		role="button"
		tabindex="0"
		aria-label="モーダルを閉じる"
	>
		<div
			class="modal-content relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
			on:click|stopPropagation
			role="dialog"
			aria-modal="true"
		>
			<!-- 关闭按钮 -->
			<button
				on:click={handleCloseModal}
				class="modal-close absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
				aria-label="モーダルを閉じる"
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

			<h2 class="modal-title mb-6 text-2xl font-bold text-gray-900">ログイン</h2>

			<form class="space-y-4" on:submit={handleLogin}>
				<div>
					<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
						メールアドレス
					</label>
					<input
						id="email"
						type="email"
						class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
						placeholder="example@email.com"
						required
					/>
				</div>

				<div>
					<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
						パスワード
					</label>
					<input
						id="password"
						type="password"
						class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
						placeholder="••••••••"
						required
					/>
				</div>

				<div class="flex items-center justify-between">
					<label class="flex items-center">
						<input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-gray-600" />
						<span class="ml-2 text-sm text-gray-600">ログイン状態を保持</span>
					</label>
					<a
						href="/forgot-password"
						class="text-sm text-gray-600 transition-colors hover:text-gray-700 hover:underline"
					>
						パスワードを忘れた方
					</a>
				</div>

				<button
					type="submit"
					class="submit-button w-full rounded-lg bg-gray-200 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-400"
				>
					ログイン
				</button>

				<div class="divider relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-2 text-gray-500">または</span>
					</div>
				</div>

				<div class="social-login space-y-3">
					<button
						type="button"
						class="social-button flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Googleで続ける
					</button>
					<button
						type="button"
						class="social-button flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						<svg class="h-5 w-5" fill="#000000" viewBox="0 0 24 24">
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
						GitHubで続ける
					</button>
				</div>

				<p class="register-text mt-6 text-center text-sm text-gray-600">
					アカウントをお持ちでないですか？
					<a
						href="/register"
						class="font-medium text-gray-600 transition-colors hover:text-gray-700 hover:underline"
					>
						新規登録
					</a>
				</p>
			</form>
		</div>
	</div>
{/if}

<style>
	/* ==================== 按钮样式 ==================== */
	.category-button,
	.app-button,
	.locale-button {
		min-width: 180px;
	}

	@media (max-width: 1280px) {
		.category-button {
			min-width: 160px;
		}

		.app-button {
			min-width: 140px;
		}

		.locale-button {
			min-width: 100px;
		}
	}

	/* ==================== 导航样式 ==================== */
	.nav-link {
		position: relative;
		font-weight: 500;
		padding: 0.25rem 0;
	}

	/* 手绘风格下划线动画 */
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

	/* ==================== 菜单动画 ==================== */
	.category-menu-wrapper,
	.user-menu-dropdown,
	.modal-overlay {
		animation: fadeIn 0.2s ease-out;
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

	/* ==================== 交互效果 ==================== */
	button,
	a {
		transition: all 0.2s ease;
		outline: none;
	}

	button:active {
		transform: scale(0.98);
	}

	/* ==================== 分类菜单容器 ==================== */
	.category-menu-container {
		position: relative;
	}

	.category-menu-wrapper {
		position: absolute;
		top: calc(100% + 2px);
		left: 0;
		z-index: 50;
	}

	/* ==================== 用户菜单 ==================== */
	.user-menu-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		z-index: 50;
	}

	/* ==================== 模态框样式 ==================== */
	.modal-content {
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ==================== 购物车角标 ==================== */
	.cart-badge {
		line-height: 1;
	}

	@media (min-width: 1024px) {
		.cart-badge {
			transform: translate(25%, -25%);
		}
	}

	/* ==================== 移动端菜单 ==================== */
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

	/* ==================== 响应式优化 ==================== */
	@media (max-width: 1024px) {
		.category-button,
		.app-button,
		.locale-button {
			display: none;
		}

		.desktop-nav {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.logo span {
			font-size: 1rem;
		}

		.logo img {
			height: 32px;
			width: 32px;
		}

		.cart-button {
			padding: 0.25rem;
		}

		.login-button {
			padding: 0.375rem 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.logo span {
			font-size: 0.875rem;
		}

		.logo img {
			height: 28px;
			width: 28px;
		}

		.cart-badge {
			font-size: 9px;
			height: 16px;
			width: 16px;
		}
	}

	/* ==================== 工具类 ==================== */
	.flex-center {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ==================== 输入框样式 ==================== */
	.search-input,
	.mobile-search-input {
		border-radius: 9999px;
		transition: all 0.2s ease;
	}

	.search-input:focus,
	.mobile-search-input:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(209, 213, 219, 0.3);
	}
</style>
