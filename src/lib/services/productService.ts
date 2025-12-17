// src/lib/services/productService.ts
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export interface Product {
	id: string;
	name: string;
	name_ja: string;
	price: number;
	originalPrice: number;
	discount: number;
	rating: number;
	reviews: number;
	image: string;
	images: string[];
	description: string;
	isNew: boolean;
	isHot: boolean;
	inStock: boolean;
	stock: number;
	brand: string;
	tags: string[];
	category_id: string;
	subcategory_id?: string;
	specs: Record<string, any>;
	created: string;
	updated: string;
}

export interface ProductFilter {
	categoryId?: string;
	subcategoryId?: string;
	minPrice?: number;
	maxPrice?: number;
	brands?: string[];
	inStock?: boolean;
	isNew?: boolean;
	isHot?: boolean;
	search?: string;
}

export interface ProductSort {
	field: 'created' | 'price' | 'rating' | 'reviews';
	order: 'asc' | 'desc';
}

export class ProductService {
	static async getProducts(
		filter: ProductFilter = {},
		sort: ProductSort = { field: 'created', order: 'desc' },
		page: number = 1,
		perPage: number = 20
	): Promise<{ items: Product[]; totalItems: number; totalPages: number }> {
		try {
			const filterParts: string[] = [];

			if (filter.categoryId) {
				filterParts.push(`category_id = "${filter.categoryId}"`);
			}

			if (filter.subcategoryId) {
				filterParts.push(`subcategory_id = "${filter.subcategoryId}"`);
			}

			if (filter.minPrice !== undefined) {
				filterParts.push(`price >= ${filter.minPrice}`);
			}

			if (filter.maxPrice !== undefined) {
				filterParts.push(`price <= ${filter.maxPrice}`);
			}

			if (filter.brands && filter.brands.length > 0) {
				const brandFilter = filter.brands.map(b => `brand = "${b}"`).join(' || ');
				filterParts.push(`(${brandFilter})`);
			}

			if (filter.inStock !== undefined) {
				filterParts.push(`inStock = ${filter.inStock}`);
			}

			if (filter.isNew !== undefined) {
				filterParts.push(`isNew = ${filter.isNew}`);
			}

			if (filter.isHot !== undefined) {
				filterParts.push(`isHot = ${filter.isHot}`);
			}

			if (filter.search) {
				filterParts.push(`(name ~ "${filter.search}" || name_ja ~ "${filter.search}")`);
			}

			const filterString = filterParts.join(' && ');
			const sortString = `${sort.order === 'desc' ? '-' : ''}${sort.field}`;

			const result = await pb.collection('products').getList(page, perPage, {
				filter: filterString || undefined,
				sort: sortString
			});

			return {
				items: result.items as unknown as Product[],
				totalItems: result.totalItems,
				totalPages: result.totalPages
			};
		} catch (error) {
			console.error('Error fetching products:', error);
			throw error;
		}
	}

	static async getProductById(id: string): Promise<Product> {
		try {
			const product = await pb.collection('products').getOne(id);
			return product as unknown as Product;
		} catch (error) {
			console.error('Error fetching product:', error);
			throw error;
		}
	}

	static async getBrandsByCategory(categoryId?: string): Promise<string[]> {
		try {
			const filter = categoryId ? `category_id = "${categoryId}"` : '';
			const products = await pb.collection('products').getFullList({
				filter: filter || undefined,
				fields: 'brand'
			});

			const brands = [...new Set(products.map((p: any) => p.brand))];
			return brands.sort();
		} catch (error) {
			console.error('Error fetching brands:', error);
			return [];
		}
	}
}
