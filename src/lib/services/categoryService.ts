// src/lib/services/categoryService.ts
import PocketBase, { type RecordService, type RecordModel } from 'pocketbase';

// 创建 PocketBase 实例
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

// 类型定义
export interface Category extends RecordModel {
    id: string;
    name: string;
    icon: string;
    children?: Category[];
}

export class CategoryService {
    private static getCollection(): RecordService<Category> {
        return pb.collection('category');
    }
    static async getAllCategories(): Promise<any> {
        try {
            return await this.getCollection().getFullList({
                expand: 'children',
                filter: "children:length > 1"
            });
        } catch (error) {
            return new Error('获取分类列表失败', { cause: error });
        }
    }
}

export { pb };
export default CategoryService;