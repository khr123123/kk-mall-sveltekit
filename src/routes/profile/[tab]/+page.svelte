<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// 使用 $effect 响应式监听路由变化
	let currentTab = $state('profile');

	$effect(() => {
		currentTab = $page.params.tab ?? 'profile';
	});

	// 用户信息
	const user = {
		name: '山田 太郎',
		email: 'yamada.taro@example.com',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
		memberSince: '2023年4月',
		points: 1250,
		level: 'ゴールド会員'
	};

	// 最近的订单
	const recentOrders = [
		{ id: 'ORD-202400123', date: '2024-01-15', total: 42800, status: '発送済み', items: 2 },
		{ id: 'ORD-202400118', date: '2024-01-12', total: 25600, status: '配送中', items: 1 },
		{ id: 'ORD-202400112', date: '2024-01-08', total: 15200, status: '完了', items: 3 }
	];

	// 收藏商品
	const favoriteProducts = [
		{
			id: 101,
			name: 'iPhone 15 Pro Max',
			price: 148000,
			image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop'
		},
		{
			id: 102,
			name: 'SONY WH-1000XM5',
			price: 39800,
			image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'
		},
		{
			id: 103,
			name: 'Dyson 掃除機',
			price: 65800,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
		}
	];

	// 收货地址
	const addresses = [
		{
			id: 1,
			name: '自宅',
			recipient: '山田 太郎',
			phone: '080-1234-5678',
			address: '〒150-0001 東京都渋谷区神宮前1-1-1',
			isDefault: true
		},
		{
			id: 2,
			name: '会社',
			recipient: '山田 太郎',
			phone: '03-1234-5678',
			address: '〒100-0005 東京都千代田区丸の内1-1-1',
			isDefault: false
		}
	];

	// SVG 图标组件
	const icons = {
		profile: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
		orders: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`,
		addresses: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		favorites: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
		settings: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		support: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
		logout: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>`,
		edit: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
		add: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
		delete: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
		cart: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
		close: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
		arrow: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`
	};

	// 导航菜单
	const menuItems = [
		{ id: 'profile', label: 'プロフィール', icon: icons.profile },
		{ id: 'orders', label: '注文履歴', icon: icons.orders },
		{ id: 'addresses', label: '住所管理', icon: icons.addresses },
		{ id: 'favorites', label: 'お気に入り', icon: icons.favorites },
		{ id: 'settings', label: '設定', icon: icons.settings }
	];

	// 生成导航链接
	function changeTab(itemId: string) {
		goto(`/profile/${itemId}`, {
			replaceState: false,
			noScroll: true,
			keepFocus: true
		});
	}
</script>

<div class="min-h-screen bg-[#f5f5f5] px-4 py-6 md:px-6 lg:px-8">
	<div class="mx-auto max-w-7xl">
		<div class="flex flex-col gap-6 lg:flex-row">
			<!-- 左侧导航栏 -->
			<aside class="shrink-0 lg:w-64">
				<div class="sticky top-6 space-y-4">
					<!-- 用户信息卡片 -->
					<div class="rounded-lg border border-[#e0e0e0] bg-white p-5">
						<div class="mb-5 flex items-center gap-3">
							<img
								src={user.avatar}
								alt={user.name}
								class="h-12 w-12 rounded-full border-2 border-[#e0e0e0]"
							/>
							<div>
								<h3 class="font-semibold text-[#1a1a1a]">{user.name}</h3>
								<p class="text-xs text-[#666]">{user.email}</p>
							</div>
						</div>

						<div class="rounded-md bg-[#2d3748] px-4 py-3 text-white">
							<div class="flex items-center justify-between">
								<div>
									<div class="text-xs text-[#a0aec0]">会員ランク</div>
									<div class="mt-0.5 text-sm font-semibold">{user.level}</div>
								</div>
								<div class="text-right">
									<div class="text-xs text-[#a0aec0]">ポイント</div>
									<div class="mt-0.5 text-lg font-bold">{user.points.toLocaleString('ja-JP')}</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 导航菜单 -->
					<nav class="rounded-lg border border-[#e0e0e0] bg-white p-2">
						<div class="space-y-1">
							{#each menuItems as item}
								<button
									onclick={() => changeTab(item.id)}
									class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors
										{currentTab === item.id ? 'bg-[#b9b9b9] text-white' : 'text-[#4a5568] hover:bg-[#f7fafc]'}"
								>
									<span class="flex-shrink-0">{@html item.icon}</span>
									<span class="flex-1 text-left">{item.label}</span>
									{#if item.id === 'orders' && recentOrders.length > 0}
										<span class="rounded-full bg-[#718096] px-2 py-0.5 text-xs text-white">
											{recentOrders.length}
										</span>
									{/if}
									{#if item.id === 'favorites' && favoriteProducts.length > 0}
										<span class="rounded-full bg-[#718096] px-2 py-0.5 text-xs text-white">
											{favoriteProducts.length}
										</span>
									{/if}
								</button>
							{/each}
						</div>
					</nav>

					<!-- 底部快速链接 -->
					<div class="rounded-lg border border-[#e0e0e0] bg-white p-2">
						<a
							href="/support"
							class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#4a5568] no-underline transition-colors hover:bg-[#f7fafc]"
						>
							{@html icons.support}
							<span>サポート</span>
						</a>
						<a
							href="/logout"
							class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#e53e3e] no-underline transition-colors hover:bg-[#fff5f5]"
						>
							{@html icons.logout}
							<span>ログアウト</span>
						</a>
					</div>
				</div>
			</aside>

			<!-- 右侧内容区域 -->
			<main class="flex-1">
				{#if currentTab === 'profile'}
					<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
						<div class="mb-6 flex items-center justify-between">
							<h2 class="text-xl font-semibold text-[#1a1a1a]">プロフィール</h2>
							<button class="btn-secondary">
								{@html icons.edit}
								<span>編集</span>
							</button>
						</div>

						<div class="space-y-6">
							<!-- 个人信息 -->
							<div class="grid gap-4 md:grid-cols-2">
								<div class="space-y-2">
									<label class="block text-sm font-medium text-[#4a5568]">お名前</label>
									<div class="input-display">{user.name}</div>
								</div>
								<div class="space-y-2">
									<label class="block text-sm font-medium text-[#4a5568]">メールアドレス</label>
									<div class="input-display">{user.email}</div>
								</div>
								<div class="space-y-2">
									<label class="block text-sm font-medium text-[#4a5568]">会員ランク</label>
									<div class="input-display flex items-center gap-2">
										<span class="rounded bg-[#2d3748] px-2 py-1 text-xs font-semibold text-white">
											{user.level}
										</span>
										<span class="text-sm text-[#718096]">
											{user.points.toLocaleString('ja-JP')} ポイント
										</span>
									</div>
								</div>
								<div class="space-y-2">
									<label class="block text-sm font-medium text-[#4a5568]">会員登録日</label>
									<div class="input-display">{user.memberSince}</div>
								</div>
							</div>

							<!-- 统计数据 -->
							<div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
								<div class="stat-card">
									<div class="text-2xl font-bold text-[#1a1a1a]">{recentOrders.length}</div>
									<div class="text-sm text-[#718096]">今月の注文</div>
								</div>
								<div class="stat-card">
									<div class="text-2xl font-bold text-[#1a1a1a]">{favoriteProducts.length}</div>
									<div class="text-sm text-[#718096]">お気に入り</div>
								</div>
								<div class="stat-card">
									<div class="text-2xl font-bold text-[#1a1a1a]">3</div>
									<div class="text-sm text-[#718096]">利用中のクーポン</div>
								</div>
								<div class="stat-card">
									<div class="text-2xl font-bold text-[#1a1a1a]">97%</div>
									<div class="text-sm text-[#718096]">配信成功率</div>
								</div>
							</div>
						</div>
					</div>
				{/if}

				{#if currentTab === 'orders'}
					<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
						<h2 class="mb-6 text-xl font-semibold text-[#1a1a1a]">注文履歴</h2>

						<div class="overflow-x-auto">
							<table class="w-full">
								<thead>
									<tr class="border-b border-[#e0e0e0]">
										<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
											>注文番号</th
										>
										<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]">注文日</th>
										<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]">商品数</th>
										<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
											>合計金額</th
										>
										<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]"
											>ステータス</th
										>
										<th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]">操作</th>
									</tr>
								</thead>
								<tbody>
									{#each recentOrders as order}
										<tr class="border-b border-[#f0f0f0] transition-colors hover:bg-[#fafafa]">
											<td class="px-4 py-3">
												<div class="text-sm font-medium text-[#1a1a1a]">{order.id}</div>
											</td>
											<td class="px-4 py-3 text-sm text-[#718096]">{order.date}</td>
											<td class="px-4 py-3 text-sm text-[#718096]">{order.items}点</td>
											<td class="px-4 py-3">
												<div class="font-semibold text-[#1a1a1a]">
													¥{order.total.toLocaleString('ja-JP')}
												</div>
											</td>
											<td class="px-4 py-3">
												<span
													class="status-badge
													{order.status === '完了'
														? 'status-success'
														: order.status === '配送中'
															? 'status-info'
															: 'status-default'}"
												>
													{order.status}
												</span>
											</td>
											<td class="px-4 py-3">
												<button class="btn-link">詳細</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						{#if recentOrders.length === 0}
							<div class="py-12 text-center">
								<div class="mb-3 text-5xl opacity-30">📦</div>
								<p class="text-[#718096]">注文履歴がありません</p>
							</div>
						{/if}
					</div>
				{/if}

				{#if currentTab === 'addresses'}
					<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
						<div class="mb-6 flex items-center justify-between">
							<h2 class="text-xl font-semibold text-[#1a1a1a]">住所管理</h2>
							<button class="btn-primary">
								{@html icons.add}
								<span>新しい住所を追加</span>
							</button>
						</div>

						<div class="grid gap-4 md:grid-cols-2">
							{#each addresses as address}
								<div class="address-card">
									<div class="mb-4 flex items-start justify-between">
										<div class="flex items-center gap-2">
											<h3 class="font-semibold text-[#1a1a1a]">{address.name}</h3>
											{#if address.isDefault}
												<span
													class="rounded bg-[#2d3748] px-2 py-0.5 text-xs font-medium text-white"
												>
													既定
												</span>
											{/if}
										</div>
										<div class="flex gap-1">
											<button class="icon-btn">
												{@html icons.edit}
											</button>
											<button class="icon-btn text-[#e53e3e]">
												{@html icons.delete}
											</button>
										</div>
									</div>
									<div class="space-y-1 text-sm text-[#4a5568]">
										<p class="font-medium text-[#1a1a1a]">{address.recipient}</p>
										<p>{address.phone}</p>
										<p class="leading-relaxed">{address.address}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if currentTab === 'favorites'}
					<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
						<div class="mb-6 flex items-center justify-between">
							<h2 class="text-xl font-semibold text-[#1a1a1a]">お気に入り商品</h2>
							<button class="btn-secondary">
								{@html icons.delete}
								<span>すべて削除</span>
							</button>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{#each favoriteProducts as product}
								<div class="product-card">
									<img
										src={product.image}
										alt={product.name}
										class="mb-3 h-40 w-full rounded-md border border-[#e0e0e0] object-cover"
									/>
									<h3 class="mb-2 line-clamp-2 text-sm font-semibold text-[#1a1a1a]">
										{product.name}
									</h3>
									<div class="mb-3 text-lg font-bold text-[#1a1a1a]">
										¥{product.price.toLocaleString('ja-JP')}
									</div>
									<div class="flex gap-2">
										<button class="btn-primary flex-1">
											{@html icons.cart}
											<span>カートに入れる</span>
										</button>
										<button class="icon-btn text-[#e53e3e]">
											{@html icons.close}
										</button>
									</div>
								</div>
							{/each}
						</div>

						{#if favoriteProducts.length === 0}
							<div class="py-12 text-center">
								<div class="mb-3 text-5xl opacity-30">❤️</div>
								<p class="text-[#718096]">お気に入り商品がありません</p>
							</div>
						{/if}
					</div>
				{/if}

				{#if currentTab === 'settings'}
					<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
						<h2 class="mb-6 flex items-center text-xl font-semibold text-[#1a1a1a]">
							<img src="/svgs/settings.svg" alt="" class="mr-2 h-5 w-5" />
							設定
						</h2>

						<div class="space-y-6">
							<!-- 通知設定 -->
							<div class="border-b border-[#e0e0e0] pb-6">
								<h3 class="mb-4 flex items-center text-sm font-semibold text-[#1a1a1a]">
									<img src="/svgs/notification.svg" alt="" class="mr-2 h-5 w-5" />
									通知設定
								</h3>
								<div class="space-y-2">
									<label class="setting-item">
										<span class="text-sm text-[#4a5568]">メール通知</span>
										<input type="checkbox" class="toggle" checked />
									</label>
									<label class="setting-item">
										<span class="text-sm text-[#4a5568]">SMS通知</span>
										<input type="checkbox" class="toggle" />
									</label>
									<label class="setting-item">
										<span class="text-sm text-[#4a5568]">新商品の通知</span>
										<input type="checkbox" class="toggle" checked />
									</label>
								</div>
							</div>

							<!-- プライバシー -->
							<div class="border-b border-[#e0e0e0] pb-6">
								<h3 class="mb-4 flex items-center text-sm font-semibold text-[#1a1a1a]">
									<img src="/svgs/lock.svg" alt="" class="mr-2 h-5 w-5" />
									プライバシー設定
								</h3>
								<div class="space-y-2">
									<button class="setting-btn">
										<span>パスワードを変更</span>
										{@html icons.arrow}
									</button>
									<button class="setting-btn">
										<span>2段階認証を設定</span>
										{@html icons.arrow}
									</button>
								</div>
							</div>

							<!-- データ管理 -->
							<div>
								<h3 class="mb-4 flex items-center text-sm font-semibold text-[#1a1a1a]">
									<img src="/svgs/data.svg" alt="" class="mr-2 h-5 w-5" />
									データ管理
								</h3>
								<div class="space-y-2">
									<button class="setting-btn">
										<span>ダウンロードデータ</span>
										{@html icons.arrow}
									</button>
									<button class="setting-btn text-[#e53e3e] hover:bg-[#fff5f5]">
										<span>アカウントを削除</span>
										{@html icons.arrow}
									</button>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</main>
		</div>
	</div>
</div>

<style>
	/* PocketBase 风格按钮 */
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: white;
		background-color: #2d3748;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.btn-primary:hover {
		background-color: #1a202c;
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #4a5568;
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background-color: #edf2f7;
		border-color: #cbd5e0;
	}

	.btn-link {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #4a5568;
		background-color: transparent;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-link:hover {
		background-color: #f7fafc;
		border-color: #cbd5e0;
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		color: #718096;
		background-color: transparent;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.icon-btn:hover {
		background-color: #f7fafc;
	}

	/* 输入框样式 */
	.input-display {
		padding: 0.625rem 0.75rem;
		font-size: 0.875rem;
		color: #1a1a1a;
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
	}

	/* 统计卡片 */
	.stat-card {
		padding: 1rem;
		background-color: #fafafa;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
	}

	/* 状态徽章 */
	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 9999px;
	}

	.status-success {
		color: #22543d;
		background-color: #c6f6d5;
	}

	.status-info {
		color: #2c5282;
		background-color: #bee3f8;
	}

	.status-default {
		color: #4a5568;
		background-color: #edf2f7;
	}

	/* 地址卡片 */
	.address-card {
		padding: 1.25rem;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		transition: border-color 0.2s;
	}

	.address-card:hover {
		border-color: #cbd5e0;
	}

	/* 商品卡片 */
	.product-card {
		padding: 1rem;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		transition: box-shadow 0.2s;
	}

	.product-card:hover {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	/* 设置项 */
	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background-color: #fafafa;
		border: 1px solid #e0e0e0;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.setting-item:hover {
		background-color: #f0f0f0;
	}

	.setting-btn {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #4a5568;
		text-align: left;
		background-color: #fafafa;
		border: 1px solid #e0e0e0;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.setting-btn:hover {
		background-color: #f0f0f0;
	}

	/* 开关样式 */
	.toggle {
		position: relative;
		width: 44px;
		height: 24px;
		-webkit-appearance: none;
		background: #cbd5e0;
		border-radius: 12px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.toggle:checked {
		background: #2d3748;
	}

	.toggle:before {
		content: '';
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		top: 3px;
		left: 3px;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s;
	}

	.toggle:checked:before {
		transform: translateX(20px);
	}

	/* 文字截断 */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	a {
		text-decoration: none;
	}

	/* SVG 图标大小 */
	:global(.w-5) {
		width: 1.25rem;
	}

	:global(.h-5) {
		height: 1.25rem;
	}

	:global(.w-4) {
		width: 1rem;
	}

	:global(.h-4) {
		height: 1rem;
	}
</style>
