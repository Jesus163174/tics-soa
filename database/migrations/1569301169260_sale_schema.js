'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SaleSchema extends Schema {
    up() {
        this.create('sales', (table) => {
            table.increments()
            table.integer('product_id')
            table.integer('user_id')
            table.integer('quantity')
            table.float('discount')
            table.float('total')
            table.date('date');
            table.enum('paymenth_method',['tarjeta','efectivo'])
            table.timestamps()
        })
    }
    down() {
        this.drop('sales')
    }
}

module.exports = SaleSchema
