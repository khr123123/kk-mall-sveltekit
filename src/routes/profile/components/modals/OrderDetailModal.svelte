<!-- routes/profile/components/modals/OrderDetailModal.svelte -->
<script lang="ts">
    import type { Order } from '$lib/types/profile';
    import { close } from '$lib/icons/svgs';

    interface Props {
        order: Order;
        onClose: () => void;
    }

    let { order, onClose }: Props = $props();

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
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={onClose}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[#1a1a1a]">
                注文詳細: {order.order_number}
            </h3>
            <button class="icon-btn" onclick={onClose}>
                {@html close}
            </button>
        </div>

        <div class="space-y-6">
            <!-- 订单状态信息 -->
            <div class="rounded-lg bg-gray-50 p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-sm font-medium text-gray-700">ステータス:</span>
                        <span class="ml-2 status-badge {getStatusClass(order.status)}">
							{getStatusLabel(order.status)}
						</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        注文日: {new Date(order.order_date).toLocaleDateString('ja-JP')}
                    </div>
                </div>
            </div>

            <!-- 订单概要 -->
            <div class="grid grid-cols-2 gap-4">
                <div class="rounded-lg border border-gray-200 p-4">
                    <h4 class="mb-2 text-sm font-semibold text-gray-800">お届け先</h4>
                    <p class="text-sm text-gray-600">
                        {order.shipping_address || '住所情報がありません'}
                    </p>
                </div>
                <div class="rounded-lg border border-gray-200 p-4">
                    <h4 class="mb-2 text-sm font-semibold text-gray-800">支払い方法</h4>
                    <p class="text-sm text-gray-600">
                        {order.payment_method === 'credit_card' ? 'クレジットカード' :
                            order.payment_method === 'paypay' ? 'PayPay' :
                                order.payment_method === 'cod' ? '代金引換' : 'その他'}
                    </p>
                </div>
            </div>

            <!-- 商品明细 -->
            <div>
                <h4 class="mb-3 text-sm font-semibold text-gray-800">商品明细</h4>
                <div class="space-y-3">
                    {#if order.items && order.items.length > 0}
                        {#each order.items as item}
                            <div class="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                <div class="flex items-center gap-3">
                                    <div class="h-16 w-16 rounded-md bg-gray-100"></div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-800">{item.name}</p>
                                        <p class="text-xs text-gray-600">数量: {item.quantity}</p>
                                    </div>
                                </div>
                                <p class="text-sm font-medium text-gray-800">
                                    ¥{item.price.toLocaleString('ja-JP')}
                                </p>
                            </div>
                        {/each}
                    {:else}
                        <p class="text-center text-sm text-gray-600">商品情報がありません</p>
                    {/if}
                </div>
            </div>

            <!-- 金额汇总 -->
            <div class="rounded-lg bg-gray-50 p-4">
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">小計:</span>
                        <span class="font-medium">¥{order.subtotal?.toLocaleString('ja-JP') || '0'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">送料:</span>
                        <span class="font-medium">¥{order.shipping_fee?.toLocaleString('ja-JP') || '0'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">消費税:</span>
                        <span class="font-medium">¥{order.tax?.toLocaleString('ja-JP') || '0'}</span>
                    </div>
                    <div class="flex justify-between border-t border-gray-200 pt-2 text-base">
                        <span class="font-semibold text-gray-800">合計:</span>
                        <span class="font-bold">¥{order.total_amount.toLocaleString('ja-JP')}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6 flex justify-end">
            <button class="btn-secondary" onclick={onClose}>
                閉じる
            </button>
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 50;
    }

    .modal-content {
        background-color: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
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

    .icon-btn:hover {
        background-color: #f7fafc;
    }

    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 9999px;
    }

    .status-default {
        color: #4a5568;
        background-color: #edf2f7;
    }

    .status-info {
        color: #2c5282;
        background-color: #bee3f8;
    }

    .status-success {
        color: #22543d;
        background-color: #c6f6d5;
    }

    .status-danger {
        color: #742a2a;
        background-color: #fed7d7;
    }

    .btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #4a5568;
        background-color: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-secondary:hover {
        background-color: #edf2f7;
        border-color: #cbd5e0;
    }
</style>