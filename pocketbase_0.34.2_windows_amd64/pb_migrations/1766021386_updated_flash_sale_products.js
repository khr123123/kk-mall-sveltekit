/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3416281675');

		// update field
		collection.fields.addAt(
			1,
			new Field({
				cascadeDelete: false,
				collectionId: 'pbc_1764300400',
				hidden: false,
				id: 'relation3165732907',
				maxSelect: 1,
				minSelect: 0,
				name: 'flash_sale_id',
				presentable: false,
				required: false,
				system: false,
				type: 'relation'
			})
		);

		// update field
		collection.fields.addAt(
			2,
			new Field({
				cascadeDelete: false,
				collectionId: 'pbc_4092854851',
				hidden: false,
				id: 'relation1166304858',
				maxSelect: 999,
				minSelect: 0,
				name: 'product_id',
				presentable: false,
				required: false,
				system: false,
				type: 'relation'
			})
		);

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3416281675');

		// update field
		collection.fields.addAt(
			1,
			new Field({
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
			})
		);

		// update field
		collection.fields.addAt(
			2,
			new Field({
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
			})
		);

		return app.save(collection);
	}
);
