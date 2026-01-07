<script>
	const iconBase = 'w-7 h-7 opacity-80 hover:opacity-100 transition-opacity';

	const socialIcons = [
		{
			name: 'TikTok',
			icon: '/svgs/tiktok.svg',
			href: 'https://github.com/khr123123'
		},
		{
			name: 'Instagram',
			icon :'/svgs/instagram.svg',
			href: 'https://github.com/khr123123'
		},
		{
			name: 'Facebook',
			icon :'/svgs/facebook.svg',
			href: 'https://github.com/khr123123'
		},
		{
			name: 'Line',
			icon :'/svgs/line.svg',
			href: 'https://github.com/khr123123'
		},
		{
			name: 'X',
			icon :'/svgs/X.svg',
			href: 'https://github.com/khr123123'
		}
	];
</script>

<footer class="border-t border-gray-300 bg-white font-mono">
	<!-- 主要内容区域 -->
	<div class="mx-auto max-w-7xl px-6 py-12 md:px-8">
		<div class="grid grid-cols-1 gap-10 md:grid-cols-3">
			<!-- 信息栏目 -->
			<div>
				<h3 class="mb-6 text-sm font-semibold tracking-wider text-gray-900 uppercase">
					インフォメーション
				</h3>
				<ul class="space-y-3 text-sm">
					<li>
						<a
							href="https://github.com/khr123123"
							target="_blank"
							class="text-gray-600 transition-colors duration-200 hover:text-gray-900"
						>
							ご利用案内
						</a>
					</li>
					<li>
						<a
							href="https://github.com/khr123123"
							target="_blank"
							class="text-gray-600 transition-colors duration-200 hover:text-gray-900"
						>
							ショップからのお知らせ
						</a>
					</li>
					<li>
						<a
							href="https://github.com/khr123123"
							target="_blank"
							class="text-gray-600 transition-colors duration-200 hover:text-gray-900"
						>
							プライバシーポリシー
						</a>
					</li>
					<li>
						<a
							href="https://github.com/khr123123"
							target="_blank"
							class="text-gray-600 transition-colors duration-200 hover:text-gray-900"
						>
							特定商取引法に関する表記
						</a>
					</li>
					<li>
						<a
							href="https://github.com/khr123123"
							target="_blank"
							class="text-gray-600 transition-colors duration-200 hover:text-gray-900"
						>
							サイトポリシー
						</a>
					</li>
				</ul>
			</div>

			<!-- 联系方式栏目 -->
			<div>
				<h3 class="mb-6 text-sm font-semibold tracking-wider text-gray-900 uppercase">
					お問い合わせ
				</h3>
				<div class="space-y-4">
					<a
						href="https://github.com/khr123123"
						target="_blank"
						class="block w-full rounded border border-gray-300 px-4 py-3 text-center text-sm
							   transition-all duration-200 hover:border-gray-900 hover:text-gray-900"
					>
						お問い合わせフォーム
					</a>

					<a
						href="https://github.com/khr123123"
						target="_blank"
						class="block w-full rounded border border-gray-300 px-4 py-3 text-center text-sm
							   transition-all duration-200 hover:border-gray-900 hover:text-gray-900"
					>
						カタログ送付停止のご依頼
					</a>

					<div class="pt-4">
						<p class="text-lg font-medium tracking-tight text-gray-900">0101-30-3300</p>
						<p class="mt-1 text-xs text-gray-500">受付時間: 9:00〜18:00</p>
					</div>
				</div>
			</div>

			<!-- SNS栏目 -->
			<div>
				<h3 class="mb-6 text-sm font-semibold tracking-wider text-gray-900 uppercase">
					SNS公式アカウント
				</h3>
				<div class="grid grid-cols-2 gap-4">
					{#each socialIcons as icon}
						<a
							href={icon.href}
							target="_blank"
							class="flex items-center gap-3 rounded p-3 transition-colors duration-200 hover:bg-gray-50"
						>
							<img src={icon.icon} class={iconBase} alt={icon.name} />
							<span class="text-sm text-gray-700">{icon.name}</span>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- 底部版权区域 -->
	<div class="border-t border-gray-200 bg-gray-50">
		<div class="mx-auto max-w-7xl px-6 py-6 md:px-8">
			<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
				<div class="flex gap-6 text-xs">
					<a
						href="https://github.com/khr123123"
						target="_blank"
						class="text-gray-600 transition-colors duration-200 hover:text-gray-900"
					>
						会社概要
					</a>
					<a
						href="https://github.com/khr123123"
						target="_blank"
						class="text-gray-600 transition-colors duration-200 hover:text-gray-900"
					>
						法人のお客様はこちら
					</a>
				</div>
				<div class="text-xs text-gray-500">© 2025 K. All Rights Reserved.</div>
			</div>
		</div>
	</div>
</footer>
