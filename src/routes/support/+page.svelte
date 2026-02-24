<script lang="ts">
	import { userStore } from '$lib/stores/userStore';

	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let category = $state('general');
	let isSubmitting = $state(false);
	let submitStatus = $state<'idle' | 'success' | 'error'>('idle');

	const categories = [
		{ id: 'general', label: '一般的なお問い合わせ' },
		{ id: 'order', label: '注文・配送について' },
		{ id: 'return', label: '返品・返金について' },
		{ id: 'account', label: 'アカウントについて' },
		{ id: 'payment', label: '決済・支払いについて' },
		{ id: 'product', label: '商品について' },
		{ id: 'technical', label: '技術的な問題' },
		{ id: 'other', label: 'その他' }
	];

	const faqs = [
		{
			q: '注文後のキャンセルはできますか？',
			a: '発送前であればキャンセル可能です。マイページの注文履歴からキャンセル手続きを行うか、サポートまでご連絡ください。'
		},
		{
			q: '返品・返金の手続き方法を教えてください',
			a: '商品到着後7日以内に、未開封・未使用状態の商品に限り返品を受け付けています。マイページの注文詳細から返金申請が可能です。'
		},
		{
			q: 'パスワードを忘れてしまいました',
			a: 'ログインページの「パスワードを忘れた」リンクから、登録メールアドレスに再設定リンクを送信できます。'
		},
		{
			q: '配送はいつ届きますか？',
			a: '通常、ご注文から2〜5営業日でお届けします。在庫状況や配送先により異なる場合があります。'
		},
		{
			q: 'PayPayで決済できますか？',
			a: 'はい、PayPayでのお支払いに対応しています。チェックアウト時にPayPayを選択してください。'
		},
		{
			q: '領収書は発行できますか？',
			a: 'マイページの注文履歴から領収書（PDF）をダウンロードいただけます。'
		}
	];

	// 展開中のFAQ
	let openFaqIndex = $state<number | null>(null);

	function toggleFaq(index: number) {
		openFaqIndex = openFaqIndex === index ? null : index;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name || !email || !subject || !message) return;

		isSubmitting = true;

		// 実際の送信はバックエンド連携が必要。ここではモック
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// モック成功レスポンス
		submitStatus = 'success';
		isSubmitting = false;

		// フォームリセット
		name = '';
		email = '';
		subject = '';
		message = '';
		category = 'general';
	}

	// ユーザー情報の自動入力
	const user = $userStore;
	$effect(() => {
		if (user.user && !name) {
			name = user.user.name || '';
			email = user.user.email || '';
		}
	});
</script>

<svelte:head>
	<title>カスタマーサポート | KK Mall</title>
</svelte:head>

<main class="min-h-screen bg-gray-50">
	<!-- ヘッダー -->
	<section class="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
		<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
				<div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
					<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
				</div>
				<div>
					<h1 class="text-2xl font-bold sm:text-3xl">カスタマーサポート</h1>
					<p class="mt-1 text-white/80">お気軽にお問い合わせください</p>
				</div>
			</div>

			<!-- クイックリンク -->
			<div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
				{#each [
					{ icon: '📦', label: '注文追跡', href: '/profile/orders' },
					{ icon: '🔄', label: '返品申請', href: '/profile/orders' },
					{ icon: '👤', label: 'マイページ', href: '/profile/profile' },
					{ icon: '🔑', label: 'パスワードリセット', href: '/forgot-password' }
				] as link}
					<a
						href={link.href}
						class="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm transition-colors hover:bg-white/20"
					>
						<span>{link.icon}</span>
						<span>{link.label}</span>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid gap-8 lg:grid-cols-3">
			<!-- 連絡先情報 (左カラム) -->
			<div class="space-y-5 lg:col-span-1">
				<!-- 営業時間 -->
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<h2 class="mb-4 text-base font-semibold text-gray-900">サポート受付時間</h2>
					<div class="space-y-3 text-sm">
						<div class="flex items-start gap-3">
							<div
								class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<div>
								<p class="font-medium text-gray-900">メール</p>
								<a
									href="mailto:KKMallINFO@gmail.com"
									class="text-gray-600 hover:text-gray-900 hover:underline"
								>
									KKMallINFO@gmail.com
								</a>
								<p class="text-xs text-gray-500 mt-1">24時間受付 / 返信: 1〜2営業日</p>
							</div>
						</div>

						<div class="flex items-start gap-3">
							<div
								class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
									/>
								</svg>
							</div>
							<div>
								<p class="font-medium text-gray-900">電話</p>
								<p class="text-gray-600">03-1234-5678</p>
								<p class="text-xs text-gray-500 mt-1">平日 9:00〜18:00</p>
							</div>
						</div>
					</div>
				</div>

				<!-- 平均応答時間 -->
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<h2 class="mb-4 text-base font-semibold text-gray-900">平均応答時間</h2>
					<div class="space-y-3">
						{#each [
							{ label: 'メール', time: '24時間以内', color: 'green' },
							{ label: '電話', time: '即時', color: 'blue' },
							{ label: '緊急対応', time: '4時間以内', color: 'red' }
						] as item}
							<div class="flex items-center justify-between">
								<span class="text-sm text-gray-600">{item.label}</span>
								<span
									class="rounded-full px-2.5 py-0.5 text-xs font-medium
									{item.color === 'green' ? 'bg-green-100 text-green-700' : ''}
									{item.color === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
									{item.color === 'red' ? 'bg-red-100 text-red-700' : ''}"
								>
									{item.time}
								</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- 関連リンク -->
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<h2 class="mb-4 text-base font-semibold text-gray-900">関連ページ</h2>
					<ul class="space-y-2 text-sm">
						{#each [
							{ href: '/terms', label: '利用規約' },
							{ href: '/privacy', label: 'プライバシーポリシー' },
							{ href: '/about', label: '会社情報' },
							{ href: '/profile/orders', label: '注文履歴' }
						] as link}
							<li>
								<a
									href={link.href}
									class="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
								>
									<svg
										class="h-3.5 w-3.5 text-gray-400"
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
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<!-- メインコンテンツ (右カラム) -->
			<div class="space-y-8 lg:col-span-2">
				<!-- FAQ セクション -->
				<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-5 text-lg font-semibold text-gray-900">よくあるご質問</h2>
					<div class="divide-y divide-gray-200">
						{#each faqs as faq, index}
							<div class="py-3">
								<button
									onclick={() => toggleFaq(index)}
									class="flex w-full items-center justify-between gap-4 text-left"
								>
									<span class="text-sm font-medium text-gray-900">{faq.q}</span>
									<svg
										class="h-4 w-4 flex-shrink-0 text-gray-500 transition-transform {openFaqIndex === index ? 'rotate-180' : ''}"
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
								{#if openFaqIndex === index}
									<p class="mt-3 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- お問い合わせフォーム -->
				<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-5 text-lg font-semibold text-gray-900">お問い合わせフォーム</h2>

					{#if submitStatus === 'success'}
						<!-- 送信完了 -->
						<div class="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
							<div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
								<svg
									class="h-7 w-7 text-green-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h3 class="mb-2 text-base font-semibold text-gray-900">お問い合わせを受け付けました</h3>
							<p class="mb-4 text-sm text-gray-600">
								通常1〜2営業日以内にご返信いたします。迷惑メールフォルダもご確認ください。
							</p>
							<button
								onclick={() => (submitStatus = 'idle')}
								class="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
							>
								新しいお問い合わせ
							</button>
						</div>
					{:else}
						<form onsubmit={handleSubmit} class="space-y-4">
							<!-- カテゴリー -->
							<div>
								<label for="category" class="mb-2 block text-sm font-medium text-gray-700">
									お問い合わせの種類
								</label>
								<select
									id="category"
									bind:value={category}
									class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
								>
									{#each categories as cat}
										<option value={cat.id}>{cat.label}</option>
									{/each}
								</select>
							</div>

							<!-- 名前とメール -->
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label for="name" class="mb-2 block text-sm font-medium text-gray-700">
										お名前 <span class="text-red-500">*</span>
									</label>
									<input
										id="name"
										type="text"
										bind:value={name}
										class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
										placeholder="山田太郎"
										required
									/>
								</div>
								<div>
									<label for="support-email" class="mb-2 block text-sm font-medium text-gray-700">
										メールアドレス <span class="text-red-500">*</span>
									</label>
									<input
										id="support-email"
										type="email"
										bind:value={email}
										class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
										placeholder="example@email.com"
										required
									/>
								</div>
							</div>

							<!-- 件名 -->
							<div>
								<label for="subject" class="mb-2 block text-sm font-medium text-gray-700">
									件名 <span class="text-red-500">*</span>
								</label>
								<input
									id="subject"
									type="text"
									bind:value={subject}
									class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none"
									placeholder="件名を入力してください"
									required
								/>
							</div>

							<!-- メッセージ -->
							<div>
								<label for="message" class="mb-2 block text-sm font-medium text-gray-700">
									メッセージ <span class="text-red-500">*</span>
								</label>
								<textarea
									id="message"
									bind:value={message}
									rows="5"
									class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none resize-none"
									placeholder="お問い合わせ内容を詳しくご記入ください"
									required
								></textarea>
								<p class="mt-1 text-right text-xs text-gray-400">{message.length} / 1000文字</p>
							</div>

							<!-- 送信ボタン -->
							<button
								type="submit"
								class="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								disabled={isSubmitting || !name || !email || !subject || !message}
							>
								{#if isSubmitting}
									<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
											d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
										/>
									</svg>
									<span>送信する</span>
								{/if}
							</button>

							<p class="text-center text-xs text-gray-500">
								送信することで
								<a href="/privacy" class="text-gray-700 underline">プライバシーポリシー</a>
								に同意したものとみなされます
							</p>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
</main>
