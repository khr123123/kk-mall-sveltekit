/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1174553048');

		// add field
		collection.fields.addAt(
			3,
			new Field({
				cascadeDelete: false,
				collectionId: 'pbc_1174553048',
				hidden: false,
				id: 'relation2711073210',
				maxSelect: 999,
				minSelect: 0,
				name: 'children',
				presentable: false,
				required: false,
				system: false,
				type: 'relation'
			})
		);

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1174553048');

		// remove field
		collection.fields.removeById('relation2711073210');

		return app.save(collection);
	}
);
