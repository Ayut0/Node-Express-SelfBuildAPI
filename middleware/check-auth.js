const jwt = require('jsonwebtoken')
const HttpError = require("../models/http-error");

module.exports = (req, res, next) =>{
    console.log('auth req', req.headers);
    if(req.method === 'OPTIONS'){
        return next();
    }

    try{
        const token = req.headers.authorization.split(' ')[1]; //Authorization: 'Bearer TOKEN'
        if(!token){
            throw new Error('Authentication failed')
        }
        //decodedToken has a userID, email cuz we pass them when it's created in user controller
        //verify: validating a token
        const decodedToken = jwt.verify(token, this.process.env.JWT_KEY);
        //add a userId to req
        req.userData = {userId: decodedToken.userId};
        next();
    }catch(err){
        const error = new HttpError('Authentication failed', 403);
        return next(error)
    }
}