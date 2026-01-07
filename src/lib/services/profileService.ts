import {pb} from './PBConfig';

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
    // ============ 订单管理 ============
    /**
     * 获取用户订单列表
     */
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
            console.error('获取订单失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取订单详情
     */
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
            console.error('获取订单详情失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 取消订单
     */
    async cancelOrder(orderId: string) {
        try {
            const record = await pb.collection('orders').update(orderId, {
                status: 'cancelled'
            });

            return {
                success: true,
                order: record
            };
        } catch (error: any) {
            console.error('取消订单失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============ 地址管理 ============
    /**
     * 获取用户地址列表
     */
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
            console.error('获取地址列表失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 创建地址
     */
    async createAddress(userId: string, addressData: Partial<Address>) {
        try {
            // 如果设置为默认地址,先取消其他默认地址
            if (addressData.is_default) {
                await this.clearDefaultAddresses(userId);
            }

            const record = await pb.collection('addresses').create({
                user: userId,
                ...addressData
            });

            return {
                success: true,
                address: record
            };
        } catch (error: any) {
            console.error('创建地址失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 更新地址
     */
    async updateAddress(addressId: string, userId: string, addressData: Partial<Address>) {
        try {
            // 如果设置为默认地址,先取消其他默认地址
            if (addressData.is_default) {
                await this.clearDefaultAddresses(userId);
            }

            const record = await pb.collection('addresses').update(addressId, addressData);

            return {
                success: true,
                address: record
            };
        } catch (error: any) {
            console.error('更新地址失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 删除地址
     */
    async deleteAddress(addressId: string) {
        try {
            await pb.collection('addresses').delete(addressId);

            return {
                success: true
            };
        } catch (error: any) {
            console.error('删除地址失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 设置默认地址
     */
    async setDefaultAddress(addressId: string, userId: string) {
        try {
            // 先取消其他默认地址
            await this.clearDefaultAddresses(userId);

            // 设置新的默认地址
            const record = await pb.collection('addresses').update(addressId, {
                is_default: true
            });

            return {
                success: true,
                address: record
            };
        } catch (error: any) {
            console.error('设置默认地址失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 清除所有默认地址
     */
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
            console.error('清除默认地址失败:', error);
        }
    }

    // ============ 收藏管理 ============
    /**
     * 获取用户收藏列表
     */
    async getFavorites(userId: string) {
        try {
            const records = await pb.collection('favorites').getFullList({
                filter: `user = "${userId}"`,
                expand: 'product_id,brands_id',  // 扩展关联数据
                sort: '-created'
            });

            return {
                success: true,
                favorites: records
            };
        } catch (error: any) {
            console.error('获取收藏列表失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }


    /**
     * 添加收藏
     */
    async addFavorite(
        userId: string,
        favoriteData: Omit<Favorite, 'id' | 'user' | 'created' | 'updated'>
    ) {
        try {
            const record = await pb.collection('favorites').create({
                user: userId,
                ...favoriteData
            });

            return {
                success: true,
                favorite: record
            };
        } catch (error: any) {
            console.error('添加收藏失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 删除收藏
     */
    async removeFavorite(favoriteId: string) {
        try {
            await pb.collection('favorites').delete(favoriteId);

            return {
                success: true
            };
        } catch (error: any) {
            console.error('删除收藏失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 清空收藏
     */
    async clearFavorites(userId: string) {
        try {
            const favorites = await pb.collection('favorites').getFullList({
                filter: `user = "${userId}"`
            });

            for (const favorite of favorites) {
                await pb.collection('favorites').delete(favorite.id);
            }

            return {
                success: true
            };
        } catch (error: any) {
            console.error('清空收藏失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 检查是否已收藏
     */
    async isFavorite(userId: string, productId: string) {
        try {
            const records = await pb.collection('favorites').getFullList({
                filter: `user = "${userId}" && product_id = "${productId}"`
            });

            return {
                success: true,
                isFavorite: records.length > 0,
                favoriteId: records.length > 0 ? records[0].id : null
            };
        } catch (error: any) {
            console.error('检查收藏状态失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============ 头像管理 ============
    /**
     * 更新用户头像
     */
    async updateAvatar(userId: string, avatarFile: File) {
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const record = await pb.collection('users').update(userId, formData);

            return {
                success: true,
                user: record,
                avatarUrl: pb.getFileUrl(record, record.avatar)
            };
        } catch (error: any) {
            console.error('更新头像失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 删除用户头像
     */
    async deleteAvatar(userId: string) {
        try {
            const record = await pb.collection('users').update(userId, {
                avatar: null
            });

            return {
                success: true,
                user: record
            };
        } catch (error: any) {
            console.error('删除头像失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============ 用户统计 ============
    /**
     * 获取用户统计信息
     */
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
                    totalFavorites: favoritesResult.success ? favoritesResult.favorites?.length || 0 : 0,
                    totalAddresses: addressesResult.success ? addressesResult.addresses?.length || 0 : 0
                }
            };
        } catch (error: any) {
            console.error('获取用户统计失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export const profileService = new ProfileService();
