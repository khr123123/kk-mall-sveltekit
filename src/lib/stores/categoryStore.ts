// src/lib/stores/categoryStore.ts
import { writable } from 'svelte/store';
import type { Category } from '$lib/services/categoryService';

interface CategoryStore {
    categories: Category[];
    isLoaded: boolean;
}

function createCategoryStore() {
    const { subscribe, set, update } = writable<CategoryStore>({
        categories: [],
        isLoaded: false
    });

    return {
        subscribe,
        setCategories: (categories: Category[]) => {
            update(store => ({
                ...store,
                categories,
                isLoaded: true
            }));
        },
        reset: () => {
            set({ categories: [], isLoaded: false });
        },
        getCategory: (id: string) => {
            let category: Category | undefined;
            subscribe(store => {
                category = store.categories.find(cat => cat.id === id);
            })();
            return category;
        }
    };
}

export const categoryStore = createCategoryStore();
