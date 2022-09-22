const uuid = require('uuid')
const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Yuto',
        email: 'test@test.com',
        password: 'testers'
    }

]


const getUsers = (req, res, next) => {
    res.json({users: DUMMY_USERS})
}
const signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        throw new HttpError('Invalid inputs passed, pls check your data', 422)
    }
    const { name, email, password } = req.body;

    const hasUser = DUMMY_USERS.find(user => user.email === email);

    if(hasUser){
        throw new HttpError('You could not create a user with the same email', 401)
    }

    const createdUser = {
        id: uuid.v4(),
        name,
        email,
        password
    }

    DUMMY_USERS.push(createdUser);

    res.status(201).json({place: createdUser});
}
const login = (req, res, next) => {
    const { email, password } = req.body

    const identifiedUser = DUMMY_USERS.find(user => user.email === email)
    if(!identifiedUser || identifiedUser.password !== password){
        throw new HttpError('Could not find user, credentials seem to be wrong', 401)
    }
    
    res.json({message: 'Logged in!'})
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login