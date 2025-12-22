<!-- routes/checkout/payment/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// SVG 图标
	const icons = {
		lock: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
		check: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
		paypay: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M16.5,12c0,1.93-1.57,3.5-3.5,3.5S9.5,13.93,9.5,12 c0-1.93,1.57-3.5,3.5-3.5S16.5,10.07,16.5,12z"/></svg>`,
		creditCard: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
		spinner: `<svg class="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`
	};

	// 状态管理
	let paymentStatus = $state<'processing' | 'success' | 'failed'>('processing');
	let progress = $state(0);
	let orderData = $state<any>(null);
	let countdown = $state(3);

	// 格式化价格
	function formatPrice(price: number): string {
		return `¥${price.toLocaleString('ja-JP')}`;
	}

	// 模拟支付处理
	async function processPayment() {
        
		// 进度动画
		const progressInterval = setInterval(() => {
			if (progress < 90) {
				progress += Math.random() * 10;
			}
		}, 300);

		// 模拟支付处理时间
		await new Promise(resolve => setTimeout(resolve, 3000));
		
		clearInterval(progressInterval);
		progress = 100;

		// 模拟支付结果（90%成功率）
		const isSuccess = Math.random() > 0.1;
		
		if (isSuccess) {
			paymentStatus = 'success';
			
			// 倒计时后自动跳转
			const countdownInterval = setInterval(() => {
				countdown--;
				if (countdown <= 0) {
					clearInterval(countdownInterval);
					goto('/checkout/success');
				}
			}, 1000);
		} else {
			paymentStatus = 'failed';
		}
	}

	// 重试支付
	function retryPayment() {
		paymentStatus = 'processing';
		progress = 0;
		processPayment();
	}

	// 返回订单
	function backToCheckout() {
		goto('/checkout');
	}

	// 组件挂载时处理
	onMount(() => {
		// 从 localStorage 获取订单数据
		const savedOrder = localStorage.getItem('currentOrder');
		if (savedOrder) {
			orderData = JSON.parse(savedOrder);
		}

		// 开始支付处理
		processPayment();
	});
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
		{#if paymentStatus === 'processing'}
			<!-- 支付处理中 -->
			<div class="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
				<div class="mb-6 flex justify-center">
					<div class="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
						{#if orderData?.payment?.id === 'paypay'}
							<div class="text-blue-600">
								{@html icons.paypay}
							</div>
						{:else}
							<div class="text-blue-600">
								{@html icons.creditCard}
							</div>
						{/if}
					</div>
				</div>

				<h1 class="mb-2 text-2xl font-bold text-gray-900">決済処理中</h1>
				<p class="mb-8 text-sm text-gray-600">
					{#if orderData?.payment?.id === 'paypay'}
						PayPayで決済を処理しています
					{:else}
						クレジットカードで決済を処理しています
					{/if}
				</p>

				<!-- 进度条 -->
				<div class="mb-6">
					<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
						<div 
							class="h-full rounded-full bg-blue-600 transition-all duration-300"
							style="width: {progress}%"
						></div>
					</div>
					<p class="mt-2 text-sm text-gray-500">{Math.round(progress)}%</p>
				</div>

				<!-- 加载动画 -->
				<div class="mb-6 flex justify-center">
					<div class="text-blue-600">
						{@html icons.spinner}
					</div>
				</div>

				<p class="text-xs text-gray-500">
					しばらくお待ちください。ページを閉じないでください。
				</p>

				{#if orderData}
					<!-- 订单信息 -->
					<div class="mt-8 rounded-lg bg-gray-50 p-4 text-left">
						<h3 class="mb-3 text-sm font-medium text-gray-900">注文情報</h3>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-gray-600">注文番号</span>
								<span class="font-mono text-gray-900">{orderData.orderId}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">決済金額</span>
								<span class="font-bold text-gray-900">{formatPrice(orderData.total)}</span>
							</div>
						</div>
					</div>
				{/if}
			</div>

		{:else if paymentStatus === 'success'}
			<!-- 支付成功 -->
			<div class="rounded-lg border border-green-200 bg-white p-8 text-center shadow-sm">
				<div class="mb-6 flex justify-center">
					<div class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
						<div class="text-green-600">
							{@html icons.check}
						</div>
					</div>
				</div>

				<h1 class="mb-2 text-2xl font-bold text-gray-900">決済完了</h1>
				<p class="mb-8 text-sm text-gray-600">
					決済が正常に完了しました
				</p>

				<div class="mb-6 rounded-lg bg-green-50 p-4">
					<p class="text-sm text-green-800">
						{countdown}秒後に注文完了ページに移動します...
					</p>
				</div>

				{#if orderData}
					<!-- 订单信息 -->
					<div class="mb-6 rounded-lg bg-gray-50 p-4 text-left">
						<h3 class="mb-3 text-sm font-medium text-gray-900">注文情報</h3>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-gray-600">注文番号</span>
								<span class="font-mono text-gray-900">{orderData.orderId}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">決済金額</span>
								<span class="font-bold text-gray-900">{formatPrice(orderData.total)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">決済方法</span>
								<span class="text-gray-900">{orderData.payment?.name}</span>
							</div>
						</div>
					</div>
				{/if}

				<button
					onclick={() => goto('/checkout/success')}
					class="w-full rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
				>
					注文完了ページへ
				</button>
			</div>

		{:else if paymentStatus === 'failed'}
			<!-- 支付失败 -->
			<div class="rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
				<div class="mb-6 flex justify-center">
					<div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
						<svg class="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</div>
				</div>

				<h1 class="mb-2 text-2xl font-bold text-gray-900">決済失敗</h1>
				<p class="mb-8 text-sm text-gray-600">
					決済処理に失敗しました。もう一度お試しください。
				</p>

				<!-- 错误原因 -->
				<div class="mb-6 rounded-lg bg-red-50 p-4 text-left">
					<h3 class="mb-2 text-sm font-medium text-red-900">エラー詳細</h3>
					<ul class="space-y-1 text-sm text-red-700">
						<li>• 残高不足の可能性があります</li>
						<li>• カード情報が正しくない可能性があります</li>
						<li>• 一時的なネットワークエラーの可能性があります</li>
					</ul>
				</div>

				{#if orderData}
					<!-- 订单信息 -->
					<div class="mb-6 rounded-lg bg-gray-50 p-4 text-left">
						<h3 class="mb-3 text-sm font-medium text-gray-900">注文情報</h3>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-gray-600">注文番号</span>
								<span class="font-mono text-gray-900">{orderData.orderId}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">決済金額</span>
								<span class="font-bold text-gray-900">{formatPrice(orderData.total)}</span>
							</div>
						</div>
					</div>
				{/if}

				<!-- 操作按钮 -->
				<div class="space-y-3">
					<button
						onclick={retryPayment}
						class="w-full rounded-lg bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700"
					>
						再試行
					</button>
					<button
						onclick={backToCheckout}
						class="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						注文画面に戻る
					</button>
				</div>

				<!-- 帮助信息 -->
				<div class="mt-6 rounded-lg bg-gray-50 p-4">
					<p class="text-xs text-gray-600">
						問題が解決しない場合は、
						<a href="/support" class="text-blue-600 hover:underline">カスタマーサポート</a>
						までお問い合わせください。
					</p>
				</div>
			</div>
		{/if}

		<!-- 安全提示 -->
		<div class="mt-6 rounded-lg bg-gray-100 p-4">
			<div class="flex items-start gap-3">
				<div class="text-gray-600">
					{@html icons.lock}
				</div>
				<div class="text-xs text-gray-600">
					<span class="font-medium text-gray-900">セキュリティ保護</span>
					<p class="mt-1">
						この決済はSSL暗号化通信で保護されています。お客様の個人情報や決済情報は安全に処理されます。
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>