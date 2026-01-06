/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1078244565');

		// add field
		collection.fields.addAt(
			5,
			new Field({
				cascadeDelete: false,
				collectionId: 'pbc_1568161597',
				hidden: false,
				id: 'relation261109956',
				maxSelect: 1,
				minSelect: 0,
				name: 'sku',
				presentable: false,
				required: false,
				system: false,
				type: 'relation'
			})
		);

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1078244565');

		// remove field
		collection.fields.removeById('relation261109956');

		return app.save(collection);
	}
);
