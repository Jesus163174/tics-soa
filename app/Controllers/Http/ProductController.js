'use strict'

const Product = use('App/Models/Product');
const Inventory = use('App/Models/Inventory');
const Transaction = use('App/Models/Transaction');

class ProductController {

    async index({ request, response }) {
        try{
            let products = await Product.query()
                            .where('status','activo')
                            .orderBy('id','desc')
                            .with('inventory')
                            .select('id','name','created_at','image_url')
                            .fetch();
            let count    = await Product.query().where('status','activo').getCount();
            return response.status(200).json({
                "message":"Listado de productos",
                "products":products,
                "count":count
            });
        }catch(error){
            let message = `Ocurrio un error en el servidor, Error: ${error.message}`;
            return response.json({"message":message});
        }
    }

    async myProducts({params,request,response}){
        try{
            let products = await Product.query()
                        .join('inventories','products.id','inventories.product_id')
                        .select('products.id','products.name','inventories.quantify as stock','products.image_url','inventories.price')
                        .where('inventories.user_id',request.get().user_id)
                        .where('products.status','activo')
                        .orderBy('products.id','desc')
                        .fetch();
            let count    = await Product.query().where('status','activo').getCount();
            return response.status(200).json({
                "message":"Listado de productos",
                "products":products,
                "count":count
            });
        }catch(error){
            let message = `Ocurrio un error en el servidor, Error: ${error.message}`;
            return response.json({"message":message});
        }
    }

    async search({request,response}){
        try{
            let products = await Product.query()
                        .join('inventories','products.id','inventories.product_id')
                        .select('products.id','inventories.user_id','products.name','products.image_url','inventories.quantify as stock','inventories.price')
                        .where('products.code','LIKE',request.get().like)
                        .orWhere('products.name','LIKE','%'+request.get().like+"%")
                        .where('inventories.user_id',request.get().user_id)
                        .where('products.status','activo')
                        .orderBy('products.id','desc')
                        .fetch();
            return response.status(200).json({
                "message":"Listado de productos",
                "products":products,
            });
        }catch(error){
            let message = `Ocurrio un error en el servidor, Error: ${error.message}`;
            return response.json({"message":message});
        }
    }
    async store({ request, response }) {

        try{
            let {name,image_url,code,description} = request.only(['name','image_url','code','description']);
            let product         = new Product;
            product.name        = name;
            product.image_url   = image_url;
            product.code        = code;
            product.description = description;
            await product.save();
            
            let productId                    = product.id;
            let {user_id,quantify,tax,price} = request.only(['user_id','quantify','tax','price']);
            let inventory                    = new Inventory();
            inventory.user_id                = user_id;
            inventory.quantify               = quantify
            inventory.tax                    = tax;
            inventory.price                  = price;
            inventory.product_id             = productId;
            await inventory.save();
            
            let inventory_id         = inventory.id;
            let transaction          = new Transaction();
            transaction.type         = "add";
            transaction.quantity     = quantify;
            transaction.description  = description;
            transaction.inventory_id = inventory_id;
            transaction.date         = new Date('Y-m-d');
            transaction.user_id      = user_id;
            await transaction.save();

            let save = {
                "product":product,
                "inventary":inventory,
                "transaction":transaction,
                "success":true
            }

            return response.status(201).json(save);
        }catch(e){
            return response.json({"error":e});
        }
        
    }
    async show({ params, request, response, view }) {
        try{
            let product = await Product.findOrFail(params.id);
            return response.status(200).json({
                "message":"Detalle del producto",
                "product":product,
                "inventory":await product.inventory().fetch()
            })
        }catch(error){
            let message = `Ocurrio un error en el servidor, Error: ${error.message}`;
            return response.status(500).json({"message":message});
        }
    }
    async update({ params, request, response }) {
        try{
            let product         = await Product.findOrFail(params.id);
            product.name        = request.get().name;
            product.code        = request.get().code;
            product.description = request.get().description;
            await product.save();

            let inventory         = await Inventory.query().where('product_id',product.id).first();
            inventory.price       = request.get().price;
            inventory.description = request.get().description;
            inventory.tax         = request.get().tax;
            await inventory.save();

            return response.status(200).json({
                "message":"El producto fue actualizado correctamente"
            });
        }catch(error){
            let message = `Ocurrio un error en el servidor, Error: ${error.message}`;
            return response.status(500).json({"message":message});
        }
    }
    async discartToInventory({ params, request, response }) {
        try{
            let product = await Product.findOrFail(params.product_id);
            product.status = 'removed';
            await product.save();

            let inventory = await Inventory.query().where('product_id',product.id).fetch();

            let {quantity,description,user_id} = request.only(['quantity','description','user_id']);

            let transaction          = new Transaction();
            transaction.type         = "remove";
            transaction.quantity     = quantity;
            transaction.description  = description;
            transaction.inventory_id = inventory.id;
            transaction.user_id      = user_id;
            await transaction.save();

            return response.status(201).json({
                "message":"El producto fue removido correctamente"
            });

        }catch(error){
            let message = `Ocurrio un error en el servidor, Error: ${error.message}`;
            return response.status(500).json({"message":message}); 
        }
    }
}

module.exports = ProductController

