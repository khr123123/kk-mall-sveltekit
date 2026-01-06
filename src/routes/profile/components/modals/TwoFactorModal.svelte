<!-- routes/profile/components/modals/TwoFactorModal.svelte -->
<script lang="ts">
    import { close, checkCircle } from '$lib/icons/svgs';
    import { dialogStore } from '$lib/stores/dialogStore';

    interface Props {
        onClose: () => void;
    }

    let { onClose }: Props = $props();

    let isSubmitting = $state(false);
    let isEnabled = $state(false);
    let step = $state<'intro' | 'setup' | 'verify' | 'complete'>('intro');
    let verificationCode = $state('');
    let backupCodes = $state<string[]>([]);
    let showBackupCodes = $state(false);

    async function enableTwoFactor() {
        isSubmitting = true;
        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 生成示例备份代码
            backupCodes = Array.from({ length: 8 }, (_, i) =>
                Math.random().toString(36).substr(2, 8).toUpperCase()
            );

            step = 'setup';
        } finally {
            isSubmitting = false;
        }
    }

    async function verifyCode() {
        if (!verificationCode || verificationCode.length !== 6) {
            dialogStore.alertDialog.show({
                title: 'エラー',
                message: '6桁の確認コードを入力してください',
                type: 'error'
            });
            return;
        }

        isSubmitting = true;
        try {
            // 模拟API验证
            await new Promise(resolve => setTimeout(resolve, 1000));

            step = 'complete';
            isEnabled = true;
        } finally {
            isSubmitting = false;
        }
    }

    function copyBackupCodes() {
        const text = backupCodes.join('\n');
        navigator.clipboard.writeText(text).then(() => {
            dialogStore.alertDialog.show({
                title: '成功',
                message: 'バックアップコードをコピーしました',
                type: 'success'
            });
        });
    }

    function downloadBackupCodes() {
        const text = backupCodes.join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function disableTwoFactor() {
        dialogStore.confirmDialog.show({
            title: '確認',
            message: '2段階認証を無効にしてもよろしいですか？',
            type: 'warning',
            confirmText: '無効にする',
            cancelText: 'キャンセル'
        }).then((confirmed) => {
            if (confirmed) {
                isEnabled = false;
                step = 'intro';
                dialogStore.alertDialog.show({
                    title: '成功',
                    message: '2段階認証を無効にしました',
                    type: 'success'
                });
            }
        });
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={onClose}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[#1a1a1a]">
                2段階認証を設定
            </h3>
            <button class="icon-btn" onclick={onClose} disabled={isSubmitting}>
                {@html close}
            </button>
        </div>

        {#if step === 'intro'}
            <div class="space-y-6">
                <div class="text-center">
                    <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        {@html checkCircle}
                    </div>
                    <h4 class="mb-2 text-lg font-semibold text-[#1a1a1a]">
                        アカウントのセキュリティを強化
                    </h4>
                    <p class="text-sm text-[#718096]">
                        2段階認証を有効にすることで、アカウントへの不正アクセスを防ぎます。
                        ログイン時にパスワードと確認コードの両方が必要になります。
                    </p>
                </div>

                <div class="rounded-lg bg-blue-50 p-4">
                    <h5 class="mb-2 text-sm font-semibold text-blue-800">メリット:</h5>
                    <ul class="space-y-1 text-sm text-blue-700">
                        <li class="flex items-center gap-2">
                            <div class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            アカウントのセキュリティ強化
                        </li>
                        <li class="flex items-center gap-2">
                            <div class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            不正ログインの防止
                        </li>
                        <li class="flex items-center gap-2">
                            <div class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            重要なデータの保護
                        </li>
                    </ul>
                </div>

                <div class="flex gap-3">
                    <button
                            type="button"
                            class="btn-secondary flex-1"
                            onclick={onClose}
                            disabled={isSubmitting}
                    >
                        後で
                    </button>
                    <button
                            type="button"
                            class="btn-primary flex-1"
                            onclick={enableTwoFactor}
                            disabled={isSubmitting}
                    >
                        {isSubmitting ? '設定中...' : '設定を開始'}
                    </button>
                </div>
            </div>
        {:else if step === 'setup'}
            <div class="space-y-6">
                <div class="text-center">
                    <h4 class="mb-4 text-lg font-semibold text-[#1a1a1a]">
                        認証アプリを設定
                    </h4>
                </div>

                <div class="space-y-4">
                    <div class="rounded-lg bg-gray-50 p-4">
                        <h5 class="mb-2 text-sm font-semibold text-gray-800">設定手順:</h5>
                        <ol class="list-inside list-decimal space-y-2 text-sm text-gray-700">
                            <li>Google Authenticator または Authy をインストール</li>
                            <li>アプリで「QRコードをスキャン」を選択</li>
                            <li>下のQRコードをスキャン</li>
                            <li>アプリに表示される6桁のコードを入力</li>
                        </ol>
                    </div>

                    <div class="flex justify-center">
                        <div class="h-48 w-48 border-4 border-dashed border-gray-300 flex items-center justify-center">
                            <p class="text-gray-500">QRコードプレビュー</p>
                        </div>
                    </div>

                    <div class="text-center">
                        <p class="mb-2 text-sm font-semibold text-gray-700">
                            シークレットキー: XXXX-XXXX-XXXX
                        </p>
                        <p class="text-xs text-gray-500">
                            手動で入力する場合はこのキーを使用してください
                        </p>
                    </div>

                    <div class="flex gap-3">
                        <button
                                type="button"
                                class="btn-secondary flex-1"
                                onclick={() => step = 'intro'}
                                disabled={isSubmitting}
                        >
                            戻る
                        </button>
                        <button
                                type="button"
                                class="btn-primary flex-1"
                                onclick={() => step = 'verify'}
                                disabled={isSubmitting}
                        >
                            次へ
                        </button>
                    </div>
                </div>
            </div>
        {:else if step === 'verify'}
            <div class="space-y-6">
                <div class="text-center">
                    <h4 class="mb-2 text-lg font-semibold text-[#1a1a1a]">
                        確認コードを入力
                    </h4>
                    <p class="text-sm text-[#718096]">
                        認証アプリに表示される6桁のコードを入力してください
                    </p>
                </div>

                <div class="space-y-4">
                    <div>
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label class="mb-1 block text-sm font-medium text-[#4a5568]">
                            6桁の確認コード
                        </label>
                        <input
                                type="text"
                                bind:value={verificationCode}
                                maxlength="6"
                                placeholder="000000"
                                class="input-field text-center text-2xl font-mono tracking-widest"
                                disabled={isSubmitting}
                        />
                    </div>

                    <div class="text-center">
                        <button type="button" class="text-sm text-blue-600 hover:text-blue-800">
                            コードが表示されませんか？
                        </button>
                    </div>

                    <div class="flex gap-3">
                        <button
                                type="button"
                                class="btn-secondary flex-1"
                                onclick={() => step = 'setup'}
                                disabled={isSubmitting}
                        >
                            戻る
                        </button>
                        <button
                                type="button"
                                class="btn-primary flex-1"
                                onclick={verifyCode}
                                disabled={isSubmitting || verificationCode.length !== 6}
                        >
                            {isSubmitting ? '確認中...' : '確認'}
                        </button>
                    </div>
                </div>
            </div>
        {:else if step === 'complete'}
            <div class="space-y-6">
                <div class="text-center">
                    <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        {@html checkCircle}
                    </div>
                    <h4 class="mb-2 text-lg font-semibold text-[#1a1a1a]">
                        2段階認証が有効になりました！
                    </h4>
                    <p class="text-sm text-[#718096]">
                        次回のログインから2段階認証が必要になります
                    </p>
                </div>

                {#if !showBackupCodes}
                    <div class="rounded-lg bg-yellow-50 p-4">
                        <h5 class="mb-2 text-sm font-semibold text-yellow-800">
                            重要: バックアップコードを保存
                        </h5>
                        <p class="text-sm text-yellow-700">
                            認証アプリにアクセスできない場合、これらのコードを使用してログインできます。
                            各コードは一度しか使用できません。
                        </p>
                        <button
                                type="button"
                                class="mt-3 w-full rounded-md border border-yellow-300 bg-white px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50"
                                onclick={() => showBackupCodes = true}
                        >
                            バックアップコードを表示
                        </button>
                    </div>
                {:else}
                    <div class="rounded-lg border border-gray-200 p-4">
                        <div class="mb-3 flex items-center justify-between">
                            <h5 class="text-sm font-semibold text-gray-800">バックアップコード:</h5>
                            <button
                                    type="button"
                                    class="text-sm text-gray-600 hover:text-gray-800"
                                    onclick={() => showBackupCodes = false}
                            >
                                閉じる
                            </button>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            {#each backupCodes as code, i}
                                <div class="rounded bg-gray-100 px-3 py-2 font-mono text-sm">
                                    {code}
                                </div>
                            {/each}
                        </div>
                        <div class="mt-3 flex gap-2">
                            <button
                                    type="button"
                                    class="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                                    onclick={copyBackupCodes}
                            >
                                コピー
                            </button>
                            <button
                                    type="button"
                                    class="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                                    onclick={downloadBackupCodes}
                            >
                                ダウンロード
                            </button>
                        </div>
                    </div>
                {/if}

                <div class="space-y-3">
                    <button
                            type="button"
                            class="w-full rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
                            onclick={onClose}
                    >
                        完了
                    </button>
                    <button
                            type="button"
                            class="w-full rounded-md border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                            onclick={disableTwoFactor}
                    >
                        2段階認証を無効にする
                    </button>
                </div>
            </div>
        {/if}
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

    .input-field:disabled {
        background-color: #f7fafc;
        cursor: not-allowed;
        opacity: 0.6;
    }
</style>