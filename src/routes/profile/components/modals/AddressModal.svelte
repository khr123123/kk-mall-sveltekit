<!-- routes/profile/components/modals/AddressModal.svelte -->
<script lang="ts">
    import type { Address } from '$lib/types/profile';
    import { close } from '$lib/icons/svgs';
    import { dialogStore } from '$lib/stores/dialogStore';

    interface Props {
        address: Address | null;
        onClose: () => void;
        onSave: (addressData: any) => Promise<boolean>;
    }

    let { address, onClose, onSave }: Props = $props();

    let formData = $state({
        label: address?.label || '',
        recipient: address?.recipient || '',
        phone: address?.phone || '',
        postal_code: address?.postal_code || '',
        address: address?.address || '',
        is_default: address?.is_default || false
    });

    let isSubmitting = $state(false);

    async function handleSubmit(e: Event) {
        e.preventDefault();

        if (isSubmitting) return;

        isSubmitting = true;

        try {
            const success = await onSave(formData);
            if (success) {
                onClose();
            } else {
                dialogStore.alertDialog.show({
                    title: 'エラー',
                    message: '住所の保存に失敗しました',
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
<div class="modal-overlay" onclick={onClose}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[#1a1a1a]">
                {address ? '住所を編集' : '新しい住所を追加'}
            </h3>
            <button class="icon-btn" onclick={onClose}>
                {@html close}
            </button>
        </div>

        <form onsubmit={handleSubmit} class="space-y-4">
            <div>
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="mb-1 block text-sm font-medium text-[#4a5568]">ラベル</label>
                <input
                        type="text"
                        bind:value={formData.label}
                        placeholder="例: 自宅、会社"
                        class="input-field"
                        required
                />
            </div>

            <div>
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="mb-1 block text-sm font-medium text-[#4a5568]">受取人</label>
                <input
                        type="text"
                        bind:value={formData.recipient}
                        placeholder="山田 太郎"
                        class="input-field"
                        required
                />
            </div>

            <div>
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="mb-1 block text-sm font-medium text-[#4a5568]">電話番号</label>
                <input
                        type="tel"
                        bind:value={formData.phone}
                        placeholder="080-1234-5678"
                        class="input-field"
                        required
                />
            </div>

            <div>
                <!-- svelte-ignore a11y_label_has_controlled_control -->
                <label class="mb-1 block text-sm font-medium text-[#4a5568]">郵便番号</label>
                <input
                        type="text"
                        bind:value={formData.postal_code}
                        placeholder="〒150-0001"
                        class="input-field"
                        required
                />
            </div>

            <div>
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="mb-1 block text-sm font-medium text-[#4a5568]">住所</label>
                <textarea
                        bind:value={formData.address}
                        placeholder="東京都渋谷区神宮前1-1-1"
                        class="input-field"
                        rows="3"
                        required
                ></textarea>
            </div>

            <label class="flex items-center gap-2">
                <input type="checkbox" bind:checked={formData.is_default} class="checkbox" />
                <span class="text-sm text-[#4a5568]">既定の住所として設定</span>
            </label>

            <div class="flex gap-3 pt-2">
                <button type="button" class="btn-secondary flex-1" onclick={onClose}>
                    キャンセル
                </button>
                <button type="submit" class="btn-primary flex-1" disabled={isSubmitting}>
                    {isSubmitting ? '保存中...' : '保存'}
                </button>
            </div>
        </form>
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
        max-width: 500px;
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

    .input-field {
        width: 100%;
        padding: 0.625rem 0.75rem;
        font-size: 0.875rem;
        color: #1a1a1a;
        background-color: white;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        transition: border-color 0.2s;
    }

    .input-field:focus {
        outline: none;
        border-color: #2d3748;
    }

    .checkbox {
        width: 1rem;
        height: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: white;
        background-color: #2d3748;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
        background-color: #1a202c;
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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