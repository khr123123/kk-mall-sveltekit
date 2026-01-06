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
					cascadeDelete: false,
					collectionId: 'pbc_1764300400',
					hidden: false,
					id: 'relation3165732907',
					maxSelect: 999,
					minSelect: 0,
					name: 'flash_sale_id',
					presentable: false,
					required: false,
					system: false,
					type: 'relation'
				},
				{
					cascadeDelete: false,
					collectionId: 'pbc_4092854851',
					hidden: false,
					id: 'relation1166304858',
					maxSelect: 1,
					minSelect: 0,
					name: 'product_id',
					presentable: false,
					required: false,
					system: false,
					type: 'relation'
				},
				{
					hidden: false,
					id: 'number3932293411',
					max: null,
					min: null,
					name: 'salePrice',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					hidden: false,
					id: 'number4201181115',
					max: null,
					min: null,
					name: 'stockLimit',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					hidden: false,
					id: 'number2074455567',
					max: null,
					min: null,
					name: 'soldCount',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					hidden: false,
					id: 'number119905006',
					max: null,
					min: null,
					name: 'maxPerUser',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
				},
				{
					hidden: false,
					id: 'bool2323052248',
					name: 'isActive',
					presentable: false,
					required: false,
					system: false,
					type: 'bool'
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
			id: 'pbc_3416281675',
			indexes: [],
			listRule: null,
			name: 'flash_sale_products',
			system: false,
			type: 'base',
			updateRule: null,
			viewRule: null
		});

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3416281675');

		return app.delete(collection);
	}
);
