<!-- routes/checkout/payment/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { pb } from '$lib/services/PBConfig';

	// SVG 图标
	const icons = {
		lock: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
		check: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
		paypay: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M16.5,12c0,1.93-1.57,3.5-3.5,3.5S9.5,13.93,9.5,12 c0-1.93,1.57-3.5,3.5-3.5S16.5,10.07,16.5,12z"/></svg>`,
		creditCard: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
		spinner: `<svg class="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`,
		link: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`
	};

	// 状态变量
	let paymentStatus: 'processing' | 'created' | 'success' | 'failed' = 'processing';
	let progress = 0;
	let orderData: any = null;
	let countdown = 10;
	let qrCode: string | null = null;
	let merchantPaymentId = '';
	let pollingInterval: NodeJS.Timeout | null = null;
	let progressInterval: NodeJS.Timeout | null = null;
	let countdownInterval: NodeJS.Timeout | null = null;

	// 格式化价格
	function formatPrice(price: number): string {
		return `¥${price.toLocaleString('ja-JP')}`;
	}

	// 清理所有定时器
	function cleanupTimers() {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
		if (progressInterval) {
			clearInterval(progressInterval);
			progressInterval = null;
		}
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
	}

	// 重置所有状态
	function resetAllState() {
		cleanupTimers();
		paymentStatus = 'processing';
		progress = 0;
		countdown = 10;
		qrCode = null;
		merchantPaymentId = '';
	}

	// 检查支付状态
	async function checkStatus() {
		try {
			const res = await fetch(`/api/paypay/status/${merchantPaymentId}`);
			const data = await res.json();
			console.log('支付状态响应:', data);

			const status = data?.data?.BODY?.data?.status;
			console.log('当前支付状态:', status);
			const paymentId = data?.data?.BODY?.data?.paymentId;
			if (status === 'COMPLETED') {
				// 支付成功
				cleanupTimers();
				progress = 100;
				paymentStatus = 'success';
				startCountdown();
				// 更新订单状态和 payment_id
				await pb.collection('orders').update(orderData.id, {
					payment_id: paymentId
				});
			} else if (status === 'FAILED' || status === 'CANCELED') {
				// 支付失败
				cleanupTimers();
				progress = 100;
				paymentStatus = 'failed';
			} else if (status === 'CREATED') {
				// 待支付
				if (progress < 70) {
					progress = 70;
				}
			}
		} catch (error) {
			console.error('查询支付状态失败:', error);
		}
	}

	// 创建 PayPay 支付订单
	async function createPayPayOrder() {
		resetAllState();

		// 生成唯一的支付ID
		merchantPaymentId = crypto.randomUUID();

		// 进度动画（创建订单阶段）
		progressInterval = setInterval(() => {
			if (progress < 40) {
				progress += Math.random() * 5;
			}
		}, 300);

		try {
			// 如果没有订单数据，使用默认测试数据
			if (!orderData) {
				orderData = {
					total: 42200,
					items: [
						{
							name: 'ワイヤレスイヤホン Pro',
							quantity: 1,
							price: 12800
						},
						{
							name: 'スマートウォッチ Series 5',
							quantity: 1,
							price: 28900
						}
					],
					orderId: `ORDER_${Date.now()}`,
					payment: { id: 'paypay', name: 'PayPay' }
				};
			}

			console.log('创建订单数据:', orderData);

			// 调用后端API创建PayPay订单
			const res = await fetch('/api/paypay/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					merchantPaymentId,
					codeType: 'ORDER_QR',
					orderDescription: 'Example - Mune Cake shop',
					amount: {
						amount: 1, // 测试用1日元
						currency: 'JPY'
					}
				})
			});

			// 清理进度定时器
			if (progressInterval) {
				clearInterval(progressInterval);
				progressInterval = null;
			}

			if (!res.ok) {
				const errorText = await res.text();
				console.error('创建订单失败:', errorText);
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const result = await res.json();
			console.log('PayPay创建订单响应:', result);

			// 保存二维码链接
			qrCode = result?.data?.BODY?.data?.url;

			if (qrCode) {
				// 更新状态
				paymentStatus = 'created';
				progress = 60;

				console.log('✅ 订单创建成功，支付ID:', merchantPaymentId);
				console.log('支付链接:', qrCode);

				// 自动打开支付页面
				window.open(qrCode);

				// 开始轮询支付状态
				startPolling();
			} else {
				throw new Error('未获取到支付链接');
			}
		} catch (error) {
			console.error('创建支付失败:', error);
			// 清理定时器
			if (progressInterval) {
				clearInterval(progressInterval);
				progressInterval = null;
			}

			// 更新失败状态
			paymentStatus = 'failed';
			progress = 100;
		}
	}

	// 开始轮询支付状态
	function startPolling() {
		// 清理之前的定时器
		if (progressInterval) {
			clearInterval(progressInterval);
			progressInterval = null;
		}

		// 进度动画（轮询阶段）
		progressInterval = setInterval(() => {
			if (progress < 90) {
				progress += 0.5;
			}
		}, 500);

		// 开始轮询
		pollingInterval = setInterval(checkStatus, 3000);
	}

	// 倒计时跳转
	function startCountdown() {
		countdown = 10;
		countdownInterval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				cleanupTimers();
				goto('/checkout/success');
			}
		}, 1000);
	}

	// 手动跳转到成功页面
	function goToSuccessPage() {
		cleanupTimers();
		goto('/checkout/success');
	}

	// 重试支付
	function retryPayment() {
		resetAllState();
		createPayPayOrder();
	}

	// 返回订单页面
	function backToCheckout() {
		cleanupTimers();
		goto('/checkout');
	}

	// 复制支付链接
	function copyPaymentLink() {
		if (qrCode) {
			navigator.clipboard
				.writeText(qrCode)
				.then(() => alert('リンクをコピーしました'))
				.catch((err) => console.error('コピー失敗:', err));
		}
	}

	// 组件挂载
	onMount(() => {
		createPayPayOrder();
	});

	// 组件销毁时清理
	onDestroy(() => {
		cleanupTimers();
	});
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
		<!-- 支付处理中 / 已创建 -->
		{#if paymentStatus === 'processing' || paymentStatus === 'created'}
			<div class="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
				<div class="mb-6 flex justify-center">
					<div class="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
						{#if paymentStatus === 'processing'}
							<div class="text-blue-600">
								{@html icons.spinner}
							</div>
						{:else if paymentStatus === 'created'}
							<div class="text-blue-600">
								{@html icons.link}
							</div>
						{/if}
					</div>
				</div>

				<h1 class="mb-2 text-2xl font-bold text-gray-900">
					{#if paymentStatus === 'processing'}
						支払い情報を処理中
					{:else if paymentStatus === 'created'}
						PayPay 決済ページへ
					{/if}
				</h1>

				<p class="mb-8 text-sm text-gray-600">
					{#if paymentStatus === 'processing'}
						PayPayで決済を処理しています
					{:else if paymentStatus === 'created'}
						支払いページを開いてください
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
				{#if paymentStatus === 'processing'}
					<div class="mb-6 flex justify-center">
						<div class="text-blue-600">
							{@html icons.spinner}
						</div>
					</div>
				{/if}

				<!-- 支付链接（当订单已创建时显示） -->
				{#if paymentStatus === 'created' && qrCode}
					<div class="mb-6 space-y-4">
						<p class="text-sm text-gray-600">支払いページが自動的に開かれました。</p>
						<p class="text-sm text-gray-500">
							ページが開かない場合は以下のリンクをクリックしてください。
						</p>

						<div class="rounded-lg bg-gray-50 p-4">
							<a
								href={qrCode}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
							>
								{@html icons.paypay}
								<span class="font-medium">PayPay決済ページを開く</span>
							</a>

							<button
								on:click={copyPaymentLink}
								class="mt-2 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
							>
								{@html icons.link}
								<span>リンクをコピー</span>
							</button>
						</div>
					</div>
				{/if}

				<p class="text-xs text-gray-500">
					{#if paymentStatus === 'created'}
						支払いが完了するまでこのページを開いたままにしてください...
					{:else}
						しばらくお待ちください。ページを閉じないでください。
					{/if}
				</p>

				{#if orderData}
					<!-- 订单信息 -->
					<div class="mt-8 rounded-lg bg-gray-50 p-4 text-left">
						<h3 class="mb-3 text-sm font-medium text-gray-900">注文情報</h3>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-gray-600">注文番号</span>
								<span class="font-mono text-gray-900">{orderData.orderId || merchantPaymentId}</span
								>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">決済金額</span>
								<span class="font-bold text-gray-900">{formatPrice(orderData.total)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">決済方法</span>
								<span class="text-gray-900">PayPay</span>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- 支付成功 -->
		{:else if paymentStatus === 'success'}
			<div class="rounded-lg border border-green-200 bg-white p-8 text-center shadow-sm">
				<div class="mb-6 flex justify-center">
					<div class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
						<div class="text-green-600">
							{@html icons.check}
						</div>
					</div>
				</div>

				<h1 class="mb-2 text-2xl font-bold text-gray-900">決済完了</h1>
				<p class="mb-8 text-sm text-gray-600">決済が正常に完了しました</p>

				<!-- 进度条（显示100%） -->
				<div class="mb-6">
					<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
						<div
							class="h-full rounded-full bg-green-600 transition-all duration-300"
							style="width: 100%"
						></div>
					</div>
					<p class="mt-2 text-sm text-gray-500">100% 完了</p>
				</div>

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
								<span class="font-mono text-gray-900">{orderData.orderId || merchantPaymentId}</span
								>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">決済金額</span>
								<span class="font-bold text-gray-900">{formatPrice(orderData.total)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">決済方法</span>
								<span class="text-gray-900">PayPay</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">支払い状態</span>
								<span class="font-medium text-green-600">完了</span>
							</div>
						</div>
					</div>
				{/if}

				<button
					on:click={goToSuccessPage}
					class="w-full rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
				>
					注文完了ページへ
				</button>
			</div>

			<!-- 支付失败 -->
		{:else if paymentStatus === 'failed'}
			<div class="rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
				<div class="mb-6 flex justify-center">
					<div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
						<svg
							class="h-10 w-10 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
				</div>

				<h1 class="mb-2 text-2xl font-bold text-gray-900">決済失敗</h1>
				<p class="mb-8 text-sm text-gray-600">決済処理に失敗しました。もう一度お試しください。</p>

				<!-- 进度条（显示100%） -->
				<div class="mb-6">
					<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
						<div
							class="h-full rounded-full bg-red-600 transition-all duration-300"
							style="width: 100%"
						></div>
					</div>
					<p class="mt-2 text-sm text-gray-500">100% 完了（失敗）</p>
				</div>

				<!-- 错误原因 -->
				<div class="mb-6 rounded-lg bg-red-50 p-4 text-left">
					<h3 class="mb-2 text-sm font-medium text-red-900">エラー詳細</h3>
					<ul class="space-y-1 text-sm text-red-700">
						<li>• 残高不足の可能性があります</li>
						<li>• PayPayアカウントに問題がある可能性があります</li>
						<li>• 一時的なネットワークエラーの可能性があります</li>
						<li>• 決済がタイムアウトした可能性があります</li>
					</ul>
				</div>

				{#if orderData}
					<!-- 订单信息 -->
					<div class="mb-6 rounded-lg bg-gray-50 p-4 text-left">
						<h3 class="mb-3 text-sm font-medium text-gray-900">注文情報</h3>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-gray-600">注文番号</span>
								<span class="font-mono text-gray-900">{orderData.orderId || merchantPaymentId}</span
								>
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
						on:click={retryPayment}
						class="w-full rounded-lg bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700"
					>
						再試行
					</button>
					<button
						on:click={backToCheckout}
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
