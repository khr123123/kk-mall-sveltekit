/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number666537513",
    "max": null,
    "min": null,
    "name": "points",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select4174076384",
    "maxSelect": 1,
    "name": "member_level",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "ブロンズ会員",
      "シルバー会員",
      "ゴールド会員",
      "プラチナ会員"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("number666537513")

  // remove field
  collection.fields.removeById("select4174076384")

  return app.save(collection)
})
