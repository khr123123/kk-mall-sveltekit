<!-- routes/profile/components/modals/PasswordModal.svelte -->
<script lang="ts">
	import { close } from '$lib/icons/svgs';
	import { dialogStore } from '$lib/stores/dialogStore';
	import { pb } from '$lib/services/PBConfig';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let formData = $state({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	let isSubmitting = $state(false);
	let errors = $state<string[]>([]);

	function validateForm(): boolean {
		const newErrors: string[] = [];

		if (!formData.currentPassword) {
			newErrors.push('現在のパスワードを入力してください');
		}

		if (!formData.newPassword) {
			newErrors.push('新しいパスワードを入力してください');
		} else if (formData.newPassword.length < 8) {
			newErrors.push('新しいパスワードは8文字以上で入力してください');
		}

		if (!formData.confirmPassword) {
			newErrors.push('パスワード確認を入力してください');
		} else if (formData.newPassword !== formData.confirmPassword) {
			newErrors.push('新しいパスワードと確認用パスワードが一致しません');
		}

		errors = newErrors;
		return newErrors.length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) return;

		isSubmitting = true;

		try {
			// PocketBase 密码更新
			await pb.collection('users').update(pb.authStore.model?.id, {
				oldPassword: formData.currentPassword,
				password: formData.newPassword,
				passwordConfirm: formData.confirmPassword
			});

			dialogStore.alertDialog.show({
				title: '成功',
				message: 'パスワードを変更しました',
				type: 'success'
			});

			onClose();
		} catch (error: any) {
			console.error('Password change error:', error);

			let errorMessage = 'パスワードの変更に失敗しました';
			if (error?.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error?.message) {
				errorMessage = error.message;
			}

			dialogStore.alertDialog.show({
				title: 'エラー',
				message: errorMessage,
				type: 'error'
			});
		} finally {
			isSubmitting = false;
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={onClose}>
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold text-[#1a1a1a]">パスワードを変更</h3>
			<button class="icon-btn" onclick={onClose} disabled={isSubmitting}>
				{@html close}
			</button>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			{#if errors.length > 0}
				<div class="rounded-md bg-red-50 p-3">
					{#each errors as error}
						<p class="text-sm text-red-800">{error}</p>
					{/each}
				</div>
			{/if}

			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-1 block text-sm font-medium text-[#4a5568]"> 現在のパスワード </label>
				<input
					type="password"
					bind:value={formData.currentPassword}
					placeholder="現在のパスワードを入力"
					class="input-field"
					required
					disabled={isSubmitting}
				/>
			</div>

			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-1 block text-sm font-medium text-[#4a5568]"> 新しいパスワード </label>
				<input
					type="password"
					bind:value={formData.newPassword}
					placeholder="新しいパスワードを入力"
					class="input-field"
					required
					minlength="8"
					disabled={isSubmitting}
				/>
				<p class="mt-1 text-xs text-[#718096]">8文字以上で入力してください</p>
			</div>

			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-1 block text-sm font-medium text-[#4a5568]">
					新しいパスワード（確認）
				</label>
				<input
					type="password"
					bind:value={formData.confirmPassword}
					placeholder="新しいパスワードをもう一度入力"
					class="input-field"
					required
					minlength="8"
					disabled={isSubmitting}
				/>
			</div>

			<div class="password-strength">
				<div class="strength-meter">
					<div class="strength-bar"></div>
				</div>
				<div class="strength-text text-xs text-[#718096]">パスワードの強度: 弱い</div>
			</div>

			<div class="flex gap-3 pt-2">
				<button
					type="button"
					class="btn-secondary flex-1"
					onclick={onClose}
					disabled={isSubmitting}
				>
					キャンセル
				</button>
				<button type="submit" class="btn-primary flex-1" disabled={isSubmitting}>
					{isSubmitting ? '変更中...' : '変更する'}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 50;
	}

	.modal-content {
		background-color: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
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

	.icon-btn:hover:not(:disabled) {
		background-color: #f7fafc;
	}

	.icon-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.input-field {
		width: 100%;
		padding: 0.625rem 0.75rem;
		font-size: 0.875rem;
		color: #1a1a1a;
		background-color: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		transition: border-color 0.2s;
	}

	.input-field:focus {
		outline: none;
		border-color: #2d3748;
	}

	.input-field:disabled {
		background-color: #f7fafc;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.password-strength {
		margin-top: 1rem;
	}

	.strength-meter {
		height: 4px;
		background-color: #e2e8f0;
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.strength-bar {
		height: 100%;
		width: 30%;
		background-color: #e53e3e;
		border-radius: 2px;
		transition: all 0.3s;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
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

	.btn-primary:hover:not(:disabled) {
		background-color: #1a202c;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
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

	.btn-secondary:hover:not(:disabled) {
		background-color: #edf2f7;
		border-color: #cbd5e0;
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
