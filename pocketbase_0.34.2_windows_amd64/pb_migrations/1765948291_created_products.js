/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			createRule: null,
			deleteRule: null,
			fields: [
				{
					autogeneratePattern: '[a-z0-9]{15}',
					hidden: false,
					id: 'text3208210256',
					max: 15,
					min: 15,
					name: 'id',
					pattern: '^[a-z0-9]+$',
					presentable: false,
					primaryKey: true,
					required: true,
					system: true,
					type: 'text'
				},
				{
					autogeneratePattern: '',
					hidden: false,
					id: 'text1579384326',
					max: 0,
					min: 0,
					name: 'name',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: false,
					system: false,
					type: 'text'
				},
				{
					autogeneratePattern: '',
					hidden: false,
					id: 'text709901210',
					max: 0,
					min: 0,
					name: 'name_ja',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: false,
					system: false,
					type: 'text'
				},
				{
					hidden: false,
					id: 'number3402113753',
					max: null,
					min: null,
					name: 'price',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					hidden: false,
					id: 'number1549342448',
					max: null,
					min: null,
					name: 'originalPrice',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					hidden: false,
					id: 'number3789599758',
					max: null,
					min: null,
					name: 'discount',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					hidden: false,
					id: 'number3632866850',
					max: null,
					min: null,
					name: 'rating',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					hidden: false,
					id: 'number1769007887',
					max: null,
					min: null,
					name: 'reviews',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					exceptDomains: null,
					hidden: false,
					id: 'url3309110367',
					name: 'image',
					onlyDomains: null,
					presentable: false,
					required: false,
					system: false,
					type: 'url'
				},
				{
					hidden: false,
					id: 'json3760176746',
					maxSize: 0,
					name: 'images',
					presentable: false,
					required: false,
					system: false,
					type: 'json'
				},
				{
					convertURLs: false,
					hidden: false,
					id: 'editor1843675174',
					maxSize: 0,
					name: 'description',
					presentable: false,
					required: false,
					system: false,
					type: 'editor'
				},
				{
					hidden: false,
					id: 'bool2271557348',
					name: 'isNew',
					presentable: false,
					required: false,
					system: false,
					type: 'bool'
				},
				{
					hidden: false,
					id: 'bool3759076198',
					name: 'isHot',
					presentable: false,
					required: false,
					system: false,
					type: 'bool'
				},
				{
					hidden: false,
					id: 'bool4251530779',
					name: 'inStock',
					presentable: false,
					required: false,
					system: false,
					type: 'bool'
				},
				{
					hidden: false,
					id: 'number1261852256',
					max: null,
					min: null,
					name: 'stock',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					convertURLs: false,
					hidden: false,
					id: 'editor475199832',
					maxSize: 0,
					name: 'brand',
					presentable: false,
					required: false,
					system: false,
					type: 'editor'
				},
				{
					hidden: false,
					id: 'json1874629670',
					maxSize: 0,
					name: 'tags',
					presentable: false,
					required: false,
					system: false,
					type: 'json'
				},
				{
					cascadeDelete: false,
					collectionId: 'pbc_1174553048',
					hidden: false,
					id: 'relation306617826',
					maxSelect: 1,
					minSelect: 0,
					name: 'category_id',
					presentable: false,
					required: false,
					system: false,
					type: 'relation'
				},
				{
					cascadeDelete: false,
					collectionId: 'pbc_1174553048',
					hidden: false,
					id: 'relation1573322327',
					maxSelect: 1,
					minSelect: 0,
					name: 'subcategory_id',
					presentable: false,
					required: false,
					system: false,
					type: 'relation'
				},
				{
					hidden: false,
					id: 'json3668958391',
					maxSize: 0,
					name: 'specs',
					presentable: false,
					required: false,
					system: false,
					type: 'json'
				},
				{
					hidden: false,
					id: 'autodate2990389176',
					name: 'created',
					onCreate: true,
					onUpdate: false,
					presentable: false,
					system: false,
					type: 'autodate'
				},
				{
					hidden: false,
					id: 'autodate3332085495',
					name: 'updated',
					onCreate: true,
					onUpdate: true,
					presentable: false,
					system: false,
					type: 'autodate'
				}
			],
			id: 'pbc_4092854851',
			indexes: [],
			listRule: null,
			name: 'products',
			system: false,
			type: 'base',
			updateRule: null,
			viewRule: null
		});

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_4092854851');

		return app.delete(collection);
	}
);
