<!-- routes/profile/components/ProfileSidebar.svelte -->
<script lang="ts">
    import type {User} from '$lib/types/profile';
    import {
        addresses as addressesIcon,
        camera,
        favorites as favoritesIcon,
        logout,
        orders as ordersIcon,
        profile,
        settings,
        support
    } from '$lib/icons/svgs';
    import {userStore} from '$lib/stores/userStore';

    interface Props {
        user: User;
        currentTab: string;
        userStats?: { totalOrders: number; totalFavorites: number };
        onChangeTab: (tabId: string) => void;
        onAvatarClick: () => void;
    }

    let {user, currentTab, userStats, onChangeTab, onAvatarClick}: Props = $props();

    const menuItems = [
        {id: 'profile', label: 'プロフィール', icon: profile},
        {id: 'orders', label: '注文履歴', icon: ordersIcon},
        {id: 'addresses', label: '住所管理', icon: addressesIcon},
        {id: 'favorites', label: 'お気に入り', icon: favoritesIcon},
        {id: 'settings', label: '設定', icon: settings}
    ];

    function handleLogout() {
        userStore.logout();
    }
</script>

<aside class="sidebar">
    <div class="sidebar-sticky">
        <!-- ユーザー情報カード -->
        <div class="user-card">
            <div class="user-card-header">
                <div class="user-avatar-wrapper">
                    <img alt={user.name} class="user-avatar" src={user.avatar || '/logo.png'}/>
                    <button class="avatar-edit-btn" onclick={onAvatarClick} title="アバターを変更">
                        {@html camera}
                    </button>
                </div>
                <div class="user-info">
                    <h3 class="user-name">{user.name}</h3>
                    <p class="user-email">{user.email}</p>
                </div>
            </div>

            <div class="user-stats">
                <div class="user-stats-content">
                    <div class="user-stats-item">
                        <div class="user-stats-label">会員ランク</div>
                        <div class="user-stats-value">{user.memberLevel || 'ゴールド会員'}</div>
                    </div>
                    <div class="user-stats-item">
                        <div class="user-stats-label">ポイント</div>
                        <div class="user-stats-points">{(user.points || 1250).toLocaleString('ja-JP')}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ナビゲーションメニュー -->
        <nav class="nav-menu">
            <div class="nav-menu-items">
                {#each menuItems as item}
                    <button
                            class="nav-item"
                            class:nav-item-active={currentTab === item.id}
                            onclick={() => onChangeTab(item.id)}
                    >
                        <span class="nav-item-icon">{@html item.icon}</span>
                        <span class="nav-item-label">{item.label}</span>
                        {#if item.id === 'orders' && userStats && userStats.totalOrders > 0}
                            <span class="nav-item-badge">{userStats.totalOrders}</span>
                        {/if}
                        {#if item.id === 'favorites' && userStats && userStats.totalFavorites > 0}
                            <span class="nav-item-badge">{userStats.totalFavorites}</span>
                        {/if}
                    </button>
                {/each}
            </div>
        </nav>

        <!-- クイックリンク -->
        <div class="quick-links">
            <a class="quick-link" href="/support">
                {@html support}
                <span>サポート</span>
            </a>
            <button class="quick-link quick-link-danger" onclick={handleLogout}>
                {@html logout}
                <span>ログアウト</span>
            </button>
        </div>
    </div>
</aside>

<style>
    .sidebar {
        flex-shrink: 0;
        width: 100%;
    }

    @media (min-width: 1024px) {
        .sidebar {
            width: 16rem;
        }
    }

    .sidebar-sticky {
        position: sticky;
        top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    /* ユーザーカード */
    .user-card {
        padding: 1.25rem;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 0.5rem;
    }

    .user-card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
    }

    .user-avatar-wrapper {
        position: relative;
        flex-shrink: 0;
    }

    .user-avatar {
        width: 3rem;
        height: 3rem;
        border-radius: 9999px;
        border: 2px solid #e0e0e0;
        object-fit: cover;
    }

    .avatar-edit-btn {
        position: absolute;
        right: -0.25rem;
        bottom: -0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        color: white;
        background: #2d3748;
        border: none;
        border-radius: 9999px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .avatar-edit-btn:hover {
        background: #1a202c;
        transform: scale(1.1);
    }

    .user-info {
        flex: 1;
        overflow: hidden;
    }

    .user-name {
        font-size: 1rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 0.25rem 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .user-email {
        font-size: 0.75rem;
        color: #666;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .user-stats {
        padding: 0.875rem 1rem;
        background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
        border-radius: 0.5rem;
        color: white;
    }

    .user-stats-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .user-stats-item {
        text-align: center;
    }

    .user-stats-label {
        font-size: 0.75rem;
        color: #a0aec0;
        margin-bottom: 0.25rem;
    }

    .user-stats-value {
        font-size: 0.875rem;
        font-weight: 600;
    }

    .user-stats-points {
        font-size: 1.125rem;
        font-weight: 700;
    }

    /* ナビゲーションメニュー */
    .nav-menu {
        padding: 0.5rem;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 0.5rem;
    }

    .nav-menu-items {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #4a5568;
        text-align: left;
        background: transparent;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .nav-item:hover {
        background: #f7fafc;
        color: #2d3748;
    }

    .nav-item-active {
        background: #2d3748;
        color: white;
    }

    .nav-item-active:hover {
        background: #1a202c;
    }

    .nav-item-icon {
        display: flex;
        flex-shrink: 0;
    }

    .nav-item-label {
        flex: 1;
    }

    .nav-item-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.5rem;
        height: 1.5rem;
        padding: 0 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        background: #718096;
        color: white;
        border-radius: 9999px;
    }

    .nav-item-active .nav-item-badge {
        background: rgba(255, 255, 255, 0.2);
    }

    /* クイックリンク */
    .quick-links {
        padding: 0.5rem;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 0.5rem;
    }

    .quick-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.625rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #4a5568;
        text-decoration: none;
        background: transparent;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .quick-link:hover {
        background: #f7fafc;
        color: #2d3748;
    }

    .quick-link-danger {
        color: #e53e3e;
    }

    .quick-link-danger:hover {
        background: #fff5f5;
        color: #c53030;
    }

    :global(.avatar-edit-btn svg) {
        width: 0.875rem;
        height: 0.875rem;
    }

    :global(.nav-item-icon svg) {
        width: 1.125rem;
        height: 1.125rem;
    }

    :global(.quick-link svg) {
        width: 1rem;
        height: 1rem;
    }
</style>