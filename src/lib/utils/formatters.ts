// lib/utils/formatters.ts
export const formatters = {
	currency: (amount: number): string => {
		return `¥${amount.toLocaleString('ja-JP')}`;
	},

	date: (dateString: string): string => {
		return new Date(dateString).toLocaleDateString('ja-JP');
	},

	datetime: (dateString: string): string => {
		return new Date(dateString).toLocaleString('ja-JP');
	},

	phone: (phone: string): string => {
		const cleaned = phone.replace(/\D/g, '');
		if (cleaned.length === 11) {
			return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
		} else if (cleaned.length === 10) {
			return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
		}
		return phone;
	},

	postalCode: (code: string): string => {
		const cleaned = code.replace(/\D/g, '');
		if (cleaned.length === 7) {
			return `〒${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
		}
		return code;
	},

	orderStatus: (status: string): { label: string; class: string } => {
		const statusMap: Record<string, { label: string; class: string }> = {
			pending: { label: '処理待ち', class: 'status-default' },
			processing: { label: '処理中', class: 'status-info' },
			shipped: { label: '発送済み', class: 'status-info' },
			delivered: { label: '配送完了', class: 'status-success' },
			cancelled: { label: 'キャンセル済み', class: 'status-danger' }
		};
		return statusMap[status] || { label: status, class: 'status-default' };
	},

	truncate: (text: string, length: number): string => {
		if (text.length <= length) return text;
		return text.slice(0, length) + '...';
	}
};
