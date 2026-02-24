<script lang="ts">
	import { pbService } from '$lib/services/userService';
	import { goto } from '$app/navigation';

	// ページ状態: 'request' | 'sent' | 'reset'
	let pageMode = $state<'request' | 'sent'>('request');

	// フォームデータ
	let email = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	// メール送信処理
	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email.trim()) {
			errorMessage = 'メールアドレスを入力してください';
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			errorMessage = '有効なメールアドレスを入力してください';
			return;
		}

		isLoading = true;
		errorMessage = '';
		successMessage = '';

		try {
			const result = await pbService.requestPasswordReset(email);
			if (result.success) {
				pageMode = 'sent';
			} else {
				errorMessage = result.error || 'メール送信に失敗しました。もう一度お試しください。';
			}
		} catch (error) {
			console.error('Password reset error:', error);
			errorMessage = 'エラーが発生しました。もう一度お試しください。';
		} finally {
			isLoading = false;
		}
	}

	function handleResend() {
		pageMode = 'request';
		email = '';
		errorMessage = '';
		successMessage = '';
	}
</script>

<svelte:head>
	<title>パスワードをお忘れの方 | KK Mall</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<!-- ロゴ / ブランド -->
		<div class="mb-8 text-center">
			<a href="/" class="inline-block text-2xl font-bold text-gray-900">KK Mall</a>
			<p class="mt-1 text-sm text-gray-500">オンラインショッピング</p>
		</div>

		{#if pageMode === 'request'}
			<!-- パスワードリセット申請フォーム -->
			<div class="overflow-hidden rounded-2xl bg-white shadow-xl">
				<!-- ヘッダー -->
				<div class="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 text-white">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
								/>
							</svg>
						</div>
						<div>
							<h1 class="text-xl font-bold">パスワードをお忘れですか？</h1>
							<p class="text-sm text-white/80">リセットリンクをメールで送信します</p>
						</div>
					</div>
				</div>

				<!-- フォーム本体 -->
				<div class="px-8 py-6">
					<p class="mb-6 text-sm text-gray-600">
						ご登録のメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
					</p>

					<!-- エラーメッセージ -->
					{#if errorMessage}
						<div
							class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
						>
							<svg class="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{errorMessage}</span>
						</div>
					{/if}

					<form onsubmit={handleSubmit} class="space-y-5">
						<div>
							<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
								メールアドレス
							</label>
							<div class="relative">
								<div
									class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"
								>
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
										/>
									</svg>
								</div>
								<input
									id="email"
									type="email"
									bind:value={email}
									class="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none disabled:bg-gray-50"
									placeholder="example@email.com"
									required
									disabled={isLoading}
									autocomplete="email"
								/>
							</div>
						</div>

						<button
							type="submit"
							class="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							disabled={isLoading}
						>
							{#if isLoading}
								<svg
									class="h-4 w-4 animate-spin"
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
								<span>送信中...</span>
							{:else}
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<span>リセットリンクを送信</span>
							{/if}
						</button>
					</form>

					<!-- セパレーター -->
					<div class="relative my-6">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-gray-200"></div>
						</div>
						<div class="relative flex justify-center text-xs">
							<span class="bg-white px-3 text-gray-500">または</span>
						</div>
					</div>

					<!-- ログインに戻る -->
					<div class="text-center">
						<p class="text-sm text-gray-600">
							パスワードを思い出した場合は
							<a
								href="/"
								class="font-medium text-gray-900 hover:underline"
								onclick={(e) => { e.preventDefault(); history.back(); }}
							>
								ログインページへ
							</a>
						</p>
					</div>
				</div>
			</div>

		{:else}
			<!-- 送信完了画面 -->
			<div class="overflow-hidden rounded-2xl bg-white shadow-xl">
				<div class="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div>
							<h1 class="text-xl font-bold">メールを送信しました</h1>
							<p class="text-sm text-white/80">受信箱をご確認ください</p>
						</div>
					</div>
				</div>

				<div class="px-8 py-8">
					<!-- メールアイコン -->
					<div class="mb-6 flex justify-center">
						<div
							class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"
						>
							<svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						</div>
					</div>

					<div class="mb-6 text-center">
						<h2 class="mb-2 text-lg font-semibold text-gray-900">メールをご確認ください</h2>
						<p class="text-sm text-gray-600">
							<span class="font-medium text-gray-800">{email}</span>
							にパスワードリセット用のリンクを送信しました。
						</p>
					</div>

					<!-- 注意事項 -->
					<div class="mb-6 rounded-lg bg-blue-50 p-4">
						<ul class="space-y-2 text-sm text-blue-800">
							<li class="flex items-start gap-2">
								<svg
									class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clip-rule="evenodd"
									/>
								</svg>
								<span>リンクの有効期限は24時間です</span>
							</li>
							<li class="flex items-start gap-2">
								<svg
									class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clip-rule="evenodd"
									/>
								</svg>
								<span>迷惑メールフォルダもご確認ください</span>
							</li>
							<li class="flex items-start gap-2">
								<svg
									class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clip-rule="evenodd"
									/>
								</svg>
								<span>メールが届かない場合は、再送信できます</span>
							</li>
						</ul>
					</div>

					<div class="space-y-3">
						<button
							onclick={handleResend}
							class="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
						>
							別のメールアドレスで再試行
						</button>
						<a
							href="/"
							class="flex w-full items-center justify-center rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
						>
							ホームに戻る
						</a>
					</div>
				</div>
			</div>
		{/if}

		<!-- フッターリンク -->
		<div class="mt-6 text-center text-xs text-gray-500">
			<a href="/terms" class="hover:text-gray-700 hover:underline">利用規約</a>
			<span class="mx-2">·</span>
			<a href="/privacy" class="hover:text-gray-700 hover:underline">プライバシーポリシー</a>
			<span class="mx-2">·</span>
			<a href="/support" class="hover:text-gray-700 hover:underline">サポート</a>
		</div>
	</div>
</main>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	main > div {
		animation: fadeIn 0.3s ease-out;
	}
</style>
