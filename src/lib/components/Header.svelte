<script lang="ts">
	import { resolve } from '$app/paths';
	import { quickCategories } from '$lib/mockdata/Category.js';

	// 用户登录状态 - 这里模拟登录状态，实际应该从store或session获取
	let isLoggedIn = true; // 设置为false模拟未登录，true模拟已登录

	// 用户数据 - 登录状态时使用这些数据
	let user = {
		name: 'K.',
		avatar: '/logo.png',
		notifications: 3,
		messages: 2
	};

	// 搜索关键词
	let searchKeyword = '';

	// 分类菜单状态
	let showCategoryMenu = false;
	let activeParentCategory: number | null = null;
	let categoryMenuTimeout: number;

	// 用户下拉菜单状态
	let showUserMenu = false;
	let userMenuTimeout: number;

	// 登录弹窗状态
	let showLoginModal = false;

	function handleSearch() {
		if (searchKeyword.trim()) {
			console.log('検索:', searchKeyword);
		}
	}

	// 分类菜单函数
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

	// 获取当前激活的分类
	$: activeCategory = quickCategories.find((cat) => cat.id === activeParentCategory);

	// 用户菜单函数
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
		showUserMenu = !showUserMenu;
	}

	// 登录相关函数
	function toggleLogin() {
		if (isLoggedIn) {
			// 执行登出操作
			isLoggedIn = false;
			console.log('用户已登出');
		} else {
			// 显示登录弹窗
			showLoginModal = true;
		}
	}

	function handleLogin() {
		// 模拟登录成功
		isLoggedIn = true;
		showLoginModal = false;
		console.log('用户已登录');
	}

	function handleCloseModal() {
		showLoginModal = false;
	}
</script>

<header class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
	<!-- 主导航栏 -->
	<div class="px-4 py-3">
		<div class="mx-auto flex max-w-7xl items-center gap-4">
			<!-- Logo -->
			<a href="/" class="flex shrink-0 items-center gap-2 no-underline">
				<img src="/logo.png" alt="Logo" class="h-10 w-10 rounded-lg object-cover" />
				<span class="text-xl font-bold tracking-tight text-gray-900">K. Portfolio</span>
			</a>
			<!-- 所有分类按钮 -->
			<div
				role="button"
				tabindex="0"
				class="category-menu-container relative"
				on:mouseenter={openCategoryMenu}
				on:mouseleave={closeCategoryMenu}
			>
				<button
					class="flex w-41 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-800 hover:text-gray-900"
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
						on:pointerenter={openCategoryMenu}
						on:pointerleave={closeCategoryMenu}
					>
						<!-- 父分类 -->
						<div class="w-62 border-r border-gray-100 bg-gray-50 p-2">
							{#each quickCategories as category}
								<div
									class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors {activeParentCategory ===
									category.id
										? 'bg-gray-100 text-gray-900'
										: 'text-gray-700 hover:bg-gray-100'}"
									on:pointerenter={() => handleMouseEnterCategory(category.id)}
									on:pointerleave={() => {}}
									role="menuitem"
									tabindex="0"
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
						{#if activeCategory && activeCategory.children}
							<div class="flex-1 p-6">
								<div class="grid grid-cols-2 gap-6">
									{#each activeCategory.children as child}
										<a
											href="/category/{activeCategory.id}?sub={child.id}"
											class="block rounded-lg px-3 py-2 font-semibold text-gray-900 transition hover:bg-gray-100"
											on:pointerenter={() => handleMouseEnterCategory(activeParentCategory!)}
										>
											{child.name}
										</a>
									{/each}
								</div>
							</div>
						{:else}
							<!-- 默认显示第一个分类的子分类或提示信息 -->
							<div class="flex flex-1 items-center justify-center p-6">
								<p class="text-gray-500">サブカテゴリーを選択してください</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- 搜索框 -->
			<div class="flex flex-1">
				<div class="relative flex items-center">
					<div class="relative w-[380px]">
						<input
							type="text"
							bind:value={searchKeyword}
							placeholder="商品やブランドを検索..."
							class="w-full rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
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

			<button
				class="flex w-41 items-center gap-1 rounded-lg bg-white px-3 py-2 font-mono text-xs text-gray-700 transition hover:border-gray-800 hover:text-gray-900"
			>
				<img src="/svgs/二维码.svg" alt="" class="h-6 w-6" />
				<!-- Text -->
				<div class="flex flex-col text-left leading-tight">
					<span class="font-mono text-xs text-gray-500">モバイルアプリを</span>
					<span class="font-mono text-xs">ダウンロード</span>
				</div>
			</button>

			<button
				class="flex w-31 items-center gap-1 rounded-lg bg-white px-3 py-2 font-mono text-xs text-gray-700 transition hover:border-gray-800 hover:text-gray-900"
			>
				<!-- Flag Icon (Japan) -->
				<svg class="h-6 w-6 rounded-lg border border-gray-300" viewBox="0 0 24 24">
					<rect width="24" height="24" rx="4" fill="#fff" />
					<circle cx="12" cy="12" r="6" fill="#dc2626" />
				</svg>
				<!-- Text -->
				<div class="flex flex-col text-left leading-tight">
					<span class="font-mono text-xs text-gray-500">日本 / JA</span>
					<span class="font-mono text-xs">JPY</span>
				</div>
			</button>

			<!-- 右侧用户区域 -->
			<div class="flex items-center gap-4">
				<!-- 登录状态判断 -->
				{#if isLoggedIn}
					<!-- 已登录状态 - 显示消息和购物车按钮 -->
					<button class="relative rounded-lg p-2 transition-colors hover:bg-gray-100">
						<svg
							class="text-black-600 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						{#if user.messages > 0}
							<span
								class="absolute -top-0 -right-2 ml-2 flex h-4 w-6 items-center justify-center rounded-full bg-red-500 text-[13px] font-medium text-white"
							>
								{user.messages}
							</span>
						{/if}
					</button>

					<button
						class="flex items-center rounded-lg bg-white px-2 py-2 transition hover:bg-gray-100"
					>
						<img src="/svgs/购物车.svg" alt="cart" class="h-6 w-6 shrink-0" />
						<div class="flex flex-col items-start leading-tight">
							<!-- 数量 -->
							<span
								class="ml-2 h-4 w-6 items-center justify-center rounded-full bg-red-500 text-[13px] font-medium text-white"
							>
								5
							</span>
							<span class="w-12 font-mono text-[14px] text-gray-700">カート</span>
						</div>
					</button>

					<!-- 分隔线 -->
					<div class="h-6 w-px bg-gray-300"></div>

					<!-- 用户下拉菜单 -->
					<div
						class="category-menu-container relative"
						tabindex="0"
						role="button"
						aria-haspopup="true"
						aria-expanded={showUserMenu}
						on:mouseenter={openUserMenu}
						on:mouseleave={closeUserMenu}
					>
						<button
							class="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
							on:click={toggleUserMenu}
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

						<!-- 用户下拉菜单内容 -->
						{#if showUserMenu}
							<div
								role="menu"
								tabindex="0"
								aria-label="ユーザーメニュー"
								class="category-menu-wrapper absolute top-full right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-xl"
								on:mouseenter={openUserMenu}
								on:mouseleave={closeUserMenu}
							>
								<a
									href="/profile"
									role="menuitem"
									class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									マイページ
								</a>
								<a
									href="/orders"
									role="menuitem"
									class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
									注文履歴
								</a>
								<a
									href="/wishlist"
									role="menuitem"
									class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
										/>
									</svg>
									お気に入り
								</a>
								<a
									href="/settings"
									role="menuitem"
									class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									設定
								</a>
								<div class="my-1 border-t border-gray-100"></div>
								<button
									on:click={toggleLogin}
									role="menuitem"
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
				{:else}
					<!-- 未登录状态 - 显示登录和注册按钮 -->
					<div class="flex items-center gap-3">
						<button
							on:click={toggleLogin}
							class="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
						>
							ログイン
						</button>
						<button
							class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-400"
						>
							新規登録
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- 快捷导航 - 日语 -->
	<div class="border-t border-gray-100 bg-white px-4 py-2">
		<div class="mx-auto flex max-w-7xl items-center gap-6 text-sm">
			<a href="/" class="text-gray-700 transition-colors hover:text-gray-900">ホーム</a>
			<a href="/hot" class="text-gray-700 transition-colors hover:text-gray-900">人気商品</a>
			<a href="/new" class="text-gray-700 transition-colors hover:text-gray-900">新着商品</a>
			<a
				href="/deals"
				class="flex items-center gap-1 text-red-600 transition-colors hover:text-red-700"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="font-medium">タイムセール</span>
			</a>
			<a href="/brands" class="text-gray-700 transition-colors hover:text-gray-900">ブランド</a>
			<a href={resolve('/about')} class="text-gray-700 transition-colors hover:text-gray-900"
				>会社概要</a
			>
		</div>
	</div>
</header>

<!-- 登录模态框 -->
{#if showLoginModal}
	<!-- ログインモーダル背景オーバーレイ -->
	<div
		role="button"
		tabindex="0"
		aria-label="モーダルを閉じる"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		on:click={handleCloseModal}
		on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCloseModal()}
	>
		<button
			aria-label="モーダルを閉じる"
			on:click={handleCloseModal}
			class="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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

		<h2 class="mb-6 text-2xl font-bold text-gray-900">ログイン</h2>

		<form class="space-y-4" on:submit|preventDefault={handleLogin}>
			<div>
				<label for="email" class="mb-2 block text-sm font-medium text-gray-700"
					>メールアドレス</label
				>
				<input
					id="email"
					type="email"
					class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
					placeholder="example@email.com"
					required
				/>
			</div>

			<div>
				<label for="password" class="mb-2 block text-sm font-medium text-gray-700">パスワード</label
				>
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
					class="text-sm text-gray-600 hover:text-gray-700 hover:underline"
				>
					パスワードを忘れた方
				</a>
			</div>

			<button
				type="submit"
				class="w-full rounded-lg bg-gray-200 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-400"
			>
				ログイン
			</button>

			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-white px-2 text-gray-500">または</span>
				</div>
			</div>

			<div class="space-y-3">
				<button
					type="button"
					class="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
					class="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
				>
					<svg class="h-5 w-5" fill="#000000" viewBox="0 0 24 24">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					GitHubで続ける
				</button>
			</div>

			<p class="mt-6 text-center text-sm text-gray-600">
				アカウントをお持ちでないですか？
				<a href="/register" class="font-medium text-gray-600 hover:text-gray-700 hover:underline">
					新規登録
				</a>
			</p>
		</form>
	</div>
{/if}

<style>
	/* 移除所有a标签的下划线 */
	a {
		text-decoration: none;
	}

	a:hover {
		text-decoration: none;
	}

	/* 搜索框圆形效果 */
	input[type='text'] {
		border-radius: 9999px;
	}

	/* 下拉菜单动画 */
	[class*='shadow-xl'] {
		animation: fadeIn 0.2s ease-out;
	}

	/* 模态框动画 */
	.fixed {
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

	/* 平滑过渡 */
	button,
	a {
		transition: all 0.2s ease;
	}

	/* 按钮点击效果 */
	button:active {
		transform: scale(0.98);
	}

	/* 添加一个透明的覆盖层来消除间隙 */
	.category-menu-container {
		position: relative;
	}

	.category-menu-container::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: transparent;
		pointer-events: none;
		z-index: 10;
	}

	.category-menu-wrapper {
		position: absolute;
		top: calc(100% + 2px); /* 调整菜单位置 */
	}
</style>
