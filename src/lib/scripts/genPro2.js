// @ts-ignore
import PocketBase from 'pocketbase';

// PocketBase 配置
const POCKETBASE_URL = 'http://127.0.0.1:8090'; // 替换为你的 PocketBase 地址
const ADMIN_EMAIL = '1076731326@qq.com'; // 替换为管理员邮箱
const ADMIN_PASSWORD = 'khr112020!'; // 替换为管理员密码

// 初始化 PocketBase 客户端
const pb = new PocketBase(POCKETBASE_URL);

// 真实商品数据 - 每个都是真实存在且可购买的商品
const realProducts = [
	// Apple 产品
	{
		name: 'Apple iPhone 15 Pro',
		name_ja: 'Apple iPhone 15 Pro',
		price: 149800,
		originalPrice: 164800,
		discount: 9,
		rating: 4.8,
		reviews: 2845,
		image:
			'https://www.apple.com/newsroom/images/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/article/Apple-iPhone-15-Pro-lineup-hero-230912_inline.jpg.large.jpg',
		images: JSON.stringify([
			'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1693009279096',
			'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch_AV1?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1693009279096',
			'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch_AV2?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1693009279096'
		]),
		description: 'A17 Proチップ搭載、アクションボタン、航空宇宙グレードのチタニウム設計のiPhone',
		isNew: true,
		isHot: true,
		inStock: true,
		stock: 156,
		tags: JSON.stringify(['スマートフォン', 'Apple', 'iPhone', '最新モデル', 'チタニウム']),
		category_id: '16mgh1csea5slr0',
		specs: JSON.stringify({
			ディスプレイ: '6.1インチ Super Retina XDR',
			チップ: 'A17 Pro',
			ストレージ: '256GB',
			カメラ: '48MPメインカメラ',
			耐水性: 'IP68',
			動作保証温度: '0°C〜35°C'
		}),
		brand: '29negwxz09jghbl' // Apple 品牌ID
	},

	// Sony 产品
	{
		name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
		name_ja: 'ソニー WH-1000XM5 ワイヤレスノイズキャンセリングヘッドホン',
		price: 49800,
		originalPrice: 54800,
		discount: 9,
		rating: 4.7,
		reviews: 3247,
		image: 'https://m.media-amazon.com/images/I/61vJ6OijDaL._AC_SL1500_.jpg',
		images: JSON.stringify([
			'https://m.media-amazon.com/images/I/61vJ6OijDaL._AC_SL1500_.jpg',
			'https://m.media-amazon.com/images/I/71YyI1pFbCL._AC_SL1500_.jpg',
			'https://m.media-amazon.com/images/I/71p3N2n2-8L._AC_SL1500_.jpg'
		]),
		description: '世界最高レベルのノイズキャンセリング、30時間のバッテリー寿命、快適な着け心地',
		isNew: true,
		isHot: true,
		inStock: true,
		stock: 89,
		tags: JSON.stringify([
			'ヘッドホン',
			'ノイズキャンセリング',
			'ワイヤレス',
			'Sony',
			'オーディオ'
		]),
		category_id: '16mgh1csea5slr0',
		specs: JSON.stringify({
			ノイズキャンセリング: '業界最高レベル',
			バッテリー寿命: '最大30時間（NCオン）',
			充電時間: '約3時間',
			重量: '約250g',
			Bluetooth: '5.2',
			付属品: 'ケース、ケーブル'
		}),
		brand: 'w3qnn7b0pwtqfjs' // Sony 品牌ID
	},

	// Nike 产品
	{
		name: "Nike Air Force 1 '07",
		name_ja: "ナイキ エアフォース1 '07",
		price: 13200,
		originalPrice: 14800,
		discount: 11,
		rating: 4.6,
		reviews: 12589,
		image:
			'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/9c31d2f7-eba5-4042-8ab8-c960ac6b30a1/%E3%82%A8%E3%82%A2%E3%83%95%E3%82%A9%E3%83%BC%E3%82%B91-07-%E3%83%A1%E3%83%B3%E3%82%BA%E3%82%B7%E3%83%A5%E3%83%BC%E3%82%BA-8q6mzJ.png',
		images: JSON.stringify([
			'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/9c31d2f7-eba5-4042-8ab8-c960ac6b30a1/%E3%82%A8%E3%82%A2%E3%83%95%E3%82%A9%E3%83%BC%E3%82%B91-07-%E3%83%A1%E3%83%B3%E3%82%BA%E3%82%B7%E3%83%A5%E3%83%BC%E3%82%BA-8q6mzJ.png',
			'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/e670e18d-0c74-4f0b-9769-af0d8ddb2a5c/%E3%82%A8%E3%82%A2%E3%83%95%E3%82%A9%E3%83%BC%E3%82%B91-07-%E3%83%A1%E3%83%B3%E3%82%BA%E3%82%B7%E3%83%A5%E3%83%BC%E3%82%BA-8q6mzJ.png'
		]),
		description: '伝説的バスケットボールスニーカーの現代版。レザーアッパーとアイコニックなデザイン',
		isNew: false,
		isHot: true,
		inStock: true,
		stock: 245,
		tags: JSON.stringify(['スニーカー', 'バスケット', 'ナイキ', 'クラシック', 'レザー']),
		category_id: 'rtgaffg2fu2cmxf',
		specs: JSON.stringify({
			素材: 'レザー',
			ソール: 'ラバー',
			クッション: 'エアソールユニット',
			対象: 'メンズ',
			カラー: 'ホワイト/ホワイト',
			重量: '約400g'
		}),
		brand: '59bulfhi4j2ka23' // Nike 品牌ID
	},

	// Samsung 产品
	{
		name: 'Samsung Galaxy Watch6 Classic',
		name_ja: 'サムスンギャラクシーウォッチ6クラシック',
		price: 54800,
		originalPrice: 59800,
		discount: 8,
		rating: 4.5,
		reviews: 1892,
		image:
			'https://image-us.samsung.com/SamsungUS/home/5g/mobile/phones/pdp/sm-r945nzkaxaa/gallery/01_SM-R945_R900_Black_Front-1600x1200.jpg?$product-details-jpg$',
		images: JSON.stringify([
			'https://image-us.samsung.com/SamsungUS/home/5g/mobile/phones/pdp/sm-r945nzkaxaa/gallery/01_SM-R945_R900_Black_Front-1600x1200.jpg?$product-details-jpg$',
			'https://image-us.samsung.com/SamsungUS/home/5g/mobile/phones/pdp/sm-r945nzkaxaa/gallery/02_SM-R945_R900_Black_RotatingBezel-1600x1200.jpg?$product-details-jpg$'
		]),
		description: '回転ベゼル搭載のスマートウォッチ。健康モニタリングと40時間のバッテリー',
		isNew: true,
		isHot: false,
		inStock: true,
		stock: 76,
		tags: JSON.stringify(['スマートウォッチ', 'ウェアラブル', 'Samsung', '健康管理']),
		category_id: '16mgh1csea5slr0',
		specs: JSON.stringify({
			ディスプレイ: '1.5インチSuper AMOLED',
			バッテリー: '40時間',
			耐水性: '5ATM + IP68',
			OS: 'Wear OS 4',
			センサー: '心拍数、血圧、心電図',
			ストレージ: '16GB'
		}),
		brand: 'dy8n037g8t30qt8' // Samsung 品牌ID
	},

	// Dyson 产品
	{
		name: 'Dyson Supersonic Hair Dryer',
		name_ja: 'ダイソンスーパーソニックヘアドライヤー',
		price: 49800,
		originalPrice: 54800,
		discount: 9,
		rating: 4.7,
		reviews: 8923,
		image:
			'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/leap-petite-global/images/products/hair-care/395028-01.png?$responsive$&fmt=webp&qlt=80&fit=constrain,1&wid=2000',
		images: JSON.stringify([
			'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/leap-petite-global/images/products/hair-care/395028-01.png?$responsive$&fmt=webp&qlt=80&fit=constrain,1&wid=2000',
			'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/leap-petite-global/images/products/hair-care/395028-02.png'
		]),
		description: '高速デジタルモーター搭載のヘアドライヤー。髪のダメージを軽減し、素早く乾かす',
		isNew: false,
		isHot: true,
		inStock: true,
		stock: 54,
		tags: JSON.stringify(['ヘアドライヤー', '美容家電', 'Dyson', '高速乾燥']),
		category_id: '69cag3bi2c23s4v',
		specs: JSON.stringify({
			モーター: 'デジタルモーターV9',
			風速: '最大46m/s',
			温度設定: '3段階',
			付属品: '4種類のアタッチメント',
			重量: '0.56kg',
			電圧: '100-240V'
		}),
		brand: '0w928m52u9i4e4r' // Dyson 品牌ID
	},

	// UNIQLO 产品
	{
		name: 'UNIQLO Ultra Light Down Parka',
		name_ja: 'ユニクロウルトラライトダウンパーカ',
		price: 6990,
		originalPrice: 8990,
		discount: 22,
		rating: 4.3,
		reviews: 23456,
		image:
			'https://image.uniqlo.com/UQ/ST3/jp/imagesgoods/466803000/item/jpgoods_02_466803.jpg?width=1600&impolicy=quality_75',
		images: JSON.stringify([
			'https://image.uniqlo.com/UQ/ST3/jp/imagesgoods/466803000/item/jpgoods_02_466803.jpg?width=1600&impolicy=quality_75',
			'https://image.uniqlo.com/UQ/ST3/jp/imagesgoods/466803000/sub/jpgoods_466803_sub2.jpg?width=1600&impolicy=quality_75',
			'https://image.uniqlo.com/UQ/ST3/jp/imagesgoods/466803000/sub/jpgoods_466803_sub9.jpg?width=1600&impolicy=quality_75'
		]),
		description: 'ポケットに収納できる超軽量ダウンパーカ。暖かく快適な着心地',
		isNew: true,
		isHot: true,
		inStock: true,
		stock: 432,
		tags: JSON.stringify(['アウター', 'ダウン', '軽量', 'UNIQLO', '収納可能']),
		category_id: 'u1vnseofuj77h36',
		specs: JSON.stringify({
			素材: 'ナイロン100%',
			ダウン: '90%ダウン、10%フェザー',
			重量: '約210g',
			収納サイズ: '約15×10cm',
			洗濯: '洗濯機可',
			サイズ: 'XS〜XXL'
		}),
		brand: 'afu7spnkfa2lyp2' // UNIQLO 品牌ID
	},

	// Nintendo 产品
	{
		name: 'Nintendo Switch - Animal Crossing: New Horizons Edition',
		name_ja: 'ニンテンドースイッチ どうぶつの森 あつまれどうぶつの森エディション',
		price: 32980,
		originalPrice: 37980,
		discount: 13,
		rating: 4.9,
		reviews: 15678,
		image: 'https://m.media-amazon.com/images/I/61-PblYntsL._AC_SL1500_.jpg',
		images: JSON.stringify([
			'https://m.media-amazon.com/images/I/61-PblYntsL._AC_SL1500_.jpg',
			'https://m.media-amazon.com/images/I/71Bpl8pSWqL._AC_SL1500_.jpg',
			'https://m.media-amazon.com/images/I/71q9dTwsv+L._AC_SL1500_.jpg'
		]),
		description: 'どうぶつの森デザインの特別版Nintendo Switch。Joy-Conとドックが限定カラー',
		isNew: false,
		isHot: true,
		inStock: true,
		stock: 34,
		tags: JSON.stringify(['ゲーム機', 'Nintendo Switch', '限定版', 'どうぶつの森']),
		category_id: '5v2n4undrf0rcb0',
		specs: JSON.stringify({
			ストレージ: '32GB',
			ディスプレイ: '6.2インチ液晶',
			バッテリー: '約4.5-9時間',
			付属ソフト: 'どうぶつの森 ダウンロード版',
			'Joy-Conカラー': 'ミントグリーン/ライトブルー'
		}),
		brand: 'uno8tsvp4sivp1h' // Nintendo 品牌ID
	},

	// Adidas 产品
	{
		name: 'Adidas Ultraboost 22 Running Shoes',
		name_ja: 'アディダスウルトラブースト22 ランニングシューズ',
		price: 19800,
		originalPrice: 23800,
		discount: 17,
		rating: 4.6,
		reviews: 4567,
		image:
			'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/d5f9bf14a4f445789dd0af3d0142c52c_9366/Ultraboost_22_Shoes_White_HQ2068_HM1.jpg',
		images: JSON.stringify([
			'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/d5f9bf14a4f445789dd0af3d0142c52c_9366/Ultraboost_22_Shoes_White_HQ2068_HM1.jpg',
			'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/d1dc5394338545b5a564af3d0142cb90_9366/Ultraboost_22_Shoes_White_HQ2068_HM3.jpg'
		]),
		description: 'Boostミッドソール搭載のランニングシューズ。快適なクッション性と反発力を提供',
		isNew: true,
		isHot: false,
		inStock: true,
		stock: 167,
		tags: JSON.stringify(['ランニングシューズ', 'スポーツ', 'アディダス', '快適', 'Boost']),
		category_id: 'rtgaffg2fu2cmxf',
		specs: JSON.stringify({
			ソール: 'Boostミッドソール',
			アッパー: 'プライムニット',
			重量: '約310g（片足）',
			ドロップ: '10mm',
			対象: 'メンズ',
			カラー: 'ホワイト/ブラック'
		}),
		brand: '7ma77xoiwzlbntm' // Adidas 品牌ID
	},

	// Microsoft 产品
	{
		name: 'Microsoft Surface Laptop 5',
		name_ja: 'マイクロソフトサーフェスラップトップ5',
		price: 149800,
		originalPrice: 164800,
		discount: 9,
		rating: 4.4,
		reviews: 2341,
		image:
			'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/Surface-Laptop-5-1-CP2?wid=1920&hei=1200&fit=crop',
		images: JSON.stringify([
			'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/Surface-Laptop-5-1-CP2?wid=1920&hei=1200&fit=crop',
			'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/Surface-Laptop-5-2-CP2?wid=1920&hei=1200&fit=crop'
		]),
		description:
			'プレミアムなアルカンターラキーボード搭載ノートパソコン。第12世代Intel Coreプロセッサー',
		isNew: true,
		isHot: false,
		inStock: true,
		stock: 45,
		tags: JSON.stringify(['ノートパソコン', 'Microsoft', 'Surface', 'ビジネス', 'プレミアム']),
		category_id: 'zrpxvu2dz36amwx',
		specs: JSON.stringify({
			プロセッサー: 'Intel Core i7-1255U',
			メモリ: '16GB LPDDR5',
			ストレージ: '512GB SSD',
			ディスプレイ: '13.5インチPixelSense',
			OS: 'Windows 11',
			バッテリー: '最大18時間'
		}),
		brand: 'ikber2a0u9wzcq6' // Microsoft 品牌ID
	}
];

//@ts-ignore
// 登录 PocketBase 的管理员账户
async function loginAsAdmin() {
	try {
		console.log('🔐 PocketBase に管理者としてログイン中...');
		await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
		console.log('✅ 管理者ログイン成功');
		return true;
	} catch (error) {
        // @ts-ignore
		console.error('❌ 管理者ログイン失敗:', error.message);

		// 尝试使用用户认证作为备选
		try {
			console.log('ユーザー認証を試みます...');
			await pb.collection('users').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
			console.log('✅ ユーザーログイン成功');
			return true;
		} catch (userError) {
//@ts-ignore
			console.error('❌ ユーザーログインも失敗:', userError.message);
			return false;
		}
	}
}

//@ts-ignore
// 检查产品是否已存在
async function checkProductExists(productName) {
	try {
		const result = await pb.collection('products').getFirstListItem(`name="${productName}"`);
		return result ? result.id : null;
	} catch (error) {
		// 如果找不到产品，返回null
		return null;
	}
}

// 插入单个产品
//@ts-ignore
async function insertProduct(productData) {
	try {
		// 检查是否已存在
		const existingId = await checkProductExists(productData.name);

		if (existingId) {
			console.log(`⚠️ 商品 "${productData.name}" は既に存在します（ID: ${existingId}）`);

			// 可以选择更新现有产品
			console.log(`🔄 商品を更新します: ${productData.name}`);
			const updatedProduct = await pb.collection('products').update(existingId, productData);
			console.log(`✅ 商品更新成功: ${productData.name} (ID: ${existingId})`);
			return updatedProduct;
		} else {
			// 添加时间戳
			const productWithTimestamps = {
				...productData,
				created: new Date().toISOString(),
				updated: new Date().toISOString()
			};

			const record = await pb.collection('products').create(productWithTimestamps);
			console.log(`✅ 商品作成成功: ${productData.name} (ID: ${record.id})`);
			return record;
		}
	} catch (error) {
//@ts-ignore
		console.error(`❌ 商品作成失敗 "${productData.name}":`, error.message);

//@ts-ignore
		// 详细错误信息
		if (error.response) {

//@ts-ignore

			console.error('エラーレスポンス:', error.response);
		}

		return null;
	}
}

// 批量插入所有产品
//@ts-ignore

async function insertAllProducts() {
	console.log('🚀 PocketBase 商品データ挿入を開始します...');
	console.log(`📦 挿入予定商品数: ${realProducts.length}`);

	// 登录
	const loggedIn = await loginAsAdmin();
	if (!loggedIn) {
		console.error('❌ 認証に失敗したため、処理を中断します');
		return;
	}

	console.log('📥 商品データを挿入中...\n');

	const results = {
		success: 0,
		failed: 0,
		updated: 0,
		products: []
	};

	for (let i = 0; i < realProducts.length; i++) {
		const product = realProducts[i];
		console.log(`[${i + 1}/${realProducts.length}] 処理中: ${product.name}`);

		const result = await insertProduct(product);

		if (result) {
			if (result.id) {
				results.success++;
//@ts-ignore

				results.products.push({
					id: result.id,
					name: product.name,
					brand: product.brand
				});
			}
		} else {
			results.failed++;
		}

		// 避免请求过于频繁
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	console.log('\n📊 処理結果概要:');
	console.log('==============================');
	console.log(`✅ 成功: ${results.success}`);
	console.log(`❌ 失敗: ${results.failed}`);
	console.log('==============================');

	// 显示创建的产品列表
	if (results.products.length > 0) {
		console.log('\n📋 作成された商品リスト:');
		results.products.forEach((prod, index) => {
//@ts-ignore
			console.log(`${index + 1}. ${prod.name} (ID: ${prod.id})`);
		});
	}

	// 生成导入报告
	generateImportReport(results);

	return results;
}

// 生成导入报告


//@ts-ignore
function generateImportReport(results) {
	const report = {
		timestamp: new Date().toISOString(),
		url: POCKETBASE_URL,
		summary: {
			total: realProducts.length,
			success: results.success,
			failed: results.failed
		},
		products: results.products
	};

	console.log('\n📄 インポートレポート:');
	console.log(JSON.stringify(report, null, 2));

	// 保存到文件（Node.js环境）
	if (typeof require !== 'undefined') {
		const fs = require('fs');
		const filename = `pocketbase-import-report-${new Date().toISOString().split('T')[0]}.json`;
		fs.writeFileSync(filename, JSON.stringify(report, null, 2));
		console.log(`📁 レポートを保存しました: ${filename}`);
	}
}

// 验证品牌ID是否存在
async function validateBrands() {
	console.log('🔍 ブランドIDの検証を開始します...');

	const brandIds = [...new Set(realProducts.map((p) => p.brand))];
	console.log(`使用されているブランドID: ${brandIds.join(', ')}`);

	for (const brandId of brandIds) {
		try {
			const brand = await pb.collection('brands').getOne(brandId);
			console.log(`✅ ブランド確認: ${brand.name} (ID: ${brandId})`);
		} catch (error) {
			console.error(`❌ ブランドID "${brandId}" が見つかりません`);
		}
	}
}

// 主执行函数
async function main() {
	try {
		console.log('🎯 PocketBase 商品データインポートスクリプト');
		console.log('===============================================\n');

		// 验证品牌
		await loginAsAdmin();
		await validateBrands();

		// 插入产品
		await insertAllProducts();

		console.log('\n🎉 スクリプト実行完了！');
		console.log(`🔗 PocketBase管理画面: ${POCKETBASE_URL}/_/`);
	} catch (error) {
		console.error('💥 スクリプト実行中にエラーが発生しました:', error);
        //@ts-ignore
		console.error(error.stack);
	}
}

// 如果直接运行此脚本
main();

// 导出函数供其他模块使用
export { realProducts, loginAsAdmin, insertProduct, insertAllProducts, validateBrands, pb };
