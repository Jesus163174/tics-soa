'use strict'

const Sale = use('App/Models/Sale');
const Inventory = use('App/Models/Inventory');
const Transaction = use('App/Models/Transaction');
const Product     = use('App/Models/Product');

class SaleController {
    
    async index({ request, response, view }) {
        try{
            let total = await Sale.query().where('status','pagago').sum('total as total').first();
            let count = await Sale.query().where('status','pagado').getCount();
            let sales = await Sale.query().where('status','pagado').select('id','total','status','created_at').fetch();
            return response.json({
                "message":"Ventas totales de la tienda",
                "total":total,
                "sales": sales,
                "count":count
            });
        }catch(error){
            let message = `Ocurrio un error en el servidor, Error: ${error.message}`;
            return response.json({"message":message});
        }
    }
    async mySales({request,response}){
        try{
            let total = await Sale.query().where('user_id',request.get().id).where('status','pagago').sum('total as total').first();
            let count = await Sale.query().where('user_id',request.get().id).where('status','pagado').getCount();
            let sales = await Sale.query().where('user_id',request.get().id).where('status','pagado').select('id','total','status','created_at').fetch();
            return response.json({
                "message":"Ventas totales de la tienda",
                "total":total,
                "sales": sales,
                "count":count
            });
        }catch(error){
            let message = `Ocurrio un error en el servidor, Error: ${error.message}`;
            return response.json({"message":message});
        }
    }
    async store({ request, response }) {
        try{
            let sale                 = await Sale.create(request.all());

            let product              = await Product.findOrFail(sale.product_id);

            let inventory            = await Inventory.query().where('product_id',product.id).first();
            inventory.quantify      -= sale.quantity;
            await inventory.save();

            let transaction          =  new Transaction();
            transaction.quantity     = sale.quantity;
            transaction.inventory_id = inventory.id;
            transaction.type         = "substract";
            transaction.user_id      = sale.user_id;
            await transaction.save();
            
            let res = {
                "sale":sale,
                "inventory":"El inventario fue modificado",
                "transaction":"Se agrego una transaccion nueva",
                "status":"successfull"
            }
            return response.status(200).json(res);
        }catch(error){
            return response.status(500).json({
                "error":"Error: "+error
            });
        }
    }
    async show({ params, request, response }) {
        try{
            let sale = await Sale.findOrFail(params.id);
            return response.status(200).json({
                "message":"Detalle de la venta",
                "sale":sale,
                "user_data":await sale.user().fetch(),
                "product_data":await sale.product().with('inventory').fetch()
            })
        }catch(error){
            let message = `Ocurrio un error en el servidor, Error: ${error.message}`;
            return response.json({"message":message});
        }
    }
    async destroy({ params, request, response }) {
        try{
            let {id} = params;
            let sale = await Sale.findOrFail(id);
            sale.status = "cancelado";
            await sale.save();
            return response.status(200).json({"msg":"la venta fue cancelada exitosamente"});
        }catch(error){
            return response.status(501).json({"error":error});
        }
    }
}

module.exports = SaleController
