<!-- routes/profile/components/tabs/AddressesTab.svelte -->
<script lang="ts">
    import type { Address } from '$lib/types/profile';
    import { addrProfile, emptyLocation } from '$lib/icons/svgs';
    import AddressCard from '../cards/AddressCard.svelte';

    interface Props {
        addresses: Address[];
        onAdd: () => void;
        onEdit: (address: Address) => void;
        onDelete: (id: string) => Promise<boolean>;
        onSetDefault: (id: string) => Promise<boolean>;
    }

    let { addresses, onAdd, onEdit, onDelete, onSetDefault }: Props = $props();
</script>

<div class="rounded-lg border border-[#e0e0e0] bg-white p-6">
    <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-[#1a1a1a]">住所管理</h2>
        <button class="btn-primary" onclick={onAdd}>
            {@html addrProfile}
            <span>新しい住所を追加</span>
        </button>
    </div>

    {#if addresses.length > 0}
        <div class="grid gap-4 md:grid-cols-2">
            {#each addresses as address}
                <AddressCard
                        {address}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onSetDefault={onSetDefault}
                />
            {/each}
        </div>
    {:else}
        <div class="py-12 text-center">
            <div class="mb-3 flex justify-center text-gray-300">
                {@html emptyLocation}
            </div>
            <p class="text-[#718096]">登録された住所がありません</p>
        </div>
    {/if}
</div>

<style>
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

    .btn-primary:hover {
        background-color: #1a202c;
    }
</style>