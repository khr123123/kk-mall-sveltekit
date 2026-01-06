<!-- routes/profile/components/tabs/SettingsTab.svelte -->
<script lang="ts">
	import { arrow } from '$lib/icons/svgs';
	import PasswordModal from '../modals/PasswordModal.svelte';
	import TwoFactorModal from '../modals/TwoFactorModal.svelte';

	let showPasswordModal = $state(false);
	let showTwoFactorModal = $state(false);
	let notifications = $state({
		email: true,
		sms: false,
		newProducts: true
	});

	function toggleNotification(type: keyof typeof notifications) {
		notifications[type] = !notifications[type];
	}
</script>

<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
	<h2 class="mb-6 text-xl font-semibold text-[#1a1a1a]">設定</h2>

	<div class="space-y-6">
		<!-- 通知设置 -->
		<div class="border-b border-[#e0e0e0] pb-6">
			<h3 class="mb-4 text-sm font-semibold text-[#1a1a1a]">通知設定</h3>
			<div class="space-y-2">
				<label class="setting-item" onclick={() => toggleNotification('email')}>
					<span class="text-sm text-[#4a5568]">メール通知</span>
					<input type="checkbox" class="toggle" checked={notifications.email} />
				</label>
				<label class="setting-item" onclick={() => toggleNotification('sms')}>
					<span class="text-sm text-[#4a5568]">SMS通知</span>
					<input type="checkbox" class="toggle" checked={notifications.sms} />
				</label>
				<label class="setting-item" onclick={() => toggleNotification('newProducts')}>
					<span class="text-sm text-[#4a5568]">新商品の通知</span>
					<input type="checkbox" class="toggle" checked={notifications.newProducts} />
				</label>
			</div>
		</div>

		<!-- プライバシー -->
		<div class="border-b border-[#e0e0e0] pb-6">
			<h3 class="mb-4 text-sm font-semibold text-[#1a1a1a]">プライバシー設定</h3>
			<div class="space-y-2">
				<button class="setting-btn" onclick={() => (showPasswordModal = true)}>
					<span>パスワードを変更</span>
					{@html arrow}
				</button>
				<button class="setting-btn" onclick={() => (showTwoFactorModal = true)}>
					<span>2段階認証を設定</span>
					{@html arrow}
				</button>
			</div>
		</div>

		<!-- データ管理 -->
		<div>
			<h3 class="mb-4 text-sm font-semibold text-[#1a1a1a]">データ管理</h3>
			<div class="space-y-2">
				<button class="setting-btn">
					<span>ダウンロードデータ</span>
					{@html arrow}
				</button>
				<button class="setting-btn text-[#e53e3e] hover:bg-[#fff5f5]">
					<span>アカウントを削除</span>
					{@html arrow}
				</button>
			</div>
		</div>
	</div>
</div>

{#if showPasswordModal}
	<PasswordModal onClose={() => (showPasswordModal = false)} />
{/if}

{#if showTwoFactorModal}
	<TwoFactorModal onClose={() => (showTwoFactorModal = false)} />
{/if}

<style>
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

	.toggle {
		position: relative;
		width: 44px;
		height: 24px;
		-webkit-appearance: none;
		appearance: none;
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
</style>
