<script lang="ts">
</script>

<main class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- 页面标题 -->
		<div class="mb-8 text-center">
			<h1 class="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">アプリについて</h1>
			<p class="text-base text-gray-600 sm:text-lg">私たちのサービスをご紹介します</p>
		</div>

		<!-- 主要内容卡片 -->
		<div class="space-y-6">
			<!-- 概要 -->
			<section class="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
				<div class="mb-4 flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
						<svg
							class="h-6 w-6 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-gray-900 sm:text-2xl">サービス概要</h2>
				</div>
				<p class="leading-relaxed text-gray-700">
					当サービスは、最新のテクノロジーを活用したオンラインショッピングプラットフォームです。
					お客様に最高のショッピング体験を提供することを目指し、幅広い商品カテゴリーと
					便利な機能を取り揃えています。
				</p>
			</section>

			<!-- 主な機能 -->
			<section class="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
				<div class="mb-6 flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
						<svg
							class="h-6 w-6 text-green-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-gray-900 sm:text-2xl">主な機能</h2>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="rounded-lg border border-gray-100 p-4">
						<h3 class="mb-2 font-semibold text-gray-900">豊富な商品</h3>
						<p class="text-sm text-gray-600">スマホ、家電、ファッションなど10以上のカテゴリー</p>
					</div>
					<div class="rounded-lg border border-gray-100 p-4">
						<h3 class="mb-2 font-semibold text-gray-900">簡単検索</h3>
						<p class="text-sm text-gray-600">直感的な検索とフィルタリング機能</p>
					</div>
					<div class="rounded-lg border border-gray-100 p-4">
						<h3 class="mb-2 font-semibold text-gray-900">安全決済</h3>
						<p class="text-sm text-gray-600">セキュアな決済システムで安心</p>
					</div>
					<div class="rounded-lg border border-gray-100 p-4">
						<h3 class="mb-2 font-semibold text-gray-900">迅速配送</h3>
						<p class="text-sm text-gray-600">全国各地へスピーディーにお届け</p>
					</div>
				</div>
			</section>

			<!-- 会社情報 -->
			<section class="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
				<div class="mb-6 flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
						<svg
							class="h-6 w-6 text-purple-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-gray-900 sm:text-2xl">会社情報</h2>
				</div>
				<div class="space-y-3 text-gray-700">
					<div class="flex gap-3">
						<span class="min-w-24 font-medium text-gray-900">会社名：</span>
						<span>株式会社ショッピングプラットフォーム</span>
					</div>
					<div class="flex gap-3">
						<span class="min-w-24 font-medium text-gray-900">設立：</span>
						<span>2020年4月</span>
					</div>
					<div class="flex gap-3">
						<span class="min-w-24 font-medium text-gray-900">所在地：</span>
						<span>東京都渋谷区渋谷1-1-1</span>
					</div>
					<div class="flex gap-3">
						<span class="min-w-24 font-medium text-gray-900">事業内容：</span>
						<span>ECプラットフォームの運営・開発</span>
					</div>
				</div>
			</section>

			<!-- お問い合わせ -->
			<section class="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
				<div class="mb-6 flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50">
						<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-gray-900 sm:text-2xl">お問い合わせ</h2>
				</div>
				<div class="space-y-3 text-gray-700">
					<div class="flex gap-3">
						<span class="min-w-24 font-medium text-gray-900">Email：</span>
						<a href="mailto:info@example.com" class="text-blue-600 hover:underline"
							>info@example.com</a
						>
					</div>
					<div class="flex gap-3">
						<span class="min-w-24 font-medium text-gray-900">電話：</span>
						<span>03-1234-5678</span>
					</div>
					<div class="flex gap-3">
						<span class="min-w-24 font-medium text-gray-900">受付時間：</span>
						<span>平日 9:00-18:00</span>
					</div>
				</div>
			</section>
		</div>

		<!-- 戻るボタン -->
		<div class="mt-8 text-center">
			<a
				href="/"
				class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white no-underline transition-all hover:bg-gray-800"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				ホームに戻る
			</a>
		</div>
	</div>
</main>

<style>
	.shadow-sm {
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.1),
			0 1px 2px -1px rgba(0, 0, 0, 0.1);
	}
</style>
