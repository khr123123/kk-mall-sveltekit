<!-- routes/profile/components/cards/AddressCard.svelte -->
<script lang="ts">
    import type { Address } from '$lib/types/profile';
    import { editProfile, deleteProfile } from '$lib/icons/svgs';
    import { formatters } from '$lib/utils/formatters';

    interface Props {
        address: Address;
        onEdit: (address: Address) => void;
        onDelete: (id: string) => void;
        onSetDefault: (id: string) => void;
    }

    let { address, onEdit, onDelete, onSetDefault }: Props = $props();
</script>

<div class="address-card">
    <div class="address-card-header">
        <div class="address-card-title-group">
            <h3 class="address-card-title">{address.label}</h3>
            {#if address.is_default}
                <span class="address-card-badge">既定</span>
            {/if}
        </div>
        <div class="address-card-actions">
            <button class="icon-btn" onclick={() => onEdit(address)} title="編集">
                {@html editProfile}
            </button>
            <button
                    class="icon-btn icon-btn-danger"
                    onclick={() => onDelete(address.id)}
                    title="削除"
            >
                {@html deleteProfile}
            </button>
        </div>
    </div>

    <div class="address-card-content">
        <p class="address-card-recipient">{address.recipient}</p>
        <p class="address-card-text">{formatters.phone(address.phone)}</p>
        <p class="address-card-text">{formatters.postalCode(address.postal_code)}</p>
        <p class="address-card-address">{address.address}</p>
    </div>

    {#if !address.is_default}
        <button class="address-card-default-btn" onclick={() => onSetDefault(address.id)}>
            既定に設定
        </button>
    {/if}
</div>

<style>
    .address-card {
        padding: 1.25rem;
        border: 1px solid #e0e0e0;
        border-radius: 0.5rem;
        transition: all 0.2s;
        background: white;
    }

    .address-card:hover {
        border-color: #cbd5e0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .address-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .address-card-title-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }

    .address-card-title {
        font-size: 1rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
    }

    .address-card-badge {
        display: inline-block;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 500;
        color: white;
        background-color: #2d3748;
        border-radius: 9999px;
    }

    .address-card-actions {
        display: flex;
        gap: 0.25rem;
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
        transition: all 0.2s;
    }

    .icon-btn:hover {
        background-color: #f7fafc;
        color: #4a5568;
    }

    .icon-btn-danger {
        color: #e53e3e;
    }

    .icon-btn-danger:hover {
        background-color: #fff5f5;
        color: #c53030;
    }

    .address-card-content {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        margin-bottom: 0.75rem;
    }

    .address-card-recipient {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
    }

    .address-card-text {
        font-size: 0.875rem;
        color: #4a5568;
        margin: 0;
    }

    .address-card-address {
        font-size: 0.875rem;
        color: #4a5568;
        line-height: 1.5;
        margin: 0;
    }

    .address-card-default-btn {
        width: 100%;
        padding: 0.5rem 1rem;
        font-size: 0.8125rem;
        font-weight: 500;
        color: #4a5568;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .address-card-default-btn:hover {
        background: #f7fafc;
        border-color: #cbd5e0;
        color: #2d3748;
    }

    :global(.icon-btn svg) {
        width: 1rem;
        height: 1rem;
    }
</style>