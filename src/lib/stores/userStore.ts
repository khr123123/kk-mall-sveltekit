// User Store - Svelte Store 用于管理用户状态
import { writable, derived } from 'svelte/store';
import { pbService } from '../services/userService';
import { browser } from '$app/environment';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    username?: string;
    verified: boolean;
    created: string;
    updated: string;
}

interface UserState {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
}

// 创建初始状态
function createUserStore() {
    const { subscribe, set, update } = writable<UserState>({
        user: null,
        isLoggedIn: false,
        isLoading: true
    });

    // 初始化：从 PocketBase 加载用户状态
    if (browser) {
        const currentUser = pbService.getCurrentUser();
        if (currentUser && pbService.isLoggedIn()) {
            set({
                user: formatUser(currentUser),
                isLoggedIn: true,
                isLoading: false
            });
        } else {
            set({
                user: null,
                isLoggedIn: false,
                isLoading: false
            });
        }

        // 监听认证状态变化
        pbService.onAuthChange((token, model) => {
            if (model) {
                set({
                    user: formatUser(model),
                    isLoggedIn: true,
                    isLoading: false
                });
            } else {
                set({
                    user: null,
                    isLoggedIn: false,
                    isLoading: false
                });
            }
        });
    }

    return {
        subscribe,

        /**
         * 登录
         */
        login: async (email: string, password: string) => {
            update(state => ({ ...state, isLoading: true }));

            const result = await pbService.login(email, password);

            if (result.success && result.user) {
                set({
                    user: formatUser(result.user),
                    isLoggedIn: true,
                    isLoading: false
                });
            } else {
                update(state => ({ ...state, isLoading: false }));
            }

            return result;
        },

        /**
         * 注册
         */
        register: async (email: string, password: string, passwordConfirm: string, name?: string) => {
            update(state => ({ ...state, isLoading: true }));

            const result = await pbService.register(email, password, passwordConfirm, name);

            if (result.success && result.user) {
                // 注册成功后自动登录
                const loginResult = await pbService.login(email, password);
                if (loginResult.success && loginResult.user) {
                    set({
                        user: formatUser(loginResult.user),
                        isLoggedIn: true,
                        isLoading: false
                    });
                }
            } else {
                update(state => ({ ...state, isLoading: false }));
            }

            return result;
        },

        /**
         * OAuth 登录
         */
        loginWithOAuth: async (provider: 'google' | 'github') => {
            update(state => ({ ...state, isLoading: true }));

            const result = await pbService.loginWithOAuth(provider);

            if (result.success && result.user) {
                set({
                    user: formatUser(result.user),
                    isLoggedIn: true,
                    isLoading: false
                });
            } else {
                update(state => ({ ...state, isLoading: false }));
            }

            return result;
        },

        /**
         * 退出登录
         */
        logout: () => {
            pbService.logout();
            set({
                user: null,
                isLoggedIn: false,
                isLoading: false
            });
        },

        /**
         * 更新用户信息
         */
        updateUser: async (userId: string, data: any) => {
            update(state => ({ ...state, isLoading: true }));

            const result = await pbService.updateUser(userId, data);

            if (result.success && result.user) {
                set({
                    user: formatUser(result.user),
                    isLoggedIn: true,
                    isLoading: false
                });
            } else {
                update(state => ({ ...state, isLoading: false }));
            }

            return result;
        },

        /**
         * 刷新用户状态
         */
        refresh: () => {
            const currentUser = pbService.getCurrentUser();
            if (currentUser && pbService.isLoggedIn()) {
                set({
                    user: formatUser(currentUser),
                    isLoggedIn: true,
                    isLoading: false
                });
            } else {
                set({
                    user: null,
                    isLoggedIn: false,
                    isLoading: false
                });
            }
        }
    };
}

/**
 * 格式化用户数据
 */
function formatUser(pbUser: any): User {
    return {
        id: pbUser.id,
        email: pbUser.email,
        name: pbUser.name || pbUser.username || pbUser.email.split('@')[0],
        avatar: pbUser.avatar ? pbService.getUserAvatarUrl(pbUser, pbUser.avatar) : '/logo.png',
        username: pbUser.username,
        verified: pbUser.verified || false,
        created: pbUser.created,
        updated: pbUser.updated
    };
}

// 导出 store
export const userStore = createUserStore();

// 派生 store：仅用户信息
export const currentUser = derived(userStore, $userStore => $userStore.user);

// 派生 store：登录状态
export const isLoggedIn = derived(userStore, $userStore => $userStore.isLoggedIn);

// 派生 store：加载状态
export const isLoading = derived(userStore, $userStore => $userStore.isLoading);