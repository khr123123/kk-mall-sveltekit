<!-- routes/profile/components/tabs/OrdersTab.svelte -->
<script lang="ts">
    import type { Order } from '$lib/types/profile';
    import { refund, emptyBox } from '$lib/icons/svgs';

    interface Props {
        orders: Order[];
        onRefund: (order: Order) => void;
        getStatusLabel: (status: string) => string;
        getStatusClass: (status: string) => string;
    }

    let { orders, onRefund, getStatusLabel, getStatusClass }: Props = $props();

    function canRefund(order: Order): boolean {
        return ['pending', 'processing', 'shipped', 'delivered'].includes(order.status);
    }

    function getRefundTypeText(order: Order): string {
        if (order.status === 'pending' || order.status === 'processing') {
            return '直接返金';
        } else {
            return '返品返金';
        }
    }
</script>

<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
    <h2 class="mb-6 text-xl font-semibold text-[#1a1a1a]">注文履歴</h2>

    {#if orders.length > 0}
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                <tr class="border-b border-[#e0e0e0]">
                    <th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]">注文番号</th>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]">注文日</th>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]">商品数</th>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]">合計金額</th>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]">ステータス</th>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-[#4a5568]">操作</th>
                </tr>
                </thead>
                <tbody>
                {#each orders as order}
                    <tr class="border-b border-[#f0f0f0] transition-colors hover:bg-[#fafafa]">
                        <td class="px-4 py-3">
                            <div class="text-sm font-medium text-[#1a1a1a]">
                                {order.order_number}
                            </div>
                        </td>
                        <td class="px-4 py-3 text-sm text-[#718096]">
                            {new Date(order.order_date).toLocaleDateString('ja-JP')}
                        </td>
                        <td class="px-4 py-3 text-sm text-[#718096]">{order.items_count}点</td>
                        <td class="px-4 py-3">
                            <div class="font-semibold text-[#1a1a1a]">
                                ¥{order.total_amount.toLocaleString('ja-JP')}
                            </div>
                        </td>
                        <td class="px-4 py-3">
								<span class="status-badge {getStatusClass(order.status)}">
									{getStatusLabel(order.status)}
								</span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex gap-2">
                                <button class="btn-link">詳細</button>
                                {#if canRefund(order)}
                                    <button
                                            class="btn-link-danger"
                                            onclick={() => onRefund(order)}
                                    >
                                        {@html refund}
                                        <span>{getRefundTypeText(order)}</span>
                                    </button>
                                {/if}
                            </div>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <div class="py-12 text-center">
            <div class="mb-3 flex justify-center text-gray-300">
                {@html emptyBox}
            </div>
            <p class="text-[#718096]">注文履歴がありません</p>
        </div>
    {/if}
</div>

<style>
    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 9999px;
    }

    .btn-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #4a5568;
        background-color: transparent;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-link:hover {
        background-color: #f7fafc;
        border-color: #cbd5e0;
    }

    .btn-link-danger {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #e53e3e;
        background-color: transparent;
        border: 1px solid #fc8181;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-link-danger:hover {
        background-color: #fff5f5;
        border-color: #e53e3e;
    }
</style>