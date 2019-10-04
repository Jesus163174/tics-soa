'use strict'

const User = use('App/Models/User');
const Token = use('App/Models/Token');
class AuthController {

    async login({ request, auth, response }) {

        //return response.json(request.all());
        const email = request.input("email")
        const password = request.input("password");
        const token_nav = request.input('token_nav');

        try {
            if (await auth.attempt(email, password)) {
                let user  = await User.findBy('email', email);
                let token = await Token.query().where('user_id',user.id).getCount();
                if(token == 0){
                    let token = new Token();
                    token.user_id = user.id;
                    token.type = "navegador";
                    token.token = token_nav;
                    await token.save();
                }else{
                    let token = await Token.query().where('user_id',user.id).first();
                    token.token = token_nav;
                    await token.save();
                }
                let accessToken = await auth.generate(user);
                return response.status(201).json({ "user": user, "access_token": accessToken });
            }
        }catch (e) {
            return response.status(401).json({ mssg: 'You first need to register!',"error":e.message })
        }
    }

    async token({ request, auth, response }) {  
        try{
            let user_id_admin = 1;
            let token = await Token.query().where('user_id',user_id_admin).first();
            return response.status(201).json({"token":token.token});
        }catch(error){
            return response.status(500).json({
                "error":"Error: "+error
            });
        }
    }


}

module.exports = AuthController
