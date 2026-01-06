<!-- routes/profile/components/dialogs/AlertDialog.svelte -->
<script lang="ts">
    import { dialogStore } from '$lib/stores/dialogStore';
    import { checkCircle, cancelIcon, infoIcon } from '$lib/icons/svgs';

    let dialog = $state<any>(null);

    $effect(() => {
        const unsubscribe = dialogStore.alertDialog.subscribe((value) => {
            dialog = value;
        });
        return unsubscribe;
    });

    function handleClose() {
        dialogStore.alertDialog.hide();
    }
</script>

{#if dialog?.show}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="alert-dialog-overlay" onclick={handleClose}>
        <div class="alert-dialog-content {dialog.type}" onclick={(e) => e.stopPropagation()}>
            <div class="alert-dialog-header">
                <div class="alert-dialog-icon">
                    {#if dialog.type === 'error'}
                        {@html cancelIcon}
                    {:else if dialog.type === 'success'}
                        {@html checkCircle}
                    {:else}
                        {@html infoIcon}
                    {/if}
                </div>
                <h3 class="alert-dialog-title">{dialog.title}</h3>
            </div>
            <p class="alert-dialog-message">{dialog.message}</p>
            <button class="alert-btn-close" onclick={handleClose}>閉じる</button>
        </div>
    </div>
{/if}

<style>
    .alert-dialog-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 60;
        animation: fadeIn 0.2s ease-out;
    }

    .alert-dialog-content {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        max-width: 380px;
        width: 100%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
        animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .alert-dialog-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .alert-dialog-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        border-radius: 9999px;
    }

    .alert-dialog-content.error .alert-dialog-icon {
        background: #fee2e2;
        color: #ef4444;
    }

    .alert-dialog-content.success .alert-dialog-icon {
        background: #d1fae5;
        color: #10b981;
    }

    .alert-dialog-content.info .alert-dialog-icon {
        background: #dbeafe;
        color: #3b82f6;
    }

    .alert-dialog-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: #1a1a1a;
        text-align: center;
    }

    .alert-dialog-message {
        color: #4a5568;
        text-align: center;
        line-height: 1.6;
        margin-bottom: 1.5rem;
    }

    .alert-btn-close {
        width: 100%;
        padding: 0.75rem 1.5rem;
        font-size: 0.9375rem;
        font-weight: 600;
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .alert-dialog-content.error .alert-btn-close {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .alert-dialog-content.success .alert-btn-close {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .alert-dialog-content.info .alert-btn-close {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .alert-btn-close:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.2);
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes scaleUp {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    :global(.alert-dialog-icon svg) {
        width: 1.75rem;
        height: 1.75rem;
    }
</style>