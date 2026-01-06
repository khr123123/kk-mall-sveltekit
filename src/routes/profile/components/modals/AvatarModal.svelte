<!-- routes/profile/components/modals/AvatarModal.svelte -->
<script lang="ts">
    import { close, camera } from '$lib/icons/svgs';
    import { dialogStore } from '$lib/stores/dialogStore';

    interface Props {
        currentAvatar: string | undefined;
        onClose: () => void;
        onUpload: (file: File) => Promise<boolean>;
    }

    let { currentAvatar, onClose, onUpload }: Props = $props();

    let selectedFile = $state<File | null>(null);
    let previewUrl = $state<string | null>(null);
    let isUploading = $state(false);

    function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            selectedFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                previewUrl = e.target?.result as string;
            };
            reader.readAsDataURL(selectedFile);
        }
    }

    async function handleUpload() {
        if (!selectedFile) return;

        isUploading = true;
        try {
            const success = await onUpload(selectedFile);
            if (success) {
                onClose();
                dialogStore.alertDialog.show({
                    title: '成功',
                    message: 'アバターを更新しました',
                    type: 'success'
                });
            } else {
                dialogStore.alertDialog.show({
                    title: 'エラー',
                    message: 'アバターのアップロードに失敗しました',
                    type: 'error'
                });
            }
        } finally {
            isUploading = false;
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={onClose}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[#1a1a1a]">アバターを変更</h3>
            <button class="icon-btn" onclick={onClose} disabled={isUploading}>
                {@html close}
            </button>
        </div>

        <div class="space-y-4">
            <div class="flex justify-center">
                <img
                        src={previewUrl || currentAvatar || '/logo.png'}
                        alt="プレビュー"
                        class="h-32 w-32 rounded-full border-2 border-[#e0e0e0] object-cover"
                />
            </div>

            <div>
                <label
                        class="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#cbd5e0] bg-[#f7fafc] px-4 py-8 transition-colors hover:border-[#2d3748] hover:bg-[#edf2f7]"
                >
                    {@html camera}
                    <span class="text-sm text-[#4a5568]">
						{selectedFile ? selectedFile.name : 'クリックして画像を選択'}
					</span>
                    <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onchange={handleFileSelect}
                            class="hidden"
                            disabled={isUploading}
                    />
                </label>
                <p class="mt-2 text-xs text-[#718096]">JPG、PNG、GIF、WebP形式、最大5MB</p>
            </div>

            <div class="flex gap-3">
                <button
                        type="button"
                        class="btn-secondary flex-1"
                        onclick={onClose}
                        disabled={isUploading}
                >
                    キャンセル
                </button>
                <button
                        type="button"
                        class="btn-primary flex-1"
                        onclick={handleUpload}
                        disabled={!selectedFile || isUploading}
                >
                    {isUploading ? 'アップロード中...' : 'アップロード'}
                </button>
            </div>
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

    .icon-btn:hover:not(:disabled) {
        background-color: #f7fafc;
    }

    .icon-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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

    .btn-secondary:hover:not(:disabled) {
        background-color: #edf2f7;
        border-color: #cbd5e0;
    }

    .btn-secondary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>