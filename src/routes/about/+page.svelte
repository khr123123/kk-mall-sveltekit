<script lang="ts">
</script>

<main class="min-h-screen bg-white">
	<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- 页面标题 -->
		<div class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-light tracking-tight text-gray-900 sm:text-5xl">About</h1>
			<div class="h-px w-24 bg-gray-300 mx-auto mb-6"></div>
			<p class="text-lg text-gray-500 font-light">サービスについて</p>
		</div>

		<!-- 主要内容区域 -->
		<div class="space-y-10">
			<!-- 概要 -->
			<section class="relative">
				<div class="mb-8">
					<h2 class="text-2xl font-normal text-gray-900 mb-3">サービス概要</h2>
					<div class="h-px w-16 bg-gray-300"></div>
				</div>
				<p class="text-gray-600 leading-relaxed text-lg font-light tracking-wide">
					当サービスは、最新のテクノロジーを活用したオンラインショッピングプラットフォームです。
					お客様に最高のショッピング体験を提供することを目指し、幅広い商品カテゴリーと
					便利な機能を取り揃えています。
				</p>
			</section>

			<!-- 主な機能 -->
			<section>
				<div class="mb-8">
					<h2 class="text-2xl font-normal text-gray-900 mb-3">主な機能</h2>
					<div class="h-px w-16 bg-gray-300"></div>
				</div>
				<div class="grid gap-6 md:grid-cols-2">
					<div class="group">
						<div class="mb-3 text-gray-400 transition-colors group-hover:text-gray-600">
							<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
									d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
						<h3 class="text-lg font-normal text-gray-900 mb-2">豊富な商品</h3>
						<p class="text-gray-500 font-light">スマホ、家電、ファッションなど10以上のカテゴリー</p>
					</div>
					
					<div class="group">
						<div class="mb-3 text-gray-400 transition-colors group-hover:text-gray-600">
							<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<h3 class="text-lg font-normal text-gray-900 mb-2">簡単検索</h3>
						<p class="text-gray-500 font-light">直感的な検索とフィルタリング機能</p>
					</div>
					
					<div class="group">
						<div class="mb-3 text-gray-400 transition-colors group-hover:text-gray-600">
							<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						</div>
						<h3 class="text-lg font-normal text-gray-900 mb-2">安全決済</h3>
						<p class="text-gray-500 font-light">セキュアな決済システムで安心</p>
					</div>
					
					<div class="group">
						<div class="mb-3 text-gray-400 transition-colors group-hover:text-gray-600">
							<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</div>
						<h3 class="text-lg font-normal text-gray-900 mb-2">迅速配送</h3>
						<p class="text-gray-500 font-light">全国各地へスピーディーにお届け</p>
					</div>
				</div>
			</section>

			<!-- 会社情報 -->
			<section>
				<div class="mb-8">
					<h2 class="text-2xl font-normal text-gray-900 mb-3">会社情報</h2>
					<div class="h-px w-16 bg-gray-300"></div>
				</div>
				<div class="space-y-5">
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 text-gray-500 font-light">会社名</span>
						<span class="text-gray-700">株式会社ショッピングプラットフォーム</span>
					</div>
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 text-gray-500 font-light">設立</span>
						<span class="text-gray-700">2020年4月</span>
					</div>
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 text-gray-500 font-light">所在地</span>
						<span class="text-gray-700">東京都渋谷区渋谷1-1-1</span>
					</div>
					<div class="flex">
						<span class="w-32 text-gray-500 font-light">事業内容</span>
						<span class="text-gray-700">ECプラットフォームの運営・開発</span>
					</div>
				</div>
			</section>

			<!-- お問い合わせ -->
			<section>
				<div class="mb-8">
					<h2 class="text-2xl font-normal text-gray-900 mb-3">お問い合わせ</h2>
					<div class="h-px w-16 bg-gray-300"></div>
				</div>
				<div class="space-y-5">
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 text-gray-500 font-light">Email</span>
						<a href="mailto:info@example.com" class="text-gray-700 hover:text-gray-900 transition-colors">
							info@example.com
						</a>
					</div>
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 text-gray-500 font-light">電話</span>
						<span class="text-gray-700">03-1234-5678</span>
					</div>
					<div class="flex">
						<span class="w-32 text-gray-500 font-light">受付時間</span>
						<span class="text-gray-700">平日 9:00-18:00</span>
					</div>
				</div>
			</section>
		</div>

		<!-- 戻るボタン -->
		<div class="mt-16 text-center">
			<a
				href="/"
				class="inline-flex items-center gap-3 px-8 py-4 text-gray-700 border border-gray-300 hover:border-gray-400 transition-all group"
			>
				<svg class="w-5 h-5 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				<span class="text-sm tracking-wider">BACK TO HOME</span>
			</a>
		</div>
	</div>
</main>

<style>
	/* 简约的滚动条样式 */
	::-webkit-scrollbar {
		width: 8px;
	}
	
	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}
	
	::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 4px;
	}
	
	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>