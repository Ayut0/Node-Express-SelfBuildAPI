const uuid = require('uuid');
const fs = require('fs')
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const User = require('../models/user')
const getCoordForAddress = require('../util/location');
const Place = require('../models/place');

const getPlacesById = async (req, res, next) =>{
    const placeId = req.params.pid;
    let place
    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError('Something went wrong... could not find a place', 500)
        return next(error);
    }

    if(!place || place.length === 0){
        return next(
            new HttpError('Could not find a place for the provided id', 404)
        );
      }

    await res.json({place: place.toObject({ getters: true })});
};

const getPlaceByUserId = async (req, res, next) =>{
    const userId = req.params.uid;
    let place;

    try{
        place = await Place.find({ creator: userId });

    }catch(err){
        const error = new HttpError('Something went wrong... could not find a place', 500);
        return next(error);
    }

    if(!place){
        return next(
            new HttpError('Could not find a place for the provided user id', 404)
        );
    }

    await res.json({place: place.map(place => place.toObject({ getters: true}))});
};
const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, pls check your data', 422))
    };
    //Extract user data who created the place from request
    const { title, description, address } = req.body;

    let coordinates
    try{
        coordinates = await getCoordForAddress(address);
    }catch(error){
        return next(error)
    };

    //Make sure we return the user's credential
    //Just return user id
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator: req.userData.userId
    });

    let user;
    try{
        user = await User.findById(req.userData.userId);
    }catch(err){
        const error = new HttpError('Creating place failed. Please try again', 500)
        return next(error);
    }

    if(!user){
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    console.log(user);
    
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session: sess});
        await sess.commitTransaction();
    }catch(err){
        const error = new HttpError('Creating place failed', 500);
        console.log('error', err.message)
        return next(error)
    }

    await res.status(201).json({place: createdPlace});
}

const updatePlace = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, pls check your data', 422))
    }
    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try{
        place = await Place.findById(placeId)
    }catch(err){
        const error = new HttpError('Something went wrong, Could not update the place', 500)
        return next(error);
    }

    //Only authorized user can update the place.
    //Error check if the place is created by the same user sending a request.
    //place.creator is a special object mongoose knows so we have to convert to string to compare to request
    if(place.creator.toString() !== req.userData.userId){
        const error = new HttpError('You are not eligible to update this place. This place is registered by other user.', 401)
        return next(error);
    }

    place.title= title;
    place.description = description;

    try{
        await place.save();
    }catch(err){
        const error = new HttpError('Something went wrong, Could not update the place', 500)
        return next(error);
    }
    await res.status(200).json({place: place.toObject({ getters: true })})
    
}

const deletePlace = async (req, res, next) =>{
    const placeId = req.params.pid;

    let place;
    try{
        //populate is used to access the user data to remove the place from it
        place = await Place.findById(placeId).populate('creator');
    }catch(err){
        const error = new HttpError('Something went wrong, Could not delete the place', 500)
        return next(error);
    }

    if(!place){
        const error = new HttpError('Could not find place for this id', 404);
        return next(error);
    }

    //Only authorized user can delete the place.
    if(place.creator.id !== req.userData.userId){
        const error = new HttpError('You are not eligible to delete this place. This place is registered by other user.', 401)
        return next(error);
    }

    const imagePath = place.image;

    try{
        //Create a session for the transaction
        //Transaction is a way to apply one execution to multiple database
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session: sess});
        //Delete the place from the user
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
    }catch(err){
        const error = new HttpError('Something went wrong, Could not update the place', 500)
        return next(error);
    }

    fs.unlink(imagePath, err => {
        console.log(err);
    })

    await res.status(200).json({message: 'Deleted place'})
}

exports.getPlacesById = getPlacesById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;