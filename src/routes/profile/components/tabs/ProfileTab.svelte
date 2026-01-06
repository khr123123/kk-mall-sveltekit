<!-- routes/profile/components/tabs/ProfileTab.svelte -->
<script lang="ts">
    import type { User } from '$lib/types/profile';
    import { editProfile } from '$lib/icons/svgs';
    import StatCard from '../cards/StatCard.svelte';

    interface Props {
        user: User;
        userStats: {
            totalOrders: number;
            totalFavorites: number;
            totalAddresses: number;
        };
    }

    let { user, userStats }: Props = $props();
</script>

<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
    <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-[#1a1a1a]">プロフィール</h2>
        <button class="btn-secondary">
            {@html editProfile}
            <span>編集</span>
        </button>
    </div>

    <div class="space-y-6">
        <!-- 个人信息 -->
        <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="block text-sm font-medium text-[#4a5568]">お名前</label>
                <div class="input-display">{user.name}</div>
            </div>
            <div class="space-y-2">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="block text-sm font-medium text-[#4a5568]">メールアドレス</label>
                <div class="input-display">{user.email}</div>
            </div>
            <div class="space-y-2">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="block text-sm font-medium text-[#4a5568]">会員ランク</label>
                <div class="input-display flex items-center gap-2">
					<span class="rounded bg-[#2d3748] px-2 py-1 text-xs font-semibold text-white">
						{user.memberLevel || 'ゴールド会員'}
					</span>
                    <span class="text-sm text-[#718096]">
						{(user.points || 1250).toLocaleString('ja-JP')} ポイント
					</span>
                </div>
            </div>
            <div class="space-y-2">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="block text-sm font-medium text-[#4a5568]">会員登録日</label>
                <div class="input-display">
                    {new Date(user.created).toLocaleDateString('ja-JP')}
                </div>
            </div>
        </div>

        <!-- 统计数据 -->
        <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard value={userStats.totalOrders} label="総注文数" />
            <StatCard value={userStats.totalFavorites} label="お気に入り" />
            <StatCard value={userStats.totalAddresses} label="登録住所" />
            <StatCard value="97%" label="配信成功率" />
        </div>
    </div>
</div>

<style>
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

    .input-display {
        padding: 0.625rem 0.75rem;
        font-size: 0.875rem;
        color: #1a1a1a;
        background-color: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
    }
</style>