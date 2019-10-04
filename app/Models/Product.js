'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {

    inventory () {
        return this.hasOne('App/Models/Inventory')
    }

    static get table () {
        return 'products'
    }
}

module.exports = Product
