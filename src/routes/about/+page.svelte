<script>
	import { bag, goBack, lock, safety, search } from '$lib/icons/svgs';
</script>

<main class="min-h-screen bg-white">
	<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- 页面标题 -->
		<div class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-light tracking-tight text-gray-900 sm:text-5xl">About</h1>
			<div class="mx-auto mb-6 h-px w-24 bg-gray-300"></div>
			<p class="text-lg font-light text-gray-500">サービスについて</p>
		</div>
		<!-- 主要内容区域 -->
		<div class="space-y-10">
			<!-- 概要 -->
			<section class="relative">
				<div class="mb-8">
					<h2 class="mb-3 text-2xl font-normal text-gray-900">サービス概要</h2>
					<div class="h-px w-16 bg-gray-300"></div>
				</div>
				<p class="text-lg leading-relaxed font-light tracking-wide text-gray-600">
					当サービスは、最新のテクノロジーを活用したオンラインショッピングプラットフォームです。
					お客様に最高のショッピング体験を提供することを目指し、幅広い商品カテゴリーと
					便利な機能を取り揃えています。
				</p>
			</section>
			<!-- 主な機能 -->
			<section>
				<div class="mb-8">
					<h2 class="mb-3 text-2xl font-normal text-gray-900">主な機能</h2>
					<div class="h-px w-16 bg-gray-300"></div>
				</div>
				<div class="grid gap-6 md:grid-cols-2">
					<div class="group">
						<div class="mb-3 text-gray-400 transition-colors group-hover:text-gray-600">
							{@html bag}
						</div>
						<h3 class="mb-2 text-lg font-normal text-gray-900">豊富な商品</h3>
						<p class="font-light text-gray-500">スマホ、家電、ファッションなど10以上のカテゴリー</p>
					</div>

					<div class="group">
						<div class="mb-3 text-gray-400 transition-colors group-hover:text-gray-600">
							{@html search}
						</div>
						<h3 class="mb-2 text-lg font-normal text-gray-900">簡単検索</h3>
						<p class="font-light text-gray-500">直感的な検索とフィルタリング機能</p>
					</div>

					<div class="group">
						<div class="mb-3 text-gray-400 transition-colors group-hover:text-gray-600">
							{@html lock}
						</div>
						<h3 class="mb-2 text-lg font-normal text-gray-900">安全決済</h3>
						<p class="font-light text-gray-500">セキュアな決済システムで安心</p>
					</div>

					<div class="group">
						<div class="mb-3 text-gray-400 transition-colors group-hover:text-gray-600">
							{@html safety}
						</div>
						<h3 class="mb-2 text-lg font-normal text-gray-900">迅速配送</h3>
						<p class="font-light text-gray-500">全国各地へスピーディーにお届け</p>
					</div>
				</div>
			</section>
			<!-- 会社情報 -->
			<section>
				<div class="mb-8">
					<h2 class="mb-3 text-2xl font-normal text-gray-900">会社情報</h2>
					<div class="h-px w-16 bg-gray-300"></div>
				</div>
				<div class="space-y-5">
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 font-light text-gray-500">会社名</span>
						<span class="text-gray-700">株式会社ショッピングプラットフォーム</span>
					</div>
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 font-light text-gray-500">設立</span>
						<span class="text-gray-700">2020年4月</span>
					</div>
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 font-light text-gray-500">所在地</span>
						<span class="text-gray-700">東京都渋谷区渋谷1-1-1</span>
					</div>
					<div class="flex">
						<span class="w-32 font-light text-gray-500">事業内容</span>
						<span class="text-gray-700">ECプラットフォームの運営・開発</span>
					</div>
				</div>
			</section>

			<!-- お問い合わせ -->
			<section>
				<div class="mb-8">
					<h2 class="mb-3 text-2xl font-normal text-gray-900">お問い合わせ</h2>
					<div class="h-px w-16 bg-gray-300"></div>
				</div>
				<div class="space-y-5">
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 font-light text-gray-500">Email</span>
						<a
							href="mailto:KKMallINFO@gmail.com"
							class="text-gray-700 transition-colors hover:text-gray-900"
						>
							KKMallINFO@gmail.com
						</a>
					</div>
					<div class="flex border-b border-gray-100 pb-4">
						<span class="w-32 font-light text-gray-500">電話</span>
						<span class="text-gray-700">03-1234-5678</span>
					</div>
					<div class="flex">
						<span class="w-32 font-light text-gray-500">受付時間</span>
						<span class="text-gray-700">平日 9:00-18:00</span>
					</div>
				</div>
			</section>
		</div>

		<!-- 戻るボタン -->
		<div class="mt-16 text-center">
			<a
				href="/"
				class="group inline-flex items-center gap-3 border border-gray-300 px-8 py-4 text-gray-700 transition-all hover:border-gray-400"
			>
				{@html goBack}
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
