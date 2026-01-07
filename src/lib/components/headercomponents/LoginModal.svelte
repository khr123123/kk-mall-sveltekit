<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { userStore } from '$lib/stores/userStore';

	export let show = false;
	export let onClose: () => void;

	const dispatch = createEventDispatcher();

	// 表单模式：'login' | 'register'
	let mode: 'login' | 'register' = 'login';

	// 登录表单
	let loginEmail = '';
	let loginPassword = '';
	let rememberMe = false;

	// 注册表单
	let registerName = '';
	let registerEmail = '';
	let registerPassword = '';
	let registerPasswordConfirm = '';
	let agreeTerms = false;

	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';
	let windowWidth = 1024;
	let isBrowser = false;

	onMount(() => {
		isBrowser = typeof window !== 'undefined';

		if (isBrowser) {
			windowWidth = window.innerWidth;
			window.addEventListener('resize', handleResize);

			if (show) {
				document.body.style.overflow = 'hidden';
			}

			document.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (isBrowser) {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = '';
		}
	});

	$: if (isBrowser && show) {
		document.body.style.overflow = 'hidden';
	} else if (isBrowser) {
		document.body.style.overflow = '';
	}

	$: isMobile = isBrowser && windowWidth < 768;

	// 切换模式时重置表单
	$: if (mode) {
		resetForm();
	}

	function handleResize() {
		if (isBrowser) {
			windowWidth = window.innerWidth;
		}
	}

	function resetForm() {
		errorMessage = '';
		successMessage = '';
		loginEmail = '';
		loginPassword = '';
		registerName = '';
		registerEmail = '';
		registerPassword = '';
		registerPasswordConfirm = '';
		rememberMe = false;
		agreeTerms = false;
	}

	function switchMode() {
		mode = mode === 'login' ? 'register' : 'login';
	}

	function handleCloseModal() {
		resetForm();
		onClose?.();
	}

	async function handleLogin(e: Event) {
		e.preventDefault();
		isLoading = true;
		errorMessage = '';
		successMessage = '';

		try {
			const result = await userStore.login(loginEmail, loginPassword);

			if (result.success) {
				successMessage = 'ログインに成功しました！';
				dispatch('loginSuccess', result.user);

				setTimeout(() => {
					handleCloseModal();
				}, 1000);
			} else {
				errorMessage = result.error || 'ログインに失敗しました';
			}
		} catch (error) {
			console.error('登录错误:', error);
			errorMessage = 'ログインに失敗しました。もう一度お試しください。';
		} finally {
			isLoading = false;
		}
	}

	async function handleRegister(e: Event) {
		e.preventDefault();
		isLoading = true;
		errorMessage = '';
		successMessage = '';

		// 验证密码
		if (registerPassword !== registerPasswordConfirm) {
			errorMessage = 'パスワードが一致しません';
			isLoading = false;
			return;
		}

		// 验证密码长度
		if (registerPassword.length < 8) {
			errorMessage = 'パスワードは8文字以上である必要があります';
			isLoading = false;
			return;
		}

		// 验证条款
		if (!agreeTerms) {
			errorMessage = '利用規約に同意してください';
			isLoading = false;
			return;
		}

		try {
			const result = await userStore.register(
				registerEmail,
				registerPassword,
				registerPasswordConfirm,
				registerName
			);

			if (result.success) {
				successMessage = '登録に成功しました！ログイン中...';
				dispatch('registerSuccess', result.user);

				setTimeout(() => {
					handleCloseModal();
				}, 1500);
			} else {
				errorMessage = result.error || '登録に失敗しました';
			}
		} catch (error) {
			console.error('注册错误:', error);
			errorMessage = '登録に失敗しました。もう一度お試しください。';
		} finally {
			isLoading = false;
		}
	}

	async function handleSocialLogin(provider: 'google' | 'github') {
		isLoading = true;
		errorMessage = '';

		try {
			const result = await userStore.loginWithOAuth(provider);

			if (result.success) {
				successMessage = `${provider}でログインしました！`;
				dispatch('loginSuccess', result.user);

				setTimeout(() => {
					handleCloseModal();
				}, 1000);
			} else {
				errorMessage = result.error || `${provider}ログインに失敗しました`;
			}
		} catch (error) {
			console.error(`${provider}登录错误:`, error);
			errorMessage = `${provider}ログインに失敗しました`;
		} finally {
			isLoading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && show) {
			handleCloseModal();
		}
	}
</script>

{#if show}
	<div
		class="modal-overlay fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-opacity duration-200"
		onclick={handleCloseModal}
		role="button"
		tabindex="0"
		aria-label="モーダルを閉じる"
		class:opacity-100={show}
		class:pointer-events-auto={show}
	>
		<div
			class="modal-content relative flex w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl transition-all duration-200 sm:rounded-2xl"
			class:max-h-[90vh]={!isMobile}
			class:max-h-[100vh]={isMobile}
			class:min-h-[600px]={!isMobile}
			class:h-screen={isMobile}
			class:scale-100={show}
            onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<!-- 固定头部 -->
			<div class="modal-header flex-shrink-0 border-b border-gray-200 bg-white px-6 py-5 sm:px-8">
				<div class="flex items-center justify-between">
					<!-- 模式切换标签 -->
					<div class="flex w-full border-b border-gray-200">
						<button
							type="button"
							class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all"
							class:bg-gray-300={mode === 'login'}
							class:text-gray-900={mode === 'login'}
							class:shadow-sm={mode === 'login'}
							class:text-gray-600={mode !== 'login'}
							onclick={() => (mode = 'login')}
						>
							ログイン
						</button>
						<button
							type="button"
							class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all"
							class:bg-gray-300={mode === 'register'}
							class:text-gray-900={mode === 'register'}
							class:shadow-sm={mode === 'register'}
							class:text-gray-600={mode !== 'register'}
							onclick={() => (mode = 'register')}
						>
							新規登録
						</button>
					</div>
					<button
						onclick={handleCloseModal}
						class="ml-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
						aria-label="閉じる"
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
				</div>
			</div>

			<!-- 可滚动内容区域 -->
			<div class="modal-body flex-1 overflow-y-auto px-6 py-4 sm:px-8 sm:py-6">
				<!-- 错误/成功消息 -->
				{#if errorMessage}
					<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
						<div class="flex items-center gap-2">
							<svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{errorMessage}</span>
						</div>
					</div>
				{/if}

				{#if successMessage}
					<div
						class="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
					>
						<div class="flex items-center gap-2">
							<svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{successMessage}</span>
						</div>
					</div>
				{/if}

				{#if mode === 'login'}
					<!-- 登录表单 -->
					<form class="space-y-4" onsubmit={handleLogin}>
						<div>
							<label for="login-email" class="mb-2 block text-sm font-medium text-gray-700">
								メールアドレス
							</label>
							<input
								id="login-email"
								type="email"
								bind:value={loginEmail}
								class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
								placeholder="example@email.com"
								required
								disabled={isLoading}
							/>
						</div>

						<div>
							<label for="login-password" class="mb-2 block text-sm font-medium text-gray-700">
								パスワード
							</label>
							<input
								id="login-password"
								type="password"
								bind:value={loginPassword}
								class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
								placeholder="••••••••"
								required
								disabled={isLoading}
							/>
						</div>

						<div class="flex items-center justify-between">
							<label class="flex cursor-pointer items-center">
								<input
									type="checkbox"
									bind:checked={rememberMe}
									class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
									disabled={isLoading}
								/>
								<span class="ml-2 text-sm text-gray-600">ログイン状態を保持</span>
							</label>
							<a
								href="/forgot-password"
								class="text-sm text-gray-600 transition-colors hover:text-gray-900 hover:underline"
							>
								パスワードを忘れた
							</a>
						</div>

						<button
							type="submit"
							class="hidden w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:block"
							disabled={isLoading}
						>
							{#if isLoading}
								<span class="flex items-center justify-center">
									<svg
										class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									処理中...
								</span>
							{:else}
								ログイン
							{/if}
						</button>
					</form>
				{:else}
					<!-- 注册表单 -->
					<form class="space-y-4" onsubmit={handleRegister}>
						<div>
							<label for="register-name" class="mb-2 block text-sm font-medium text-gray-700">
								名前
							</label>
							<input
								id="register-name"
								type="text"
								bind:value={registerName}
								class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
								placeholder="山田太郎"
								required
								disabled={isLoading}
							/>
						</div>

						<div>
							<label for="register-email" class="mb-2 block text-sm font-medium text-gray-700">
								メールアドレス
							</label>
							<input
								id="register-email"
								type="email"
								bind:value={registerEmail}
								class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
								placeholder="example@email.com"
								required
								disabled={isLoading}
							/>
						</div>

						<div>
							<label for="register-password" class="mb-2 block text-sm font-medium text-gray-700">
								パスワード
							</label>
							<input
								id="register-password"
								type="password"
								bind:value={registerPassword}
								class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
								placeholder="8文字以上"
								required
								minlength="8"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								for="register-password-confirm"
								class="mb-2 block text-sm font-medium text-gray-700"
							>
								パスワード（確認）
							</label>
							<input
								id="register-password-confirm"
								type="password"
								bind:value={registerPasswordConfirm}
								class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
								placeholder="パスワードを再入力"
								required
								minlength="8"
								disabled={isLoading}
							/>
						</div>

						<label class="flex cursor-pointer items-start">
							<input
								type="checkbox"
								bind:checked={agreeTerms}
								class="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
								disabled={isLoading}
								required
							/>
							<span class="ml-2 text-sm text-gray-600">
								<a href="/terms" class="text-gray-900 hover:underline">利用規約</a>
								および
								<a href="/privacy" class="text-gray-900 hover:underline">プライバシーポリシー</a>
								に同意します
							</span>
						</label>

						<button
							type="submit"
							class="hidden w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:block"
							disabled={isLoading}
						>
							{#if isLoading}
								<span class="flex items-center justify-center">
									<svg
										class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									登録中...
								</span>
							{:else}
								アカウントを作成
							{/if}
						</button>
					</form>
				{/if}

				<div class="divider relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-2 text-gray-500">または</span>
					</div>
				</div>

				<!-- 社交登录按钮 -->
				<div class="social-login space-y-3">
					<button
						type="button"
						onclick={() => handleSocialLogin('google')}
						class="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isLoading}
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
						<span class="hidden sm:inline">Googleで続ける</span>
						<span class="sm:hidden">Google</span>
					</button>
					<button
						type="button"
						onclick={() => handleSocialLogin('github')}
						class="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isLoading}
					>
						<svg class="h-5 w-5" fill="#000000" viewBox="0 0 24 24">
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
						<span class="hidden sm:inline">GitHubで続ける</span>
						<span class="sm:hidden">GitHub</span>
					</button>
				</div>
			</div>

			<!-- 移动端底部固定按钮 -->
			<div class="modal-footer flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4 sm:hidden">
				<button
					type="button"
					onclick={mode === 'login' ? handleLogin : handleRegister}
					class="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					disabled={isLoading}
				>
					{#if isLoading}
						<span class="flex items-center justify-center">
							<svg class="mr-2 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						</span>
					{:else}
						{mode === 'login' ? 'ログイン' : 'アカウントを作成'}
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		backdrop-filter: blur(4px);
	}

	.modal-content {
		display: flex;
		flex-direction: column;
	}

	.modal-body {
		scrollbar-width: thin;
		scrollbar-color: #999 #f5f5f5;
	}

	.modal-body::-webkit-scrollbar {
		width: 8px;
	}

	.modal-body::-webkit-scrollbar-track {
		background: #f5f5f5;
		border-radius: 4px;
	}

	.modal-body::-webkit-scrollbar-thumb {
		background: #999;
		border-radius: 4px;
		border: 2px solid #f5f5f5;
	}

	.modal-body::-webkit-scrollbar-thumb:hover {
		background: #666;
	}

	@media (max-width: 767px) {
		.modal-content {
			width: 100%;
			max-width: none;
			border-radius: 0;
		}

		.modal-overlay {
			padding: 0;
			align-items: flex-end;
		}

		.modal-header {
			position :sticky;
			top: 0;
			z-index: 10;
			background: white;
		}

		.modal-footer {
			position :sticky;
			bottom: 0;
			z-index: 10;
			background: white;
			box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
		}
	}

	@supports (padding: max(0px)) {
		.modal-footer {
			padding-bottom: max(16px, env(safe-area-inset-bottom));
		}
	}
</style>
