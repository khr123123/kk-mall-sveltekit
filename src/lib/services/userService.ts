// PocketBase 服务封装
import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

class PocketBaseService {
	private pb: PocketBase;

	constructor() {
		this.pb = new PocketBase(PB_URL);
		// 自动刷新 token
		this.pb.autoCancellation(false);
	}

	/**
	 * 获取 PocketBase 实例
	 */
	getInstance() {
		return this.pb;
	}

	/**
	 * 用户注册
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

			// 发送验证邮件（如果配置了）
			try {
				await this.pb.collection('users').requestVerification(email);
			} catch (e) {
				console.warn('邮件验证发送失败:', e);
			}

			return {
				success: true,
				user: record
			};
		} catch (error: any) {
			console.error('注册失败:', error);
			return {
				success: false,
				error: error.message || '注册失败，请重试'
			};
		}
	}

	/**
	 * 用户登录
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
			console.error('登录失败:', error);
			return {
				success: false,
				error: error.message || '登录失败，请检查邮箱和密码'
			};
		}
	}

	/**
	 * OAuth 登录 (Google/GitHub)
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
			console.error(`${provider} 登录失败:`, error);
			return {
				success: false,
				error: error.message || `${provider} 登录失败`
			};
		}
	}

	/**
	 * 退出登录
	 */
	logout() {
		this.pb.authStore.clear();
	}

	/**
	 * 获取当前用户
	 */
	getCurrentUser() {
		return this.pb.authStore.model;
	}

	/**
	 * 检查是否已登录
	 */
	isLoggedIn() {
		return this.pb.authStore.isValid;
	}

	/**
	 * 获取用户头像 URL
	 */
	getUserAvatarUrl(user: any, filename?: string) {
		if (!user || !filename) return '/logo.png';
		return this.pb.files.getUrl(user, filename);
	}

	/**
	 * 更新用户信息
	 */
	async updateUser(userId: string, data: any) {
		try {
			const record = await this.pb.collection('users').update(userId, data);
			return {
				success: true,
				user: record
			};
		} catch (error: any) {
			console.error('更新用户信息失败:', error);
			return {
				success: false,
				error: error.message || '更新失败'
			};
		}
	}

	/**
	 * 请求密码重置
	 */
	async requestPasswordReset(email: string) {
		try {
			await this.pb.collection('users').requestPasswordReset(email);
			return {
				success: true,
				message: 'パスワードリセットのメールを送信しました'
			};
		} catch (error: any) {
			console.error('密码重置请求失败:', error);
			return {
				success: false,
				error: error.message || 'メール送信に失敗しました'
			};
		}
	}

	/**
	 * 监听认证状态变化
	 */
	onAuthChange(callback: (token: string, model: any) => void) {
		return this.pb.authStore.onChange(callback);
	}
}

// 导出单例
export const pbService = new PocketBaseService();
export default pbService;
