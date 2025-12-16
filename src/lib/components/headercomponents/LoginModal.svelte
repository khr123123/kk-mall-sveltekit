<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let show = false;
	export let onClose: () => void;
	
	const dispatch = createEventDispatcher();
	
	let email = '';
	let password = '';
	let rememberMe = false;
	let isLoading = false;
	let windowWidth = 1024; // 默认桌面宽度
	
	// 确保在客户端才执行浏览器相关的代码
	let isBrowser = false;
	
	onMount(() => {
		isBrowser = typeof window !== 'undefined';
		
		if (isBrowser) {
			windowWidth = window.innerWidth;
			window.addEventListener('resize', handleResize);
			
			if (show) {
				// 禁用背景滚动
				document.body.style.overflow = 'hidden';
			}
			
			// 只在客户端添加事件监听器
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
	
	// 监听show变化
	$: if (isBrowser && show) {
		document.body.style.overflow = 'hidden';
	} else if (isBrowser) {
		document.body.style.overflow = '';
	}
	
	// 监听窗口大小变化
	function handleResize() {
		if (isBrowser) {
			windowWidth = window.innerWidth;
		}
	}
	
	// 判断是否为移动端
	$: isMobile = isBrowser && windowWidth < 768;
	
	function handleCloseModal() {
		onClose?.();
	}
	
	async function handleLogin(e: Event) {
		e.preventDefault();
		isLoading = true;
		
		try {
			// 这里添加实际的登录逻辑
			console.log('登录信息:', { email, password, rememberMe });
			
			// 模拟API调用延迟
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// 登录成功后的处理
			const userData = {
				name: email.split('@')[0], // 示例：从邮箱提取用户名
				email: email,
				avatar: '/logo.png'
			};
			
			// 触发登录成功事件
			dispatch('loginSuccess', userData);
			
			// 关闭模态框
			onClose?.();
		} catch (error) {
			console.error('登录失败:', error);
			alert('登录失败，请重试');
		} finally {
			isLoading = false;
		}
	}
	
	function handleSocialLogin(provider: 'google' | 'github') {
		console.log(`使用 ${provider} 登录`);
		// 这里添加社交登录逻辑
		alert(`${provider} 登录功能开发中`);
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && show) {
			handleCloseModal();
		}
	}
</script>

{#if show}
	<div
		class="modal-overlay fixed inset-0 z-[60] flex items-center justify-center bg-black/50 transition-opacity duration-200 px-4"
		on:click={handleCloseModal}
		role="button"
		tabindex="0"
		aria-label="モーダルを閉じる"
		class:opacity-100={show}
		class:opacity-0={!show}
		class:pointer-events-auto={show}
		class:pointer-events-none={!show}
	>
		<div
			class="modal-content relative w-full max-w-md bg-white shadow-2xl transition-all duration-200 sm:rounded-2xl overflow-hidden flex flex-col"
			class:max-h-[90vh]={!isMobile}
			class:max-h-[100vh]={isMobile}
			class:h-[600px]={!isMobile}
			class:h-screen={isMobile}
			class:scale-100={show}
			class:scale-95={!show}
			on:click|stopPropagation
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<!-- 固定头部 -->
			<div class="modal-header flex-shrink-0 border-b border-gray-100 bg-white px-6 py-4 sm:px-8 sm:py-6">
				<div class="flex items-center justify-between">
					<h2 id="modal-title" class="text-xl font-bold text-gray-900 sm:text-2xl">ログイン</h2>
					<button
						on:click={handleCloseModal}
						class="modal-close rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
				</div>
			</div>

			<!-- 可滚动内容区域 -->
			<div class="modal-body flex-1 overflow-y-auto px-6 py-4 sm:px-8 sm:py-6">
				<form class="space-y-4" on:submit={handleLogin}>
					<div>
						<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
							メールアドレス
						</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-colors"
							placeholder="example@email.com"
							required
							disabled={isLoading}
						/>
					</div>

					<div>
						<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
							パスワード
						</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-colors"
							placeholder="••••••••"
							required
							disabled={isLoading}
						/>
					</div>

					<div class="flex items-center justify-between">
						<label class="flex items-center cursor-pointer">
							<input 
								type="checkbox" 
								bind:checked={rememberMe}
								class="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-300" 
								disabled={isLoading}
							/>
							<span class="ml-2 text-sm text-gray-600">ログイン状態を保持</span>
						</label>
						<a
							href="/forgot-password"
							class="text-sm text-gray-600 transition-colors hover:text-gray-700 hover:underline focus:outline-none focus:underline"
						>
							パスワードを忘れた方
						</a>
					</div>

					<!-- 桌面端登录按钮 -->
					<button
						type="submit"
						class="submit-button-desktop hidden w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:block"
						disabled={isLoading}
					>
						{#if isLoading}
							<span class="flex items-center justify-center">
								<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								処理中...
							</span>
						{:else}
							ログイン
						{/if}
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
							on:click={() => handleSocialLogin('google')}
							class="social-button flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
							on:click={() => handleSocialLogin('github')}
							class="social-button flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

					<p class="register-text mt-6 text-center text-sm text-gray-600">
						アカウントをお持ちでないですか？
						<a
							href="/register"
							class="font-medium text-gray-600 transition-colors hover:text-gray-700 hover:underline focus:outline-none focus:underline"
						>
							新規登録
						</a>
					</p>
				</form>
			</div>

			<!-- 移动端底部固定按钮 -->
			<div class="modal-footer flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4 sm:hidden">
				<button
					type="button"
					on:click={handleLogin}
					class="submit-button-mobile w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isLoading}
				>
					{#if isLoading}
						<span class="flex items-center justify-center">
							<svg class="animate-spin mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentContent" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						</span>
					{:else}
						<span class="flex items-center justify-center gap-2">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
							</svg>
							<span>ログイン</span>
						</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* 模态框动画 */
	.modal-overlay {
		backdrop-filter: blur(4px);
	}
	
	.modal-content {
		display: flex;
		flex-direction: column;
	}
	
	.modal-body {
		scrollbar-width: thin;
		scrollbar-color: #888 #f1f1f1;
	}
	
	/* 自定义滚动条样式 - 适用于Webkit浏览器 */
	.modal-body::-webkit-scrollbar {
		width: 8px;
	}
	
	.modal-body::-webkit-scrollbar-track {
		background: #f8f8f8;
		border-radius: 4px;
	}
	
	.modal-body::-webkit-scrollbar-thumb {
		background: #ccc;
		border-radius: 4px;
		border: 2px solid #f8f8f8;
	}
	
	.modal-body::-webkit-scrollbar-thumb:hover {
		background: #aaa;
	}
	
	/* 移动端优化 */
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
			position: sticky;
			top: 0;
			z-index: 10;
			background: white;
		}
		
		.modal-footer {
			position: sticky;
			bottom: 0;
			z-index: 10;
			background: white;
			box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
		}
		
		.modal-body {
			padding-bottom: 80px; /* 为底部按钮留出空间 */
		}
		
		.social-button {
			padding-left: 1rem;
			padding-right: 1rem;
		}
		
		.social-button svg {
			flex-shrink: 0;
		}
	}
	
	/* 小屏幕平板优化 */
	@media (min-width: 640px) and (max-width: 767px) {
		.modal-content {
			max-height: 90vh;
			border-radius: 16px;
		}
		
		.modal-overlay {
			align-items: center;
		}
	}
	
	/* 桌面端优化 */
	@media (min-width: 768px) {
		.modal-body {
			max-height: calc(600px - 120px); /* 总高度600px - 头部和底部高度 */
		}
		
		.social-button {
			padding: 0.75rem 1.5rem;
		}
	}
	
	/* 平板端优化 */
	@media (min-width: 768px) and (max-width: 1023px) {
		.modal-content {
			max-width: 28rem;
		}
		
		.modal-header,
		.modal-body,
		.modal-footer {
			padding-left: 1.5rem;
			padding-right: 1.5rem;
		}
	}
	
	/* 防止移动端输入框被键盘遮挡 */
	@media (max-width: 767px) {
		.modal-content {
			max-height: calc(100vh - env(safe-area-inset-bottom));
		}
		
		.modal-body {
			-webkit-overflow-scrolling: touch;
		}
	}
	
	/* 安全区域适配 */
	@supports (padding: max(0px)) {
		.modal-footer {
			padding-bottom: max(16px, env(safe-area-inset-bottom));
		}
	}
</style>