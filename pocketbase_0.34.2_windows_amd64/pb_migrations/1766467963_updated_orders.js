/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3527180448');

		// add field
		collection.fields.addAt(
			8,
			new Field({
				cascadeDelete: false,
				collectionId: 'pbc_199332750',
				hidden: false,
				id: 'relation3943065925',
				maxSelect: 1,
				minSelect: 0,
				name: 'shipping_address',
				presentable: false,
				required: false,
				system: false,
				type: 'relation'
			})
		);

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3527180448');

		// remove field
		collection.fields.removeById('relation3943065925');

		return app.save(collection);
	}
);
