// lib/types/profile.ts
export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	memberLevel?: string;
	points?: number;
	created: string;
}

export interface Order {
	id: string;
	order_number: string;
	order_date: string;
	items_count: number;
	total_amount: number;
	status: OrderStatus;
	payment_id?: string;
	payment_method?: string;
	amount: number;
	items?: OrderItem[];
	shipping_address?: string;
}

export interface OrderItem {
	id: string;
	product_name: string;
	product_image: string;
	quantity: number;
	price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Address {
	id: string;
	label: string;
	recipient: string;
	phone: string;
	postal_code: string;
	address: string;
	is_default: boolean;
}

export interface Favorite {
	id: string;
	product_id?: string;
	product_name: string;
	product_price: number;
	product_image: string;
}

export interface UserStats {
	totalOrders: number;
	totalFavorites: number;
	totalAddresses: number;
}

export interface RefundForm {
	refundType: 'full' | 'partial';
	refundReason :string;
	refundAmount: number;
	returnGoods: boolean;
	trackingNumber: string;
}

export interface AddressForm {
	label: string;
	recipient: string;
	phone: string;
	postal_code: string;
	address: string;
	is_default: boolean;
}

export interface NotificationSettings {
	email: boolean;
	sms: boolean;
	newProducts: boolean;
	promotions: boolean;
}

export interface PasswordForm {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}
