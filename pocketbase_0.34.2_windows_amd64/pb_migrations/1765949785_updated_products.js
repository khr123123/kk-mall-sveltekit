/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_4092854851');

		// remove field
		collection.fields.removeById('relation1573322327');

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_4092854851');

		// add field
		collection.fields.addAt(
			18,
			new Field({
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
			})
		);

		return app.save(collection);
	}
);
