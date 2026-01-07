/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090'); // 你的PocketBase地址
const unsplashImages = {
	smartphones: [
		'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
		'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
		'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&q=80',
		'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
		'https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?w=800&q=80',
		'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
		'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
		'https://images.unsplash.com/photo-1598327105854-c8674faddf74?w=800&q=80',
		'https://images.unsplash.com/photo-1560672657-a0431178403f?w=800&q=80',
		'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80'
	],
	headphones: [
		'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
		'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
		'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
		'https://images.unsplash.com/photo-1585298723686-7245c5ee7afb?w=800&q=80',
		'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&q=80',
		'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
		'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
		'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80',
		'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80',
		'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
	],
	laptops: [
		'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
		'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&q=80',
		'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80',
		'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
		'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
		'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80',
		'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
		'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
		'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&q=80',
		'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80'
	],
	books: [
		'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80',
		'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
		'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
		'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&q=80',
		'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80',
		'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
		'https://images.unsplash.com/photo-1614849963640-9cc74b2a826f?w=800&q=80',
		'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80',
		'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&q=80',
		'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&q=80'
	],
	furniture: [
		'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
		'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
		'https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=800&q=80',
		'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
		'https://images.unsplash.com/photo-1567016432779-9e0c1c952dc2?w=800&q=80',
		'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800&q=80',
		'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
		'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
		'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80',
		'https://images.unsplash.com/photo-1615874694520-474822394e73?w=800&q=80'
	],
	kitchen: [
		'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80',
		'https://images.unsplash.com/photo-1556911220-b750a6e05b03?w=800&q=80',
		'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&q=80',
		'https://images.unsplash.com/photo-1585837135050-352b8686d1b4?w=800&q=80',
		'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80',
		'https://images.unsplash.com/photo-1586208958839-06c1719533bd?w=800&q=80',
		'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
		'https://images.unsplash.com/photo-1556909114-4f6e7ad7d313?w=800&q=80',
		'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
		'https://images.unsplash.com/photo-1556911220-b750a6e05b03?w=800&q=80'
	],
	bedding: [
		'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80',
		'https://images.unsplash.com/photo-1505693416381-9d2a93b43a29?w=800&q=80',
		'https://images.unsplash.com/photo-1616627547584-750e27192380?w=800&q=80',
		'https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?w=800&q=80',
		'https://images.unsplash.com/photo-1522771753035-1a5b6562f329?w=800&q=80',
		'https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?w=800&q=80',
		'https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?w=800&q=80',
		'https://images.unsplash.com/photo-1522771753035-1a5b6562f329?w=800&q=80',
		'https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?w=800&q=80',
		'https://images.unsplash.com/photo-1505693416381-9d2a93b43a29?w=800&q=80'
	],
	interior: [
		'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
		'https://images.unsplash.com/photo-1585128792020-803d29415281?w=800&q=80',
		'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&q=80',
		'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
		'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&q=80',
		'https://images.unsplash.com/photo-1618219740973-2b6c1e0c1b0c?w=800&q=80',
		'https://images.unsplash.com/photo-1618219740973-2b6c1e0c1b0c?w=800&q=80',
		'https://images.unsplash.com/photo-1618219740973-2b6c1e0c1b0c?w=800&q=80',
		'https://images.unsplash.com/photo-1618219740973-2b6c1e0c1b0c?w=800&q=80',
		'https://images.unsplash.com/photo-1618219740973-2b6c1e0c1b0c?w=800&q=80'
	],
	baby: [
		'https://images.unsplash.com/photo-1515488042361-25f4682f3969?w=800&q=80',
		'https://images.unsplash.com/photo-1522771753035-1a5b6562f329?w=800&q=80',
		'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
		'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
		'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&q=80',
		'https://images.unsplash.com/photo-1544126566-475a10623ce7?w=800&q=80',
		'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
		'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
		'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&q=80',
		'https://images.unsplash.com/photo-1544126566-475a10623ce7?w=800&q=80'
	],
	food: [
		'https://images.unsplash.com/photo-1621939514649-28b12e81658b?w=800&q=80',
		'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
		'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80',
		'https://images.unsplash.com/photo-1582401656459-8ce8a4d402b9?w=800&q=80',
		'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=800&q=80',
		'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=800&q=80',
		'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
		'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
		'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
		'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80'
	],
	sports: [
		'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
		'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
		'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
		'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
		'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&q=80',
		'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&q=80',
		'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
		'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
		'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
		'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'
	],
	beauty: [
		'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80',
		'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&q=80',
		'https://images.unsplash.com/photo-1571781926291-2805531315f3?w=800&q=80',
		'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
		'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80',
		'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80',
		'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80',
		'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&q=80',
		'https://images.unsplash.com/photo-1571781926291-2805531315f3?w=800&q=80',
		'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'
	]
};
const productTemplates = {
	smartphones: {
		brands: ['Apple', 'Samsung', 'Google', 'Sony', 'Xiaomi'],
		models: ['Pro Max', 'Ultra', 'Pro', 'Plus', 'Standard'],
		tags: ['5G', '高性能', 'AI', '高速充電'],
		priceRange: [50000, 200000],
		specs: {
			screen: ['6.1インチ', '6.5インチ', '6.7インチ'],
			storage: ['128GB', '256GB', '512GB']
		}
	},
	headphones: {
		brands: ['Sony', 'Bose', 'Sennheiser', 'Audio-Technica', 'Apple'],
		models: ['XM5', 'QuietComfort', 'Momentum', 'AirPods Max'],
		tags: ['ノイズキャンセリング', 'ワイヤレス', '高音質', '長時間再生'],
		priceRange: [10000, 50000],
		specs: {
			type: ['オーバーイヤー', 'インイヤー'],
			battery: ['20時間', '30時間', '40時間']
		}
	},
	laptops: {
		brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus'],
		models: ['MacBook Air', 'XPS', 'Spectre', 'ThinkPad', 'ZenBook'],
		tags: ['軽量', '高性能', 'ビジネス', 'クリエイター向け'],
		priceRange: [80000, 300000],
		specs: {
			cpu: ['M2', 'M3', 'Core i7', 'Ryzen 7'],
			ram: ['16GB', '32GB']
		}
	},
	books: {
		brands: ['講談社', '集英社', 'KADOKAWA', '新潮社', '小学館'],
		tags: ['ベストセラー', '話題作', '映画化', '受賞作'],
		priceRange: [500, 3000],
		specs: {
			format: ['単行本', '文庫', '新書'],
			pages: ['200ページ', '350ページ', '500ページ']
		}
	},
	furniture: {
		brands: ['IKEA', 'ニトリ', '無印良品', 'カリモク', 'Herman Miller'],
		tags: ['北欧デザイン', 'シンプル', 'モダン', '組立簡単'],
		priceRange: [3000, 100000],
		specs: {
			material: ['木材', 'スチール', 'プラスチック'],
			color: ['ホワイト', 'ブラック', 'ナチュラル', 'ブラウン']
		}
	},
	kitchen: {
		brands: ['T-fal', 'Panasonic', 'SHARP', 'BALMUDA', 'Zojirushi'],
		tags: ['便利', '時短', '省エネ', 'おしゃれ'],
		priceRange: [2000, 50000],
		specs: {
			power: ['1000W', '1200W', '1400W'],
			warranty: ['1年保証', '3年保証']
		}
	},
	bedding: {
		brands: ['西川', 'ニトリ', 'IKEA', '無印良品', 'エアウィーヴ'],
		tags: ['快眠', '防ダニ', '抗菌', '洗える'],
		priceRange: [3000, 30000],
		specs: {
			size: ['シングル', 'セミダブル', 'ダブル'],
			material: ['コットン', 'ポリエステル', 'シルク']
		}
	},
	interior: {
		brands: ['Francfranc', 'IKEA', 'ZARA HOME', 'ACTUS'],
		tags: ['おしゃれ', '癒し', 'トレンド', 'ギフト'],
		priceRange: [1000, 20000],
		specs: {
			style: ['北欧', 'モダン', 'ヴィンテージ'],
			origin: ['日本製', '中国製', 'ベトナム製']
		}
	},
	baby: {
		brands: ['Pigeon', 'Combi', 'Aprica', 'Uniqlo', 'Gap Baby'],
		tags: ['安心安全', 'オーガニック', '出産祝い', '人気'],
		priceRange: [1000, 50000],
		specs: {
			age: ['0ヶ月~', '6ヶ月~', '1歳~'],
			material: ['綿100%', 'ポリエステル']
		}
	},
	food: {
		brands: ['明治', 'カルビー', '日清食品', 'サントリー', '味の素'],
		tags: ['美味しい', '限定', '健康', '新発売'],
		priceRange: [100, 2000],
		specs: {
			volume: ['100g', '500g', '1kg'],
			calories: ['100kcal', '300kcal', '500kcal']
		}
	},
	sports: {
		brands: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'The North Face'],
		tags: ['吸汗速乾', '軽量', '耐久性', 'プロ仕様'],
		priceRange: [2000, 20000],
		specs: {
			size: ['S', 'M', 'L', 'XL'],
			gender: ['メンズ', 'レディース', 'ユニセックス']
		}
	},
	beauty: {
		brands: ['SHISEIDO', 'SK-II', 'KANEBO', "L'OREAL", 'Dior'],
		tags: ['保湿', 'エイジングケア', '美白', '敏感肌用'],
		priceRange: [1000, 15000],
		specs: {
			skinType: ['乾燥肌', '脂性肌', '混合肌'],
			volume: ['30ml', '50ml', '100ml']
		}
	}
};
const subcategoryToTemplateMap = {
	// スマホ (手机数码) 分类下的子分类
	スマートフォン: { templateKey: 'smartphones', imageKey: 'smartphones' },
	スマホケース: { templateKey: 'smartphones', imageKey: 'smartphones' },
	充電器: { templateKey: 'smartphones', imageKey: 'smartphones' },
	イヤホン: { templateKey: 'headphones', imageKey: 'headphones' },
	モバイルバッテリー: { templateKey: 'smartphones', imageKey: 'smartphones' },

	// パソコン (电脑办公) 分类下的子分类
	ノートPC: { templateKey: 'laptops', imageKey: 'laptops' },
	デスクトップ: { templateKey: 'laptops', imageKey: 'laptops' },
	モニター: { templateKey: 'laptops', imageKey: 'laptops' },
	キーボード: { templateKey: 'laptops', imageKey: 'laptops' },
	マウス: { templateKey: 'laptops', imageKey: 'laptops' },

	// 家電 (家用电器) 分类下的子分类
	冷蔵庫: { templateKey: 'kitchen', imageKey: 'kitchen' },
	洗濯機: { templateKey: 'kitchen', imageKey: 'kitchen' },
	電子レンジ: { templateKey: 'kitchen', imageKey: 'kitchen' },
	掃除機: { templateKey: 'kitchen', imageKey: 'kitchen' },
	エアコン: { templateKey: 'kitchen', imageKey: 'kitchen' },

	// 書籍
	小説: { templateKey: 'books', imageKey: 'books' },
	マンガ: { templateKey: 'books', imageKey: 'books' },
	ビジネス書: { templateKey: 'books', imageKey: 'books' },
	IT書籍: { templateKey: 'books', imageKey: 'books' },
	雑誌: { templateKey: 'books', imageKey: 'books' },

	// 家具・インテリア
	家具: { templateKey: 'furniture', imageKey: 'furniture' },
	収納用品: { templateKey: 'furniture', imageKey: 'furniture' },
	キッチン用品: { templateKey: 'kitchen', imageKey: 'kitchen' },
	寝具: { templateKey: 'bedding', imageKey: 'bedding' },
	インテリア: { templateKey: 'interior', imageKey: 'interior' },

	// ベビー・キッズ
	ベビー服: { templateKey: 'baby', imageKey: 'baby' },
	おもちゃ: { templateKey: 'baby', imageKey: 'baby' },
	ベビーカー: { templateKey: 'baby', imageKey: 'baby' },
	授乳用品: { templateKey: 'baby', imageKey: 'baby' },
	マタニティウェア: { templateKey: 'baby', imageKey: 'baby' },

	// 食品・飲料
	スナック: { templateKey: 'food', imageKey: 'food' },
	飲料: { templateKey: 'food', imageKey: 'food' },
	インスタント食品: { templateKey: 'food', imageKey: 'food' },
	お菓子: { templateKey: 'food', imageKey: 'food' },
	健康食品: { templateKey: 'food', imageKey: 'food' },

	// スポーツ・アウトドア
	ランニング: { templateKey: 'sports', imageKey: 'sports' },
	フィットネス: { templateKey: 'sports', imageKey: 'sports' },
	アウトドア: { templateKey: 'sports', imageKey: 'sports' },
	自転車用品: { templateKey: 'sports', imageKey: 'sports' },
	スポーツウェア: { templateKey: 'sports', imageKey: 'sports' },

	// 美容・コスメ
	スキンケア: { templateKey: 'beauty', imageKey: 'beauty' },
	メイク用品: { templateKey: 'beauty', imageKey: 'beauty' },
	香水: { templateKey: 'beauty', imageKey: 'beauty' },
	ヘアケア: { templateKey: 'beauty', imageKey: 'beauty' }
};

function randomChoice(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max, decimals = 1) {
	return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function randomChoices(arr, count) {
	const shuffled = [...arr].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}
function generateProductName(template, brand) {
	const { models, types } = template;
	if (models) {
		const model = randomChoice(models);
		const number = randomInt(1, 15);
		return `${brand} ${model} ${number}`;
	}
	if (types) {
		const type = randomChoice(types);
		const adjectives = ['プレミアム', 'ベーシック', 'デラックス'];
		const adjective = randomChoice(adjectives);
		return `${brand} ${adjective} ${type}`;
	}
	return `${brand} Product ${randomInt(1, 100)}`;
}
function generateSpecs(template) {
	if (!template.specs) return {};
	const specs = {};
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	for (const [key, values] of Object.entries(template.specs)) {
		specs[key] = randomChoice(values);
	}
	return specs;
}
function generateProduct(
	parentCategoryId,
	parentCategoryName,
	subcategoryId,
	subcategoryName,
	template,
	images
) {
	const brand = randomChoice(template.brands);
	const name = generateProductName(template, brand);

	const [minPrice, maxPrice] = template.priceRange;
	const originalPrice = randomInt(minPrice, maxPrice);
	const discountPercent = randomInt(0, 30);
	const price = Math.floor(originalPrice * (1 - discountPercent / 100));

	const rating = randomFloat(3.5, 5.0);
	const reviews = randomInt(50, 2000);
	const isNew = Math.random() < 0.2;
	const isHot = Math.random() < 0.25;
	const inStock = Math.random() < 0.9;
	const stock = inStock ? randomInt(1, 500) : 0;
	const tagCount = randomInt(2, 4);
	const tags = randomChoices(template.tags, tagCount);
	const image = randomChoice(images);
	const imageCount = randomInt(3, 6);
	const productImages = randomChoices(images, imageCount);
	const specs = generateSpecs(template);

	// 注意：你需要根据你的 PocketBase 中 products 表的实际字段名来调整这里的属性名
	// 例如，父分类ID的字段名可能是 'category_id'，子分类ID的字段名可能是 'subcategory_id'
	return {
		name: `${parentCategoryName} - ${subcategoryName} - ${name}`,
		name_ja: name,
		price,
		originalPrice,
		discount: discountPercent,
		rating,
		reviews,
		image,
		images: productImages,
		description: `${name}は、${parentCategoryName}・${subcategoryName}カテゴリの高品質な商品です。`,
		isNew,
		isHot,
		inStock,
		stock,
		brand,
		tags,
		category_id: parentCategoryId,
		specs
	};
}

// ========== 主函数 (已完全重构) ==========
async function main() {
	console.log('🚀 商品データ生成を開始します...\n');

	try {
		// 1. 管理员登录
		await pb.admins.authWithPassword('1076731326@qq.com', 'khr112020!'); // 请替换为你的管理员邮箱和密码
		console.log('✅ 管理者としてログインしました\n');

		// 2. 获取所有分类数据（包含展开的子分类）
		const categories = await pb.collection('category').getFullList({
			expand: 'children' // 展开子分类关系[citation2]
		});
		console.log(`📦 ${categories.length} 個の親カテゴリーを取得しました\n`);

		let totalProductsCreated = 0;

		// 3. 遍历每个一级分类
		for (const parentCategory of categories) {
			console.log(`\n📂 親カテゴリー処理中: ${parentCategory.name} (ID: ${parentCategory.id})`);

			// 检查是否有子分类
			const subcategories = parentCategory.expand?.children || [];
			let targets = [];

			if (subcategories.length > 0) {
				console.log(`   📁  ${subcategories.length} 個のサブカテゴリーが見つかりました`);
				targets = subcategories;
			} else {
				console.log(
					`   ℹ️  サブカテゴリーがありません。親カテゴリーをターゲットとして使用します。`
				);
				targets = [parentCategory];
			}

			// 4. 遍历目标 (可能是子分类，也可能是没有子分类的亲分类)
			for (const target of targets) {
				const isParentAsTarget = target.id === parentCategory.id;
				console.log(`    🎯 ターゲット: ${target.name} (ID: ${target.id})`);

				// 5. 根据分类名称查找对应的产品模板和图片
				const mapping = subcategoryToTemplateMap[target.name];
				if (!mapping) {
					console.log(
						`    ⚠️  "${target.name}" に対応する製品テンプレートが見つかりません。スキップします。`
					);
					continue;
				}

				const template = productTemplates[mapping.templateKey];
				const images = unsplashImages[mapping.imageKey];

				if (!template || !images) {
					console.log(
						`    ⚠️  テンプレート(${mapping.templateKey})または画像(${mapping.imageKey})が未定義です。スキップします。`
					);
					continue;
				}

				// 6. 为该分类生成产品
				const productsToGenerate = 30; // 每个分类生成的产品数量
				console.log(`    🔨 ${productsToGenerate}個の商品を生成中...`);

				let generatedForThisTarget = 0;
				for (let i = 0; i < productsToGenerate; i++) {
					const product = generateProduct(
						parentCategory.id,
						parentCategory.name,
						target.id,
						target.name,
						template,
						images
					);

					// 如果是直接针对父分类生成（无子分类），调整部分字段
					if (isParentAsTarget) {
						product.subcategory_id = ''; // 不关联子分类
						product.name = `${parentCategory.name} - ${product.name_ja}`;
						product.description = `${product.name_ja}は、${parentCategory.name}カテゴリの高品質な商品です。`;
					}

					try {
						await pb.collection('products').create(product); // 创建记录[citation2]
						generatedForThisTarget++;
						totalProductsCreated++;

						// 进度提示
						if ((i + 1) % 10 === 0) {
							console.log(`      ... ${i + 1}/${productsToGenerate} 完了`);
						}
					} catch (error) {
						console.error(`    ✗ 商品作成エラー (${target.name}):`, error.message);
					}
				}
				console.log(`    ✅ ${target.name}: ${generatedForThisTarget} 個の商品を作成しました`);
			}
		}

		console.log(`\n\n🎉 完了！合計 ${totalProductsCreated} 個の商品を PocketBase に作成しました。`);
	} catch (error) {
		console.error('❌ スクリプト実行中にエラーが発生しました:', error);
		process.exit(1);
	}
}

// 运行脚本
main();
