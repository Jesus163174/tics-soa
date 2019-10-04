'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
    return { greeting: 'Hello world in JSON' }
});

Route.group(()=>{
    Route.post('login','AuthController.login');
}).prefix('api/v1/auth');

Route.group(()=>{

    Route.get('token-admin','AuthController.token');

    Route.resource('products','ProductController').apiOnly();
    Route.put('remove-product/:product_id','ProductController.discartToInventory');
    Route.get('my-products','ProductController.myProducts');
    Route.get('products-like','ProductController.search');

    Route.resource('sales','SaleController').apiOnly();
    Route.get('my-sales','SaleController.mySales');
    Route.get('sales-filter','SaleController.filter');
    Route.resource('sellers','UserController').apiOnly();
    
    Route.get('timeline/:user_id','UserController.timeline')
}).prefix('api/v1').middleware('auth');
