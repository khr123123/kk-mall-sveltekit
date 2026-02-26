import { pb } from './PBConfig';
import { toast } from '$lib/stores/toastStore';

export interface Order {
	id: string;
	order_number: string;
	user: string;
	order_date: string;
	total_amount: number;
	status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
	items_count: number;
	items?: any[];
	shipping_address?: string;
	payment_id: string;
	amount: any;
	payment_method: string;
	created: string;
	updated: string;
}

export interface Address {
	id: string;
	user: string;
	label: string;
	recipient: string;
	phone: string;
	postal_code: string;
	address: string;
	is_default: boolean;
	created: string;
	updated: string;
}

export interface Favorite {
	id: string;
	user: string;
	product_id: string;
	brands_id: string;
	created: string;
	updated: string;
	expand?: any;
}

class ProfileService {
	// ============ Order Management ============
	async getOrders(userId: string, page = 1, perPage = 10) {
		try {
			const records = await pb.collection('orders').getList(page, perPage, {
				filter: `user = "${userId}"`,
				sort: '-order_date',
				expand: 'shipping_address'
			});

			return {
				success: true,
				orders: records.items,
				totalPages: records.totalPages,
				totalItems: records.totalItems
			};
		} catch (error: any) {
			console.error('Failed to get orders:', error);
			toast.error('注文の読み込みに失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	async getOrderById(orderId: string) {
		try {
			const record = await pb.collection('orders').getOne(orderId, {
				expand: 'shipping_address'
			});

			return {
				success: true,
				order: record
			};
		} catch (error: any) {
			console.error('Failed to get order details:', error);
			toast.error('注文詳細の読み込みに失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	async cancelOrder(orderId: string) {
		try {
			const record = await pb.collection('orders').update(orderId, {
				status: 'cancelled'
			});

			toast.success('注文をキャンセルしました');
			return {
				success: true,
				order: record
			};
		} catch (error: any) {
			console.error('Failed to cancel order:', error);
			toast.error('注文のキャンセルに失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	// ============ Address Management ============
	async getAddresses(userId: string) {
		try {
			const records = await pb.collection('addresses').getFullList({
				filter: `user = "${userId}"`,
				sort: '-is_default,-created'
			});

			return {
				success: true,
				addresses: records
			};
		} catch (error: any) {
			console.error('Failed to get addresses:', error);
			return {
				success: false,
				error: error.message
			};
		}
	}

	async createAddress(userId: string, addressData: Partial<Address>) {
		try {
			if (addressData.is_default) {
				await this.clearDefaultAddresses(userId);
			}

			const record = await pb.collection('addresses').create({
				user: userId,
				...addressData
			});

			toast.success('住所を追加しました');
			return {
				success: true,
				address: record
			};
		} catch (error: any) {
			console.error('Failed to create address:', error);
			toast.error('住所の追加に失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	async updateAddress(addressId: string, userId: string, addressData: Partial<Address>) {
		try {
			if (addressData.is_default) {
				await this.clearDefaultAddresses(userId);
			}

			const record = await pb.collection('addresses').update(addressId, addressData);

			toast.success('住所を更新しました');
			return {
				success: true,
				address: record
			};
		} catch (error: any) {
			console.error('Failed to update address:', error);
			toast.error('住所の更新に失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	async deleteAddress(addressId: string) {
		try {
			await pb.collection('addresses').delete(addressId);

			toast.success('住所を削除しました');
			return {
				success: true
			};
		} catch (error: any) {
			console.error('Failed to delete address:', error);
			toast.error('住所の削除に失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	async setDefaultAddress(addressId: string, userId: string) {
		try {
			await this.clearDefaultAddresses(userId);

			const record = await pb.collection('addresses').update(addressId, {
				is_default: true
			});

			toast.success('デフォルト住所を設定しました');
			return {
				success: true,
				address: record
			};
		} catch (error: any) {
			console.error('Failed to set default address:', error);
			toast.error('デフォルト住所の設定に失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	private async clearDefaultAddresses(userId: string) {
		try {
			const addresses = await pb.collection('addresses').getFullList({
				filter: `user = "${userId}" && is_default = true`
			});

			for (const address of addresses) {
				await pb.collection('addresses').update(address.id, {
					is_default: false
				});
			}
		} catch (error) {
			console.error('Failed to clear default addresses:', error);
		}
	}

	// ============ Favorites Management ============
	async getFavorites(userId: string) {
		try {
			const records = await pb.collection('favorites').getFullList({
				filter: `user = "${userId}"`,
				expand: 'product_id,brands_id',
				sort: '-created'
			});

			return {
				success: true,
				favorites: records
			};
		} catch (error: any) {
			console.error('Failed to get favorites:', error);
			return {
				success: false,
				error: error.message
			};
		}
	}

	async addFavorite(
		userId: string,
		favoriteData: Omit<Favorite, 'id' | 'user' | 'created' | 'updated'>
	) {
		try {
			const record = await pb.collection('favorites').create({
				user: userId,
				...favoriteData
			});

			toast.success('お気に入りに追加しました');
			return {
				success: true,
				favorite: record
			};
		} catch (error: any) {
			console.error('Failed to add favorite:', error);
			toast.error('お気に入りの追加に失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	async addFavoriteProduct(userId: string, productId: string, brandsId?: string) {
		try {
			const existing = await pb
				.collection('favorites')
				.getFullList({ filter: `user = "${userId}"` });

			if (existing.length > 0) {
				const record = existing[0];
				const current = record.product_id as any;
				let next: any;

				if (Array.isArray(current)) {
					if (current.includes(productId)) {
						toast.info('すでにお気に入りに追加されています');
						return { success: true, favorite: record };
					}
					next = [...current, productId];
				} else if (typeof current === 'string' && current) {
					if (current === productId) {
						toast.info('すでにお気に入りに追加されています');
						return { success: true, favorite: record };
					}
					next = [current, productId];
				} else {
					next = [productId];
				}

				const updated = await pb.collection('favorites').update(record.id, {
					product_id: next
				});
				toast.success('お気に入りに追加しました');
				return { success: true, favorite: updated };
			}

			const created = await pb.collection('favorites').create({
				user: userId,
				product_id: [productId],
				...(brandsId ? { brands_id: brandsId } : {})
			});
			toast.success('お気に入りに追加しました');
			return { success: true, favorite: created };
		} catch (error: any) {
			console.error('Failed to add favorite:', error);
			toast.error('お気に入りの追加に失敗しました');
			return { success: false, error: error.message };
		}
	}

	async removeFavorite(favoriteId: string) {
		try {
			await pb.collection('favorites').delete(favoriteId);

			toast.success('お気に入りから削除しました');
			return {
				success: true
			};
		} catch (error: any) {
			console.error('Failed to remove favorite:', error);
			toast.error('お気に入りの削除に失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	async removeFavoriteProduct(userId: string, productId: string) {
		try {
			const records = await pb.collection('favorites').getFullList({
				filter: `user = "${userId}" && (product_id ~ "${productId}" || product_id = "${productId}")`
			});

			if (records.length === 0) {
				return { success: true };
			}

			const record = records[0];
			const current = record.product_id as any;

			if (Array.isArray(current)) {
				const next = current.filter((id: string) => id !== productId);
				if (next.length === 0) {
					await pb.collection('favorites').delete(record.id);
				} else {
					await pb.collection('favorites').update(record.id, { product_id: next });
				}
				toast.success('お気に入りから削除しました');
				return { success: true };
			}

			if (typeof current === 'string' && current === productId) {
				await pb.collection('favorites').delete(record.id);
			}
			toast.success('お気に入りから削除しました');
			return { success: true };
		} catch (error: any) {
			console.error('Failed to remove favorite:', error);
			toast.error('お気に入りの削除に失敗しました');
			return { success: false, error: error.message };
		}
	}

	async clearFavorites(userId: string) {
		try {
			const favorites = await pb.collection('favorites').getFullList({
				filter: `user = "${userId}"`
			});

			for (const favorite of favorites) {
				await pb.collection('favorites').delete(favorite.id);
			}

			toast.success('お気に入りをすべて削除しました');
			return {
				success: true
			};
		} catch (error: any) {
			console.error('Failed to clear favorites:', error);
			toast.error('お気に入りの削除に失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	async isFavorite(userId: string, productId: string) {
		try {
			const records = await pb.collection('favorites').getFullList({
				filter: `user = "${userId}" && (product_id ~ "${productId}" || product_id = "${productId}")`
			});

			return {
				success: true,
				isFavorite: records.length > 0,
				favoriteId: records.length > 0 ? records[0].id : null
			};
		} catch (error: any) {
			console.error('Failed to check favorite status:', error);
			return {
				success: false,
				error: error.message
			};
		}
	}

	// ============ Avatar Management ============
	async updateAvatar(userId: string, avatarFile: File) {
		try {
			const formData = new FormData();
			formData.append('avatar', avatarFile);

			const record = await pb.collection('users').update(userId, formData);

			toast.success('プロフィール画像を更新しました');
			return {
				success: true,
				user: record,
				avatarUrl: pb.getFileUrl(record, record.avatar)
			};
		} catch (error: any) {
			console.error('Failed to update avatar:', error);
			toast.error('プロフィール画像の更新に失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	async deleteAvatar(userId: string) {
		try {
			const record = await pb.collection('users').update(userId, {
				avatar: null
			});

			toast.success('プロフィール画像を削除しました');
			return {
				success: true,
				user: record
			};
		} catch (error: any) {
			console.error('Failed to delete avatar:', error);
			toast.error('プロフィール画像の削除に失敗しました');
			return {
				success: false,
				error: error.message
			};
		}
	}

	// ============ User Stats ============
	async getUserStats(userId: string) {
		try {
			const [ordersResult, favoritesResult, addressesResult] = await Promise.all([
				this.getOrders(userId, 1, 1),
				this.getFavorites(userId),
				this.getAddresses(userId)
			]);

			return {
				success: true,
				stats: {
					totalOrders: ordersResult.success ? ordersResult.totalItems || 0 : 0,
					totalFavorites: favoritesResult.success
						? favoritesResult.favorites?.length || 0
						: 0,
					totalAddresses: addressesResult.success
						? addressesResult.addresses?.length || 0
						: 0
				}
			};
		} catch (error: any) {
			console.error('Failed to get user stats:', error);
			return {
				success: false,
				error: error.message
			};
		}
	}
}

export const profileService = new ProfileService();
