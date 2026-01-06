/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_4092854851');

		// remove field
		collection.fields.removeById('editor475199832');

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_4092854851');

		// add field
		collection.fields.addAt(
			15,
			new Field({
				convertURLs: false,
				hidden: false,
				id: 'editor475199832',
				maxSize: 0,
				name: 'brand',
				presentable: false,
				required: false,
				system: false,
				type: 'editor'
			})
		);

		return app.save(collection);
	}
);
