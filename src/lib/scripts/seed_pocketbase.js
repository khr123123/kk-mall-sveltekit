// PocketBase 数据生成脚本
// 使用方法: node seed_pocketbase.js
// 确保 PocketBase 服务运行在 http://127.0.0.1:8090

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// 品牌数据
const brandsData = [
  {
    name: 'Apple',
    logo: 'https://logo.clearbit.com/apple.com',
    description: '革新的なテクノロジー製品を提供する世界的なブランド。iPhone、Mac、iPadなど、高品質な製品で知られています。',
    category: 'electronics',
    isPopular: true,
    rating: 4.8,
    followers: 50000,
    discounts: 15
  },
  {
    name: 'Samsung',
    logo: 'https://logo.clearbit.com/samsung.com',
    description: 'スマートフォンから家電まで幅広い製品ラインナップを誇る韓国の総合電機メーカー。',
    category: 'electronics',
    isPopular: true,
    rating: 4.7,
    followers: 45000,
    discounts: 20
  },
  {
    name: 'Sony',
    logo: 'https://logo.clearbit.com/sony.com',
    description: 'エレクトロニクスとエンターテインメントの融合。カメラ、オーディオ、ゲーム機など多彩な製品を展開。',
    category: 'electronics',
    isPopular: true,
    rating: 4.6,
    followers: 38000,
    discounts: 18
  },
  {
    name: 'Nike',
    logo: 'https://logo.clearbit.com/nike.com',
    description: 'スポーツウェアとフットウェアのグローバルリーダー。革新的なデザインと高性能を追求。',
    category: 'fashion',
    isPopular: true,
    rating: 4.9,
    followers: 65000,
    discounts: 25
  },
  {
    name: 'Adidas',
    logo: 'https://logo.clearbit.com/adidas.com',
    description: 'スポーツとライフスタイルの融合ブランド。三本線のロゴで有名なドイツのスポーツメーカー。',
    category: 'fashion',
    isPopular: true,
    rating: 4.8,
    followers: 58000,
    discounts: 22
  },
  {
    name: 'UNIQLO',
    logo: 'https://logo.clearbit.com/uniqlo.com',
    description: '高品質で手頃な価格のライフウェア。シンプルで機能的なデザインが特徴の日本ブランド。',
    category: 'fashion',
    isPopular: true,
    rating: 4.5,
    followers: 52000,
    discounts: 30
  },
  {
    name: 'Dyson',
    logo: 'https://logo.clearbit.com/dyson.com',
    description: '革新的な家電製品のパイオニア。掃除機、ヘアドライヤー、空気清浄機など独自技術を持つ。',
    category: 'home',
    isPopular: true,
    rating: 4.7,
    followers: 42000,
    discounts: 12
  },
  {
    name: 'Panasonic',
    logo: 'https://logo.clearbit.com/panasonic.com',
    description: '信頼性の高い家電製品メーカー。白物家電から映像機器まで幅広く展開する日本企業。',
    category: 'home',
    isPopular: false,
    rating: 4.4,
    followers: 35000,
    discounts: 10
  },
  {
    name: 'Nintendo',
    logo: 'https://logo.clearbit.com/nintendo.com',
    description: '世界を魅了するゲームとエンターテインメント。マリオ、ゼルダなど人気キャラクターを持つ。',
    category: 'electronics',
    isPopular: true,
    rating: 4.9,
    followers: 55000,
    discounts: 5
  },
  {
    name: 'Canon',
    logo: 'https://logo.clearbit.com/canon.com',
    description: 'イメージング技術のリーディングカンパニー。カメラ、プリンターで世界的なシェアを持つ。',
    category: 'electronics',
    isPopular: false,
    rating: 4.6,
    followers: 28000,
    discounts: 15
  },
  {
    name: 'LG',
    logo: 'https://logo.clearbit.com/lg.com',
    description: '革新的な家電とモバイル機器。有機ELテレビや冷蔵庫で高い評価を得る韓国メーカー。',
    category: 'electronics',
    isPopular: false,
    rating: 4.5,
    followers: 40000,
    discounts: 18
  },
  {
    name: 'Microsoft',
    logo: 'https://logo.clearbit.com/microsoft.com',
    description: 'ソフトウェアとクラウドサービスのリーダー。Windows、Office、Azureなどを提供。',
    category: 'electronics',
    isPopular: false,
    rating: 4.7,
    followers: 45000,
    discounts: 10
  }
];

// 商品データ（各ブランドの商品）
const productsData = {
  'Apple': [
    {
      name: 'iPhone 15 Pro',
      image: 'https://images.unsplash.com/photo-1696446702081-9048df8e31c9?w=500',
      description: '最新のA17 Proチップ搭載。チタニウムデザインで軽量化を実現。プロ向けの高性能カメラシステム。',
      price: 159800,
      originalPrice: 179800,
      category: 'スマートフォン',
      stock: 50,
      rating: 4.9,
      reviewCount: 234,
      isNew: true,
      isFeatured: true
    },
    {
      name: 'MacBook Air M3',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      description: '驚異的なパフォーマンスと最大18時間のバッテリー駆動時間。薄型軽量で持ち運びに最適。',
      price: 164800,
      originalPrice: 184800,
      category: 'ノートPC',
      stock: 30,
      rating: 4.8,
      reviewCount: 189,
      isNew: true,
      isFeatured: true
    },
    {
      name: 'AirPods Pro (第2世代)',
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500',
      description: 'アクティブノイズキャンセリング搭載。空間オーディオで没入感のある音楽体験。USB-C充電対応。',
      price: 39800,
      originalPrice: 39800,
      category: 'オーディオ',
      stock: 100,
      rating: 4.7,
      reviewCount: 567,
      isNew: false,
      isFeatured: true
    },
    {
      name: 'Apple Watch Series 9',
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500',
      description: '健康とフィットネスの究極のパートナー。心拍数、血中酸素、ECG測定機能搭載。',
      price: 59800,
      originalPrice: 69800,
      category: 'ウェアラブル',
      stock: 45,
      rating: 4.8,
      reviewCount: 321,
      isNew: false,
      isFeatured: false
    },
    {
      name: 'iPad Pro 12.9インチ',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
      description: 'M2チップ搭載。プロフェッショナルな作業に最適。Apple Pencil対応で創造性を解放。',
      price: 172800,
      originalPrice: 192800,
      category: 'タブレット',
      stock: 25,
      rating: 4.9,
      reviewCount: 156,
      isNew: false,
      isFeatured: true
    },
    {
      name: 'Magic Keyboard',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      description: '洗練されたデザインの充電式キーボード。快適なタイピング体験を提供。',
      price: 14800,
      originalPrice: 14800,
      category: 'アクセサリー',
      stock: 80,
      rating: 4.5,
      reviewCount: 234,
      isNew: false,
      isFeatured: false
    }
  ],
  'Nike': [
    {
      name: 'Air Max 270',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      description: '最大限のクッショニングで一日中快適。スタイリッシュなデザインで街歩きにも最適。',
      price: 17600,
      originalPrice: 22000,
      category: 'シューズ',
      stock: 120,
      rating: 4.7,
      reviewCount: 890,
      isNew: false,
      isFeatured: true
    },
    {
      name: 'Dri-FIT トレーニングシャツ',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      description: '汗を素早く吸収・発散するドライフィット素材。激しいトレーニングでも快適。',
      price: 4400,
      originalPrice: 5500,
      category: 'ウェア',
      stock: 200,
      rating: 4.6,
      reviewCount: 445,
      isNew: false,
      isFeatured: false
    },
    {
      name: 'Brasilia トレーニングバッグ',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      description: 'ジムや旅行に最適な多機能バッグ。耐久性のある素材で長く使える。',
      price: 5280,
      originalPrice: 6600,
      category: 'バッグ',
      stock: 85,
      rating: 4.5,
      reviewCount: 312,
      isNew: false,
      isFeatured: false
    },
    {
      name: 'React Infinity Run',
      image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500',
      description: 'ランニングに最適な安定性とクッション性。長距離ランでも疲れにくい。',
      price: 16500,
      originalPrice: 19800,
      category: 'ランニングシューズ',
      stock: 65,
      rating: 4.8,
      reviewCount: 523,
      isNew: true,
      isFeatured: true
    },
    {
      name: 'Tech Fleece パーカー',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
      description: '軽量で暖かいテックフリース素材。スリムフィットでスタイリッシュ。',
      price: 14080,
      originalPrice: 17600,
      category: 'ウェア',
      stock: 75,
      rating: 4.7,
      reviewCount: 267,
      isNew: false,
      isFeatured: false
    }
  ],
  'Sony': [
    {
      name: 'WH-1000XM5',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
      description: '業界最高クラスのノイズキャンセリング。ハイレゾ音源対応で最高の音質を実現。',
      price: 49500,
      originalPrice: 55000,
      category: 'ヘッドホン',
      stock: 75,
      rating: 4.9,
      reviewCount: 1234,
      isNew: false,
      isFeatured: true
    },
    {
      name: 'PlayStation 5',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
      description: '次世代のゲーム体験を提供するコンソール。超高速SSDで読み込み時間ほぼゼロ。',
      price: 66980,
      originalPrice: 66980,
      category: 'ゲーム機',
      stock: 30,
      rating: 4.8,
      reviewCount: 2345,
      isNew: false,
      isFeatured: true
    },
    {
      name: 'α7 IV ミラーレスカメラ',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
      description: '写真と動画の両方で優れたパフォーマンス。プロフェッショナル向けフルサイズミラーレス。',
      price: 329000,
      originalPrice: 369000,
      category: 'カメラ',
      stock: 15,
      rating: 4.9,
      reviewCount: 567,
      isNew: false,
      isFeatured: true
    },
    {
      name: 'BRAVIA XR 65インチ',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
      description: '認知特性プロセッサー「XR」搭載の4K有機ELテレビ。映画館のような映像美。',
      price: 328000,
      originalPrice: 398000,
      category: 'テレビ',
      stock: 20,
      rating: 4.8,
      reviewCount: 289,
      isNew: false,
      isFeatured: false
    }
  ],
  'Dyson': [
    {
      name: 'V15 Detect コードレス掃除機',
      image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500',
      description: 'レーザーで微細なゴミを可視化する革新的な掃除機。強力な吸引力で徹底クリーン。',
      price: 99800,
      originalPrice: 119800,
      category: '掃除機',
      stock: 40,
      rating: 4.7,
      reviewCount: 678,
      isNew: false,
      isFeatured: true
    },
    {
      name: 'Supersonic ヘアドライヤー',
      image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500',
      description: '髪を素早く美しく乾かす高性能ドライヤー。温度を素早く測定し、過度の熱ダメージを防止。',
      price: 45760,
      originalPrice: 52800,
      category: '美容家電',
      stock: 60,
      rating: 4.8,
      reviewCount: 432,
      isNew: false,
      isFeatured: false
    },
    {
      name: 'Pure Cool 空気清浄ファン',
      image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500',
      description: '空気を清浄しながら涼しい風を送る2in1製品。HEPAフィルターでPM0.1まで除去。',
      price: 66000,
      originalPrice: 77000,
      category: '空調家電',
      stock: 35,
      rating: 4.6,
      reviewCount: 289,
      isNew: false,
      isFeatured: false
    }
  ],
  'Samsung': [
    {
      name: 'Galaxy S24 Ultra',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
      description: '200MPカメラ搭載の最新フラッグシップ。Sペン内蔵で生産性向上。',
      price: 189800,
      originalPrice: 219800,
      category: 'スマートフォン',
      stock: 45,
      rating: 4.8,
      reviewCount: 456,
      isNew: true,
      isFeatured: true
    },
    {
      name: 'Galaxy Buds2 Pro',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
      description: 'インテリジェントANC搭載の完全ワイヤレスイヤホン。360度オーディオ対応。',
      price: 29800,
      originalPrice: 29800,
      category: 'オーディオ',
      stock: 90,
      rating: 4.6,
      reviewCount: 334,
      isNew: false,
      isFeatured: false
    }
  ]
};

async function seedData() {
  try {
    console.log('🚀 PocketBase データ生成開始...\n');

    // 管理者としてログイン（必要に応じて）
    // await pb.admins.authWithPassword('admin@example.com', 'password');

    const brandIdMap = {};

    // ブランドデータを作成
    console.log('📦 ブランドデータを作成中...');
    for (const brandData of brandsData) {
      try {
        const record = await pb.collection('brands').create(brandData);
        brandIdMap[brandData.name] = record.id;
        console.log(`✅ ${brandData.name} を作成しました (ID: ${record.id})`);
      } catch (error) {
        console.error(`❌ ${brandData.name} の作成に失敗:`, error.message);
      }
    }

    console.log('\n📦 商品データを作成中...');
    // 商品データを作成
    for (const [brandName, products] of Object.entries(productsData)) {
      const brandId = brandIdMap[brandName];
      if (!brandId) {
        console.log(`⚠️  ${brandName} のIDが見つかりません。スキップします。`);
        continue;
      }

      console.log(`\n🏷️  ${brandName} の商品を作成中...`);
      for (const productData of products) {
        try {
          const record = await pb.collection('products').create({
            ...productData,
            brand: brandId
          });
          console.log(`  ✅ ${productData.name} を作成しました`);
        } catch (error) {
          console.error(`  ❌ ${productData.name} の作成に失敗:`, error.message);
        }
      }
    }

    console.log('\n✨ データ生成完了！');
    console.log(`\n📊 作成されたデータ:`);
    console.log(`   - ブランド: ${brandsData.length}件`);
    console.log(`   - 商品: ${Object.values(productsData).flat().length}件`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// スクリプト実行
seedData();