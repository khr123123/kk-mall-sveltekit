// PocketBase service wrapper with global toast integration
import PocketBase from 'pocketbase';
import { toast } from '$lib/stores/toastStore';

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

class PocketBaseService {
	private pb: PocketBase;

	constructor() {
		this.pb = new PocketBase(PB_URL);
		this.pb.autoCancellation(false);

		// Intercept responses for global error handling
		if (typeof window !== 'undefined') {
			this.pb.afterSend = (response: Response, data: any) => {
				if (response.status === 401) {
					toast.error('セッションが期限切れです。再度ログインしてください');
					this.pb.authStore.clear();
				} else if (response.status === 403) {
					toast.error('権限がありません');
				} else if (response.status >= 500) {
					toast.error('サーバーエラーが発生しました。しばらくしてから再度お試しください');
				}
				return data;
			};
		}
	}

	/**
	 * Get PocketBase instance
	 */
	getInstance() {
		return this.pb;
	}

	/**
	 * User registration
	 */
	async register(email: string, password: string, passwordConfirm: string, name?: string) {
		try {
			const data = {
				email,
				password,
				passwordConfirm,
				name: name || email.split('@')[0],
				emailVisibility: true
			};

			const record = await this.pb.collection('users').create(data);

			try {
				await this.pb.collection('users').requestVerification(email);
			} catch (e) {
				console.warn('Email verification send failed:', e);
			}

			return {
				success: true,
				user: record
			};
		} catch (error: any) {
			console.error('Registration failed:', error);
			return {
				success: false,
				error: error.message || '登録に失敗しました'
			};
		}
	}

	/**
	 * User login
	 */
	async login(email: string, password: string) {
		try {
			const authData = await this.pb.collection('users').authWithPassword(email, password);

			return {
				success: true,
				user: authData.record,
				token: authData.token
			};
		} catch (error: any) {
			console.error('Login failed:', error);
			return {
				success: false,
				error: error.message || 'ログインに失敗しました'
			};
		}
	}

	/**
	 * OAuth login (Google/GitHub)
	 */
	async loginWithOAuth(provider: 'google' | 'github') {
		try {
			const authData = await this.pb.collection('users').authWithOAuth2({ provider });

			return {
				success: true,
				user: authData.record,
				token: authData.token
			};
		} catch (error: any) {
			console.error(`${provider} login failed:`, error);
			return {
				success: false,
				error: error.message || `${provider}ログインに失敗しました`
			};
		}
	}

	/**
	 * Logout
	 */
	logout() {
		this.pb.authStore.clear();
	}

	/**
	 * Get current user
	 */
	getCurrentUser() {
		return this.pb.authStore.model;
	}

	/**
	 * Check if logged in
	 */
	isLoggedIn() {
		return this.pb.authStore.isValid;
	}

	/**
	 * Get user avatar URL
	 */
	getUserAvatarUrl(user: any, filename?: string) {
		if (!user || !filename) return '/logo.png';
		return this.pb.files.getUrl(user, filename);
	}

	/**
	 * Update user info
	 */
	async updateUser(userId: string, data: any) {
		try {
			const record = await this.pb.collection('users').update(userId, data);
			toast.success('ユーザー情報を更新しました');
			return {
				success: true,
				user: record
			};
		} catch (error: any) {
			console.error('Update user failed:', error);
			toast.error('更新に失敗しました');
			return {
				success: false,
				error: error.message || '更新に失敗しました'
			};
		}
	}

	/**
	 * Request password reset
	 */
	async requestPasswordReset(email: string) {
		try {
			await this.pb.collection('users').requestPasswordReset(email);
			toast.success('パスワードリセットのメールを送信しました');
			return {
				success: true,
				message: 'パスワードリセットのメールを送信しました'
			};
		} catch (error: any) {
			console.error('Password reset request failed:', error);
			toast.error('メール送信に失敗しました');
			return {
				success: false,
				error: error.message || 'メール送信に失敗しました'
			};
		}
	}

	/**
	 * Listen for auth state changes
	 */
	onAuthChange(callback: (token: string, model: any) => void) {
		return this.pb.authStore.onChange(callback);
	}
}

// Export singleton
export const pbService = new PocketBaseService();
export default pbService;
