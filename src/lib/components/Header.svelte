<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	// 用户数据
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
	let activeParentCategory: string | null = null;
	let categoryMenuTimeout: number;

	// 用户下拉菜单状态
	let showUserMenu = false;
	let userMenuTimeout: number;

	// 日语分类数据
	const categories = [
		{
			id: 'electronics',
			name: '家電・デジタル',
			icon: '📱',
			children: [
				{ name: 'スマートフォン', tags: ['iPhone', 'Galaxy', 'Xiaomi', 'Huawei'] },
				{ name: 'タブレット', tags: ['iPad', 'Androidタブレット', '電子書籍リーダー'] },
				{ name: 'ノートパソコン', tags: ['ゲーミングPC', '軽量ノート', 'ビジネスノート', '2-in-1'] },
				{ name: 'スマートウォッチ', tags: ['Apple Watch', 'スマートウォッチ', 'フィットネストラッカー'] },
				{ name: 'オーディオ', tags: ['ワイヤレスイヤホン', '有線イヤホン', 'スピーカー', 'マイク'] }
			]
		},
		{
			id: 'fashion',
			name: 'ファッション',
			icon: '👔',
			children: [
				{ name: 'メンズ', tags: ['Tシャツ', 'シャツ', 'パンツ', 'ジャケット', 'スーツ'] },
				{ name: 'レディース', tags: ['ワンピース', 'トップス', 'パンツ', 'スカート', 'コート'] },
				{ name: 'キッズ', tags: ['ベビー服', '子供服', '子供用パンツ'] },
				{ name: 'シューズ', tags: ['スニーカー', 'カジュアルシューズ', '革靴', 'ブーツ', 'サンダル'] },
				{ name: 'バッグ・小物', tags: ['バックパック', 'ショルダーバッグ', '財布', 'ベルト', '帽子'] }
			]
		},
		{
			id: 'home',
			name: 'ホーム・ライフ',
			icon: '🏠',
			children: [
				{ name: '家具', tags: ['ソファ', 'ベッド', 'クローゼット', 'デスク', 'チェア'] },
				{ name: 'ホームテキスタイル', tags: ['寝具', 'カーテン', 'カーペット', 'タオル'] },
				{ name: 'キッチン用品', tags: ['鍋', '包丁', '食器', '保存容器', 'マグカップ'] },
				{ name: 'インテリア', tags: ['照明', '工具', '壁紙', 'フローリング', 'バスルーム'] },
				{ name: '収納', tags: ['収納ボックス', 'ラック', 'ハンガー', '真空パック'] }
			]
		},
		{
			id: 'beauty',
			name: 'コスメ・スキンケア',
			icon: '💄',
			children: [
				{ name: 'スキンケア', tags: ['クレンジング', '化粧水・乳液', 'フェイスマスク', '美容液', '日焼け止め'] },
				{ name: 'メイクアップ', tags: ['リップ', 'ファンデーション', 'アイシャドウ', 'マスカラ', 'チーク'] },
				{ name: 'フレグランス', tags: ['レディース香水', 'メンズ香水', 'ユニセックス香水'] },
				{ name: 'ボディケア', tags: ['シャンプー', 'ボディソープ', '歯磨き粉', 'シェーバー'] },
				{ name: '美容工具', tags: ['メイクブラシ', '美顔器', '眉カッター', 'パフ'] }
			]
		},
		{
			id: 'sports',
			name: 'スポーツ・アウトドア',
			icon: '⚽',
			children: [
				{ name: 'スポーツウェア', tags: ['スポーツTシャツ', 'トレーニングパンツ', 'スポーツブラ', '水着'] },
				{ name: 'フィットネス機器', tags: ['ダンベル', 'ヨガマット', 'ランニングマシン', 'エアロバイク'] },
				{ name: 'アウトドアギア', tags: ['テント', 'シュラフ', 'バックパック', 'トレッキングシューズ'] },
				{ name: 'ボールスポーツ', tags: ['バスケットボール', 'サッカー', 'バドミントン', '卓球'] },
				{ name: 'サイクリング', tags: ['自転車', 'サイクリングウェア', 'ヘルメット', 'ライト'] }
			]
		},
		{
			id: 'appliances',
			name: '生活家電',
			icon: '🔌',
			children: [
				{ name: '大型家電', tags: ['冷蔵庫', '洗濯機', 'エアコン', 'テレビ', '給湯器'] },
				{ name: 'キッチン家電', tags: ['炊飯器', '電子レンジ', 'オーブン', 'ミキサー', 'ジューサー'] },
				{ name: '生活家電', tags: ['掃除機', '扇風機', '加湿器', '空気清浄機'] },
				{ name: 'ヘアケア', tags: ['電動歯ブラシ', 'ヘアドライヤー', 'シェーバー', '美顔器'] },
				{ name: 'スマートホーム', tags: ['スマートスピーカー', 'スマートロック', '監視カメラ', '掃除ロボット'] }
			]
		}
	];

	function handleSearch() {
		if (searchKeyword.trim()) {
			console.log('検索:', searchKeyword);
			// 这里添加搜索逻辑
		}
	}

	// 分类菜单函数
	function openCategoryMenu() {
		clearTimeout(categoryMenuTimeout);
		showCategoryMenu = true;
	}

	function closeCategoryMenu() {
		categoryMenuTimeout = window.setTimeout(() => {
			showCategoryMenu = false;
			activeParentCategory = null;
		}, 150);
	}

	function handleMouseEnterCategory(categoryId: string) {
		clearTimeout(categoryMenuTimeout);
		activeParentCategory = categoryId;
	}

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
</script>

<header class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
	<!-- 主导航栏 -->
	<div class="px-4 py-3">
		<div class="mx-auto flex max-w-7xl items-center gap-6">
			<!-- Logo -->
			<a href="/" class="flex shrink-0 items-center gap-2 no-underline">
				<img src="/logo.png" alt="Logo" class="h-10 w-10 rounded-lg object-cover" />
				<span class="text-xl font-bold tracking-tight text-gray-900">K. Portfolio</span>
			</a>

			<!-- 所有分类按钮 -->
			<div class="relative" 
				on:mouseenter={openCategoryMenu}
				on:mouseleave={closeCategoryMenu}
			>
				<button
					class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-800 hover:text-gray-900"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
					<span>すべてのカテゴリー</span>
				</button>

				<!-- 分类下拉菜单 -->
				{#if showCategoryMenu}
					<div
						class="absolute top-full left-0 mt-1 flex w-[800px] rounded-lg border border-gray-200 bg-white shadow-xl"
						on:mouseenter={openCategoryMenu}
						on:mouseleave={closeCategoryMenu}
					>
						<!-- 父分类 -->
						<div class="w-60 border-r border-gray-100 bg-gray-50 p-2">
							{#each categories as category}
								<div
									class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors {activeParentCategory === category.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}"
									on:mouseenter={() => handleMouseEnterCategory(category.id)}
								>
									<span class="text-xl">{category.icon}</span>
									<span class="font-medium">{category.name}</span>
									<svg class="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
									</svg>
								</div>
							{/each}
						</div>

						<!-- 子分类 -->
						<div class="flex-1 p-6">
							{#each categories as category}
								{#if activeParentCategory === category.id}
									<div class="grid grid-cols-2 gap-6">
										{#each category.children as child}
											<div>
												<h4 class="mb-3 font-semibold text-gray-900">{child.name}</h4>
												<div class="flex flex-wrap gap-2">
													{#each child.tags as tag}
														<a
															href="/search?q={encodeURIComponent(tag)}"
															class="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-900 hover:text-white"
														>
															{tag}
														</a>
													{/each}
												</div>
											</div>
										{/each}
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- 搜索框 - 两边圆形 -->
			<div class="flex flex-1">
				<div class="relative flex w-full items-center">
					<div class="relative w-full">
						<input
							type="text"
							bind:value={searchKeyword}
							placeholder="商品やブランドを検索..."
							class="w-full rounded-full border border-gray-300 px-6 py-3 text-sm focus:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
							on:keypress={(e) => e.key === 'Enter' && handleSearch()}
						/>
						<button
							class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-900 p-2 text-white transition-colors hover:bg-gray-800"
							on:click={handleSearch}
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			<!-- 右侧用户区域 -->
			<div class="flex items-center gap-3">
				<!-- 通知图标 -->
				<button class="relative rounded-lg p-2 hover:bg-gray-100">
					<svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
					{#if user.notifications > 0}
						<span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-800 text-xs text-white">
							{user.notifications}
						</span>
					{/if}
				</button>

				<!-- 消息图标 -->
				<button class="relative rounded-lg p-2 hover:bg-gray-100">
					<svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
					{#if user.messages > 0}
						<span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-800 text-xs text-white">
							{user.messages}
						</span>
					{/if}
				</button>

				<!-- 购物车 -->
				<button class="relative rounded-lg p-2 hover:bg-gray-100">
					<svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					<span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-xs text-white">
						5
					</span>
				</button>

				<!-- 分隔线 -->
				<div class="h-6 w-px bg-gray-300"></div>

				<!-- 用户头像和昵称 -->
				<div class="relative" 
					on:mouseenter={openUserMenu}
					on:mouseleave={closeUserMenu}
				>
					<button
						class="group flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
						on:click={toggleUserMenu}
					>
						<img
							src={user.avatar}
							alt={user.name}
							class="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
						/>
						<svg class="h-4 w-4 text-gray-500 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					<!-- 用户下拉菜单 -->
					{#if showUserMenu}
						<div
							role="menu"
							aria-label="ユーザーメニュー"
							class="absolute top-full right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-xl"
							on:mouseenter={openUserMenu}
							on:mouseleave={closeUserMenu}
						>
							<a
								href="/profile"
								role="menuitem"
								class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								マイページ
							</a>
							<a
								href="/orders"
								role="menuitem"
								class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
								注文履歴
							</a>
							<a
								href="/wishlist"
								role="menuitem"
								class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
								</svg>
								お気に入り
							</a>
							<a
								href="/settings"
								role="menuitem"
								class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								設定
							</a>
							<div class="my-1 border-t border-gray-100"></div>
							<a
								href="/logout"
								role="menuitem"
								class="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								ログアウト
							</a>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- 快捷导航 - 日语 -->
	<div class="border-t border-gray-100 bg-white px-4 py-2">
		<div class="mx-auto flex max-w-7xl items-center gap-6 text-sm">
			<a href="/" class="text-gray-700 hover:text-gray-900">ホーム</a>
			<a href="/hot" class="text-gray-700 hover:text-gray-900">人気商品</a>
			<a href="/new" class="text-gray-700 hover:text-gray-900">新着商品</a>
			<a href="/deals" class="flex items-center gap-1 text-gray-900 hover:text-gray-700">
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span class="font-medium">タイムセール</span>
			</a>
			<a href="/brands" class="text-gray-700 hover:text-gray-900">ブランド</a>
			<a href={resolve('/about')} class="text-gray-700 hover:text-gray-900">会社概要</a>
		</div>
	</div>
</header>

<style>
	/* 移除所有a标签的下划线 */
	a {
		text-decoration: none;
	}

	a:hover {
		text-decoration: none;
	}

	/* 搜索框圆形效果 */
	input[type="text"] {
		border-radius: 9999px;
	}

	/* 下拉菜单动画 */
	[class*="shadow-xl"] {
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
</style>