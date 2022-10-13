const HttpError = require('../models/http-error')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { validationResult } = require('express-validator')


const getUsers = async (req, res, next) => {
    let users;
    try{
        users = await User.find({}, '-password');
    }catch(err){
        const error = new HttpError('Could not get users.', 500);
        return next(error);
    }
    res.json({users: users.map(user => user.toObject({getters: true}))})
}
const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        return next(
            new HttpError('Invalid inputs passed, pls check your data', 422)
        );
    }
    const { name, email, password, places } = req.body;

    let existingUser
    try{
        existingUser = await User.findOne({email:email});
    }catch(err){
        const error = new HttpError('Signing up failed', 500);
        return next(error);
    }

    if(existingUser){
        const error = new HttpError('User exists already, please login instead.', 422)
        return next(error);
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password, 12)
    }catch(err){
        const error = new HttpError(
            'Could not create a new user, please try again',
            500
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: [],
    });

    try{
        await createdUser.save();
    }catch(err){
        const error = new HttpError('Creating user failed', 500);
        console.log('error', err.message)
        return next(error)
    }

    //Create a token
    let token;
    try{
        token = jwt.sign({
            userId: createdUser.id,
            email: createdUser.email
        }, process.env.JWT_KEY, {expiresIn: '1h'})
    }catch(err){
        const error = new HttpError('Signing up failed', 500);
        return next(error);
    }

    res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});
}
const login = async (req, res, next) => {
    const { email, password } = req.body;

    //Check email
    let existingUser
    try{
        existingUser = await User.findOne({email:email});
    }catch(err){
        const error = new HttpError('Logged in failed. Your email is invalid', 500);
        return next(error);
    }

    if(!existingUser){
        const error = new HttpError(
            "Invalid credentials, could not log you in", 403
        )
        return next(error)
    }

    //Check password
    let isValidPassword = false;
    try{
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    }catch(err){
        const error = new HttpError('Could not log you in, please check your password and try again', 500)
        return next(error)
    }

    if(!isValidPassword){
        const error = new HttpError('Invalid username or password, we could not log you in', 401)
        return next(error);
    }

    //Generate a token
    //Make sure you use the same key as used in sign up
    let token;
    try{
        token = jwt.sign({
            userId: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY, {expiresIn: '1h'})
    }catch(err){
        const error = new HttpError('Logging in failed', 500);
        return next(error);
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    })
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login