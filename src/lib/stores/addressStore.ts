// src/lib/stores/addressStore.ts
import { writable, get } from 'svelte/store';
import type { Address } from '$lib/types/type';
import { currentUser } from './userStore';
import { pb } from '$lib/services/categoryService';

/**
 * 地址状态
 */
interface AddressState {
	addresses: Address[];
	loading: boolean;
	error: string | null;
}

const initialState: AddressState = {
	addresses: [],
	loading: false,
	error: null
};

// 创建地址 Store
function createAddressStore() {
	const { subscribe, set, update } = writable<AddressState>(initialState);

	return {
		subscribe,

		/**
		 * 加载地址列表
		 */
		async load() {
			const user = get(currentUser);
			if (!user) {
				set(initialState);
				return;
			}

			update(state => ({ ...state, loading: true, error: null }));

			try {
				const records = await pb.collection('addresses').getFullList<Address>({
					filter: `user="${user.id}"`,
					sort: '-is_default,-created'
				});

				update(state => ({
					...state,
					addresses: records,
					loading: false
				}));
			} catch (error) {
				console.error('地址加载失败:', error);
				update(state => ({
					...state,
					loading: false,
					error: '住所の読み込みに失敗しました'
				}));
			}
		},

		/**
		 * 添加地址
		 */
		async add(address: Omit<Address, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated' | 'user'>) {
			const user = get(currentUser);
			if (!user) {
				throw new Error('ログインが必要です');
			}

			try {
				// 如果设置为默认地址，先取消其他默认地址
				if (address.is_default) {
					const currentAddresses = get({ subscribe }).addresses;
					await Promise.all(
						currentAddresses
							.filter(a => a.is_default)
							.map(a => pb.collection('addresses').update(a.id, { is_default: false }))
					);
				}

				await pb.collection('addresses').create({
					...address,
					user: user.id
				});

				await this.load();
			} catch (error) {
				console.error('地址添加失败:', error);
				throw new Error('住所の追加に失敗しました');
			}
		},

		/**
		 * 更新地址
		 */
		async update(id: string, address: Partial<Address>) {
			try {
				// 如果设置为默认地址，先取消其他默认地址
				if (address.is_default) {
					const currentAddresses = get({ subscribe }).addresses;
					await Promise.all(
						currentAddresses
							.filter(a => a.id !== id && a.is_default)
							.map(a => pb.collection('addresses').update(a.id, { is_default: false }))
					);
				}

				await pb.collection('addresses').update(id, address);
				await this.load();
			} catch (error) {
				console.error('地址更新失败:', error);
				throw new Error('住所の更新に失敗しました');
			}
		},

		/**
		 * 删除地址
		 */
		async delete(id: string) {
			try {
				await pb.collection('addresses').delete(id);
				
				update(state => ({
					...state,
					addresses: state.addresses.filter(a => a.id !== id)
				}));
			} catch (error) {
				console.error('地址删除失败:', error);
				throw new Error('住所の削除に失敗しました');
			}
		},

		/**
		 * 设置默认地址
		 */
		async setDefault(id: string) {
			await this.update(id, { is_default: true });
		},

		/**
		 * 重置状态
		 */
		reset() {
			set(initialState);
		}
	};
}

export const addressStore = createAddressStore();