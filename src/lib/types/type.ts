// src/lib/types/pocketbase.ts

/**
 * 地址信息类型
 */
export interface Address {
	id: string;
	collectionId: string;
	collectionName: 'addresses';
	user: string;
	label: string; // 地址标签：自宅、会社等
	recipient: string; // 收件人姓名
	phone: string; // 电话号码
	postal_code: string; // 邮编
	address: string; // 详细地址
	is_default: boolean; // 是否默认地址
	created: string;
	updated: string;
}

/**
 * 商品信息类型
 */
export interface Product {
	id: string;
	collectionId: string;
	collectionName: 'products';
	name: string;
	name_ja: string;
	price: number;
	originalPrice?: number;
	discount?: number;
	rating?: number;
	reviews?: number;
	image: string;
	images?: string; // JSON 字符串
	description?: string;
	isNew?: boolean;
	isHot?: boolean;
	inStock: boolean;
	stock: number;
	tags?: string; // JSON 字符串
	category_id?: string;
	specs?: string; // JSON 字符串
	brand?: string;
	created: string;
	updated: string;
}

/**
 * 购物车项类型
 */
export interface CartItem {
	id: string;
	collectionId: string;
	collectionName: 'cart_items';
	user: string;
	product: string | Product; // 关联商品ID或展开的商品对象
	quantity: number;
	selected: boolean;
	created: string;
	updated: string;
}

/**
 * 订单信息类型
 */
export interface Order {
	id: string;
	collectionId: string;
	collectionName: 'orders';
	user: string;
	order_id: string; // 订单号
	items: string; // JSON 字符串：商品列表
	address: string; // JSON 字符串：地址信息
	payment_method: string; // 支付方式ID
	subtotal: number; // 小计
	shipping_fee: number; // 运费
	payment_fee: number; // 支付手续费
	total: number; // 总计
	status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // 订单状态
	payment_status: 'pending' | 'completed' | 'failed'; // 支付状态
	merchant_payment_id?: string; // 第三方支付ID（如PayPay）
	created: string;
	updated: string;
}

/**
 * 展开后的购物车项（包含完整商品信息）
 */
export interface CartItemExpanded extends Omit<CartItem, 'product'> {
	product: Product;
}

/**
 * 订单项类型
 */
export interface OrderItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	image: string;
	color?: string;
	size?: string;
	seller?: string;
}

/**
 * 订单数据类型（用于前端）
 */
export interface OrderData {
	orderId: string;
	items: OrderItem[];
	address: Address;
	payment: {
		id: string;
		name: string;
	};
	subtotal: number;
	shippingFee: number;
	paymentFee: number;
	total: number;
	orderDate: string;
}

export interface Brand {
	id: string;
	name: string;
	description: string;
	logo: string;
	followers: number;
	rating: number;
	discounts: number;
	isPopular: boolean;
	created: string;
	updated: string;
}
