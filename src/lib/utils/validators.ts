// lib/utils/validators.ts
export interface ValidationResult {
	valid: boolean;
	error?: string;
}

export const validators = {
	required: (value: string, fieldName: string = 'フィールド'): ValidationResult => {
		if (!value || value.trim() === '') {
			return { valid: false, error: `${fieldName}は必須です` };
		}
		return { valid: true };
	},

	email: (value: string): ValidationResult => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(value)) {
			return { valid: false, error: '有効なメールアドレスを入力してください' };
		}
		return { valid: true };
	},

	phone: (value: string): ValidationResult => {
		const phoneRegex = /^[\d\-+() ]{10,15}$/;
		if (!phoneRegex.test(value)) {
			return { valid: false, error: '有効な電話番号を入力してください' };
		}
		return { valid: true };
	},

	postalCode: (value: string): ValidationResult => {
		const cleaned = value.replace(/[〒\-]/g, '');
		const postalCodeRegex = /^\d{7}$/;
		if (!postalCodeRegex.test(cleaned)) {
			return { valid: false, error: '有効な郵便番号を入力してください（例: 150-0001）' };
		}
		return { valid: true };
	},

	password: (value: string): ValidationResult => {
		if (value.length < 8) {
			return { valid: false, error: 'パスワードは8文字以上である必要があります' };
		}
		if (!/[A-Z]/.test(value)) {
			return { valid: false, error: 'パスワードには大文字を含める必要があります' };
		}
		if (!/[a-z]/.test(value)) {
			return { valid: false, error: 'パスワードには小文字を含める必要があります' };
		}
		if (!/\d/.test(value)) {
			return { valid: false, error: 'パスワードには数字を含める必要があります' };
		}
		return { valid: true };
	},

	passwordMatch: (password: string, confirmPassword: string): ValidationResult => {
		if (password !== confirmPassword) {
			return { valid: false, error: 'パスワードが一致しません' };
		}
		return { valid: true };
	},

	amount: (value: number, min: number, max: number): ValidationResult => {
		if (value < min || value > max) {
			return {
				valid: false,
				error: `金額は¥${min.toLocaleString('ja-JP')}から¥${max.toLocaleString('ja-JP')}の間である必要があります`
			};
		}
		return { valid: true };
	},

	validateAddressForm: (form: any): ValidationResult => {
		const checks = [
			validators.required(form.label, 'ラベル'),
			validators.required(form.recipient, '受取人'),
			validators.phone(form.phone),
			validators.postalCode(form.postal_code),
			validators.required(form.address, '住所')
		];

		const failed = checks.find((result) => !result.valid);
		return failed || { valid: true };
	}
};
