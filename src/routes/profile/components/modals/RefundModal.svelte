<!-- routes/profile/components/modals/RefundModal.svelte -->
<script lang="ts">
    import type {Order} from '$lib/types/profile';
    import {checkCircle, close, infoIcon, refund, spinnerSm, warningIcon} from '$lib/icons/svgs';
    import {dialogStore} from '$lib/stores/dialogStore';

    interface Props {
        order: Order;
        onClose: () => void;
        onSubmit: (refundData: any) => Promise<boolean>;
    }

    let {order, onClose, onSubmit}: Props = $props();

    let refundData = $state({
        refundType: 'full' as 'full' | 'partial',
        refundReason: '',
        refundAmount: order.total_amount,
        returnGoods: false,
        trackingNumber: ''
    });

    let isSubmitting = $state(false);

    const refundReasons = [
        '商品不符合描述',
        '商品質量問題',
        '誤って注文した',
        'サイズが合わない',
        '配送遅延',
        'その他'
    ];

    function needsTrackingNumber(): boolean {
        return ['shipped', 'delivered'].includes(order.status);
    }

    function getRefundTypeText(): string {
        if (order.status === 'pending' || order.status === 'processing') {
            return '直接返金';
        } else {
            return '返品返金';
        }
    }

    function updateRefundAmount() {
        if (refundData.refundType === 'full') {
            refundData.refundAmount = order.total_amount;
        }
    }

    function getStatusClass(status: string): string {
        const classMap: Record<string, string> = {
            pending: 'status-default',
            processing: 'status-info',
            shipped: 'status-info',
            delivered: 'status-success',
            cancelled: 'status-danger'
        };
        return classMap[status] || 'status-default';
    }

    function getStatusLabel(status: string): string {
        const statusMap: Record<string, string> = {
            pending: '処理待ち',
            processing: '処理中',
            shipped: '発送済み',
            delivered: '配送完了',
            cancelled: 'キャンセル済み'
        };
        return statusMap[status] || status;
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();

        if (!refundData.refundReason) {
            dialogStore.alertDialog.show({
                title: '入力エラー',
                message: '返金理由を選択してください',
                type: 'error'
            });
            return;
        }

        if (refundData.refundType === 'partial' && refundData.refundAmount <= 0) {
            dialogStore.alertDialog.show({
                title: '入力エラー',
                message: '返金金額を入力してください',
                type: 'error'
            });
            return;
        }

        if (refundData.refundAmount > order.total_amount) {
            dialogStore.alertDialog.show({
                title: '入力エラー',
                message: '返金金額が注文金額を超えています',
                type: 'error'
            });
            return;
        }

        if (
            needsTrackingNumber() &&
            refundData.returnGoods &&
            !refundData.trackingNumber.trim()
        ) {
            dialogStore.alertDialog.show({
                title: '入力エラー',
                message: '返品追跡番号を入力してください',
                type: 'error'
            });
            return;
        }

        const confirmed = await dialogStore.confirmDialog.show({
            title: '返金申請の確認',
            message: needsTrackingNumber()
                ? `返品返金を申請しますか？\n金額: ¥${refundData.refundAmount.toLocaleString('ja-JP')}\n追跡番号: ${refundData.trackingNumber}`
                : `¥${refundData.refundAmount.toLocaleString('ja-JP')} の返金を申請しますか？`,
            type: 'warning',
            confirmText: '申請する',
            cancelText: 'キャンセル'
        });

        if (!confirmed) return;

        isSubmitting = true;
        try {
            const success = await onSubmit(refundData);
            if (success) {
                onClose();
                dialogStore.alertDialog.show({
                    title: '成功',
                    message: '返金申請を送信しました',
                    type: 'success'
                });
            } else {
                dialogStore.alertDialog.show({
                    title: 'エラー',
                    message: '返金申請に失敗しました',
                    type: 'error'
                });
            }
        } finally {
            isSubmitting = false;
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="refund-modal-overlay" onclick={onClose}>
    <div class="refund-modal-content" onclick={(e) => e.stopPropagation()}>
        <!-- 头部 -->
        <div class="refund-modal-header">
            <div class="flex items-center gap-3">
                <div class="refund-icon-wrapper">
                    {@html refund}
                </div>
                <div>
                    <h3 class="text-xl font-bold text-[#1a1a1a]">返金申請</h3>
                    <p class="text-xs text-[#718096]">以下の内容をご確認ください</p>
                </div>
            </div>
            <button class="icon-btn" disabled={isSubmitting} onclick={onClose}>
                {@html close}
            </button>
        </div>

        <!-- 订单信息卡片 -->
        <div class="refund-order-info">
            <div class="order-info-header">
				<span class="text-xs font-semibold tracking-wide text-[#718096] uppercase"
                >注文情報</span
                >
                <span class="status-badge {getStatusClass(order.status)}">
					{getStatusLabel(order.status)}
				</span>
            </div>

            <div class="order-info-details">
                <div class="order-info-row">
                    <span class="text-sm">注文番号</span>
                    <span class="font-mono text-sm font-semibold">
						{order.order_number}
					</span>
                </div>
                <div class="order-info-row">
                    <span class="text-sm">注文金額</span>
                    <span class="text-2xl font-bold">
						¥{order.total_amount.toLocaleString('ja-JP')}
					</span>
                </div>
                <div class="order-info-row">
                    <span class="text-sm">返金タイプ</span>
                    <span class="refund-type-badge">
						{getRefundTypeText()}
					</span>
                </div>
            </div>
        </div>

        <form class="refund-form" onsubmit={handleSubmit}>
            <!-- 退款类型选择 -->
            <div class="form-section">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="form-label">返金金額</label>
                <div class="refund-type-grid">
                    <label class="refund-type-card {refundData.refundType === 'full' ? 'active' : ''}">
                        <input
                                bind:group={refundData.refundType}
                                class="sr-only"
                                disabled={isSubmitting}
                                onchange={updateRefundAmount}
                                type="radio"
                                value="full"
                        />
                        <div class="refund-type-content">
                            <div class="refund-type-title">全額返金</div>
                            <div class="refund-type-desc">全額を返金します</div>
                        </div>
                        <div class="refund-type-check">
                            {@html checkCircle}
                        </div>
                    </label>

                    <label class="refund-type-card {refundData.refundType === 'partial' ? 'active' : ''}">
                        <input
                                bind:group={refundData.refundType}
                                class="sr-only"
                                disabled={isSubmitting}
                                type="radio"
                                value="partial"
                        />
                        <div class="refund-type-content">
                            <div class="refund-type-title">一部返金</div>
                            <div class="refund-type-desc">金額を指定します</div>
                        </div>
                        <div class="refund-type-check">
                            {@html checkCircle}
                        </div>
                    </label>
                </div>
            </div>

            <!-- 部分退款金额输入 -->
            {#if refundData.refundType === 'partial'}
                <div class="form-section partial-amount-section">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label class="form-label">返金金額を入力</label>
                    <div class="amount-input-wrapper">
                        <span class="amount-currency">¥</span>
                        <input
                                type="number"
                                bind:value={refundData.refundAmount}
                                min="1"
                                max={order.total_amount}
                                disabled={isSubmitting}
                                class="amount-input"
                                placeholder="金額を入力"
                                required
                        />
                    </div>
                    <div class="amount-range">
                        <span class="text-xs text-[#718096]">最小: ¥1</span>
                        <span class="text-xs font-semibold text-[#2d3748]">
							最大: ¥{order.total_amount.toLocaleString('ja-JP')}
						</span>
                    </div>
                </div>
            {/if}

            <!-- 退款理由 -->
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <div class="form-section">
                <label class="form-label">
                    返金理由 <span class="text-[#e53e3e]">*</span>
                </label>
                <div class="reason-grid">
                    {#each refundReasons as reason}
                        <label class="reason-option {refundData.refundReason === reason ? 'active' : ''}">
                            <input
                                    type="radio"
                                    bind:group={refundData.refundReason}
                                    value={reason}
                                    disabled={isSubmitting}
                                    class="sr-only"
                            />
                            <span class="reason-text">{reason}</span>
                            <span class="reason-check">
								{@html checkCircle}
							</span>
                        </label>
                    {/each}
                </div>
            </div>

            <!-- 退货单号（已发货时） -->
            {#if needsTrackingNumber()}
                <div class="tracking-notice">
                    <div class="tracking-notice-header">
                        <div class="tracking-notice-icon">
                            {@html warningIcon}
                        </div>
                        <div>
                            <h4 class="tracking-notice-title">返品が必要です</h4>
                            <p class="tracking-notice-desc">
                                商品が既に発送されているため、返品追跡番号の入力が必要です。
                            </p>
                        </div>
                    </div>

                    <div class="tracking-input-section">
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label class="form-label-dark">
                            返品追跡番号 <span class="text-[#e53e3e]">*</span>
                        </label>
                        <input
                                type="text"
                                bind:value={refundData.trackingNumber}
                                placeholder="例: 1234-5678-9012"
                                disabled={isSubmitting}
                                class="tracking-input"
                                required
                        />
                        <p class="tracking-hint">配送業者から受け取った追跡番号を入力してください</p>
                    </div>
                </div>
            {/if}

            <!-- 是否退货（未发货时） -->
            {#if !needsTrackingNumber()}
                <div class="return-goods-notice">
                    <label class="return-goods-option">
                        <input
                                type="checkbox"
                                bind:checked={refundData.returnGoods}
                                disabled={isSubmitting}
                                class="return-goods-checkbox"
                        />
                        <div class="return-goods-content">
                            <div class="return-goods-title">商品を返品する</div>
                            <p class="return-goods-desc">
                                商品を返品する場合は、チェックしてください。商品がまだ発送されていないため、直接返金されます。
                            </p>
                        </div>
                    </label>
                </div>
            {/if}

            <!-- 操作按钮 -->
            <div class="modal-actions">
                <button
                        class="btn-cancel"
                        disabled={isSubmitting}
                        onclick={onClose}
                        type="button"
                >
                    <span>キャンセル</span>
                </button>
                <button class="btn-submit" disabled={isSubmitting} type="submit">
                    {#if isSubmitting}
                        <div class="btn-spinner">
                            {@html spinnerSm}
                        </div>
                        処理中...
                    {:else}
                        <span>返金申請を送信</span>
                        <span class="btn-arrow">→</span>
                    {/if}
                </button>
            </div>
        </form>

        <!-- 注意事项 -->
        <div class="refund-notice">
            <div class="refund-notice-icon">
                {@html infoIcon}
            </div>
            <div class="refund-notice-content">
                <p class="refund-notice-text">
                    返金申請後、<strong>2-5営業日以内</strong>に処理されます。返金は元の支払い方法に戻されます。
                    {#if needsTrackingNumber()}
                        返品された商品が確認された後、返金が処理されます。
                    {/if}
                </p>
            </div>
        </div>
    </div>
</div>

<style>
    .refund-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 50;
        animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .refund-modal-content {
        background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
        border-radius: 1rem;
        padding: 0;
        max-width: 560px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .refund-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 2px solid #e2e8f0;
        background: white;
        border-radius: 1rem 1rem 0 0;
    }

    .refund-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%);
        border-radius: 0.75rem;
        color: white;
    }

    .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        color: #718096;
        background-color: transparent;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .icon-btn:hover:not(:disabled) {
        background-color: #f7fafc;
    }

    .icon-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 9999px;
    }

    .refund-order-info {
        margin: 1.5rem;
        background: linear-gradient(135deg, #1a202c 0%, #1a202c 100%);
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .order-info-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .order-info-details {
        padding: 1.25rem;
    }

    .order-info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: white;
    }

    .order-info-row:last-child {
        border-bottom: none;
    }

    .refund-type-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        background: rgba(252, 129, 129, 0.2);
        color: #fed7d7;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 9999px;
        border: 1px solid rgba(252, 129, 129, 0.3);
    }

    .refund-form {
        padding: 0 1.5rem 1.5rem;
    }

    .form-section {
        margin-bottom: 1.5rem;
    }

    .form-label {
        display: block;
        margin-bottom: 0.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #2d3748;
    }

    .refund-type-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
    }

    .refund-type-card {
        position: relative;
        cursor: pointer;
        border: 2px solid #e2e8f0;
        border-radius: 0.75rem;
        background: white;
        overflow: hidden;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .refund-type-card:hover {
        border-color: #cbd5e0;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .refund-type-card.active {
        border-color: #2d3748;
        background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
        box-shadow: 0 4px 12px -2px rgba(45, 55, 72, 0.4);
    }

    .refund-type-card.active .refund-type-content {
        color: white;
    }

    .refund-type-content {
        padding: 1.25rem;
        text-align: center;
    }

    .refund-type-title {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .refund-type-desc {
        font-size: 0.75rem;
        opacity: 0.75;
    }

    .refund-type-check {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        background: #48bb78;
        color: white;
        border-radius: 9999px;
        opacity: 0;
        transform: scale(0);
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .refund-type-card.active .refund-type-check {
        opacity: 1;
        transform: scale(1);
    }

    .partial-amount-section {
        animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .amount-input-wrapper {
        position: relative;
        margin-bottom: 0.5rem;
    }

    .amount-currency {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.125rem;
        font-weight: 600;
        color: #4a5568;
        pointer-events: none;
    }

    .amount-input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 2.5rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1a1a1a;
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 0.5rem;
        transition: all 0.2s;
    }

    .amount-input:focus {
        outline: none;
        border-color: #2d3748;
        box-shadow: 0 0 0 3px rgba(45, 55, 72, 0.1);
    }

    .amount-input:disabled {
        background-color: #f7fafc;
        cursor: not-allowed;
        opacity: 0.6;
    }

    .amount-range {
        display: flex;
        justify-content: space-between;
        padding: 0 0.25rem;
    }

    .reason-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }

    .reason-option {
        position: relative;
        display: flex;
        align-items: center;
        padding: 0.875rem 1rem;
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .reason-option:hover {
        border-color: #cbd5e0;
        background: #f7fafc;
    }

    .reason-option.active {
        border-color: #2d3748;
        background: #edf2f7;
    }

    .reason-text {
        flex: 1;
        font-size: 0.8125rem;
        color: #4a5568;
        font-weight: 500;
    }

    .reason-option.active .reason-text {
        color: #1a1a1a;
        font-weight: 600;
    }

    .reason-check {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.25rem;
        height: 1.25rem;
        color: #48bb78;
        opacity: 0;
        transform: scale(0);
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .reason-option.active .reason-check {
        opacity: 1;
        transform: scale(1);
    }

    .tracking-notice {
        padding: 1.25rem;
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        border: 2px solid #fbbf24;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .tracking-notice-header {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .tracking-notice-icon {
        flex-shrink: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f59e0b;
    }

    .tracking-notice-title {
        font-size: 0.9375rem;
        font-weight: 700;
        color: #92400e;
        margin-bottom: 0.25rem;
    }

    .tracking-notice-desc {
        font-size: 0.8125rem;
        color: #78350f;
        line-height: 1.5;
    }

    .tracking-input-section {
        margin-top: 1rem;
    }

    .form-label-dark {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #92400e;
    }

    .tracking-input {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #1a1a1a;
        background: white;
        border: 2px solid #fbbf24;
        border-radius: 0.5rem;
        transition: all 0.2s;
    }

    .tracking-input:focus {
        outline: none;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
    }

    .tracking-input:disabled {
        background-color: #fef3c7;
        cursor: not-allowed;
        opacity: 0.6;
    }

    .tracking-hint {
        margin-top: 0.5rem;
        font-size: 0.75rem;
        color: #78350f;
    }

    .return-goods-notice {
        padding: 1rem;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 2px solid #0ea5e9;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .return-goods-option {
        display: flex;
        gap: 0.75rem;
        cursor: pointer;
    }

    .return-goods-checkbox {
        flex-shrink: 0;
        width: 1.25rem;
        height: 1.25rem;
        margin-top: 0.125rem;
        border: 2px solid #0ea5e9;
        border-radius: 0.25rem;
        cursor: pointer;
        appearance: none;
        background: white;
        transition: all 0.2s;
    }

    .return-goods-checkbox:checked {
        background: #0ea5e9;
        border-color: #0ea5e9;
    }

    .return-goods-checkbox:checked::after {
        content: '✓';
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.75rem;
        font-weight: 700;
    }

    .return-goods-content {
        flex: 1;
    }

    .return-goods-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #075985;
        margin-bottom: 0.375rem;
    }

    .return-goods-desc {
        font-size: 0.8125rem;
        color: #0c4a6e;
        line-height: 1.5;
    }

    .modal-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    .btn-cancel {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        font-size: 0.9375rem;
        font-weight: 600;
        color: #4a5568;
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-cancel:hover:not(:disabled) {
        background: #f7fafc;
        border-color: #cbd5e0;
    }

    .btn-cancel:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-submit {
        flex: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        font-size: 0.9375rem;
        font-weight: 600;
        color: white;
        background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 6px -1px rgba(229, 62, 62, 0.3);
    }

    .btn-submit:hover:not(:disabled) {
        background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 12px -2px rgba(229, 62, 62, 0.4);
    }

    .btn-submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }

    .btn-spinner {
        display: inline-flex;
        animation: spin 1s linear infinite;
    }

    .btn-arrow {
        display: inline-flex;
        transition: transform 0.2s;
    }

    .btn-submit:hover:not(:disabled) .btn-arrow {
        transform: translateX(4px);
    }

    .refund-notice {
        display: flex;
        gap: 0.75rem;
        margin: 1.5rem;
        padding: 1rem;
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 1px solid #93c5fd;
        border-radius: 0.75rem;
    }

    .refund-notice-icon {
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        color: #3b82f6;
    }

    .refund-notice-content {
        flex: 1;
    }

    .refund-notice-text {
        font-size: 0.8125rem;
        color: #1e40af;
        line-height: 1.6;
    }

    .refund-notice-text strong {
        font-weight: 700;
        color: #1e3a8a;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            max-height: 0;
        }
        to {
            opacity: 1;
            max-height: 500px;
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }
</style>