'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InvetoriesSchema extends Schema {
    up() {
        this.create('inventories', (table) => {
            table.increments()
            table.integer('product_id')
            table.float('price')
            table.float('tax')
            table.integer('user_id')
            table.integer('quantify')
            table.timestamps()
        })
    }

    down() {
        this.drop('invetories')
    }
}

module.exports = InvetoriesSchema
