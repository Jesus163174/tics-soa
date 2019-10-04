'use strict'
const User = use('App/Models/User');
const Transaction = use ('App/Models/Transaction');
class UserController {

    async index({ request, response, view }) {
        try{
            let sellers = await User.query().where('rol','seller').select('id','username','status','avatar','created_at').fetch();
            let count   = await User.query().where('rol','seller').getCount();
            return response.status(200).json({
                "message":"Listado de vendedores",
                "sellers":sellers,
                "count":count
            });
        }catch(error){
            let message = `Ocurrio un error en el servidor, ERROR: ${error.message}`;
            return response.status(500).json({"message":message});
        }
    }
    async timeline({params,request,response}){
        let {user_id} = params;
        //return response.json(user_id);
        const timeline = await Transaction.query()
                        .join('inventories','transactions.inventory_id','inventories.id')
                        .join('products','inventories.product_id','products.id')
                        .select(
                            'products.name',
                            'transactions.created_at',
                            'products.image_url',
                            'transactions.quantity',
                            'transactions.type'
                        ).where('transactions.user_id',user_id)
                        .orderBy('transactions.created_at','desc').fetch();
        return response.status(201).json(timeline);
    }
    async store({ request, response }) {
        try{
            let sser = await User.create(request.all());
            return response.json("The Seller has registered successful"); 
        } catch(error) {
            return response.json(error); 
        }
    }
    async show({ params, request, response, view }) {
        const {id} = params;
        let user = await User.findOrFail(id);
        return response.json(user);
    }
    async update({ params, request, response }) {
        const {id} = params;
        let user = await User.findOrFail(id);
        user.merge(request.all());
        await user.save();
        return response.json(user);
    }
    async destroy({ params, request, response }) {
    }
}

module.exports = UserController
