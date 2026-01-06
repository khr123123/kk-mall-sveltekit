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
					id: 'text724990059',
					max: 0,
					min: 0,
					name: 'title',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: false,
					system: false,
					type: 'text'
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
					id: 'date2393256231',
					max: '',
					min: '',
					name: 'startTime',
					presentable: false,
					required: false,
					system: false,
					type: 'date'
				},
				{
					hidden: false,
					id: 'date4098681852',
					max: '',
					min: '',
					name: 'endTime',
					presentable: false,
					required: false,
					system: false,
					type: 'date'
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
					id: 'number1655102503',
					max: null,
					min: null,
					name: 'priority',
					onlyInt: false,
					presentable: false,
					required: false,
					system: false,
					type: 'number'
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
			id: 'pbc_1764300400',
			indexes: [],
			listRule: null,
			name: 'flash_sales',
			system: false,
			type: 'base',
			updateRule: null,
			viewRule: null
		});

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1764300400');

		return app.delete(collection);
	}
);
