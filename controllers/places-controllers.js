const uuid = require('uuid')
const HttpError = require('../models/http-error')

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous places in the world',
        location:{
            lat: 40.7484405,
            lng: -73.9878531
        },
        address: '20 W 34th St., New York, NY 10001, United States',
        creator: 'u1'
    }
]

const getPlacesById = (req, res, next) =>{
    const placeId = req.params.pid;
    const places = DUMMY_PLACES.filter((place) => place.id === placeId);

    if(!places || places.length === 0){
        return next(
            new HttpError('Could not find a place for the provided id', 404)
        );
      }

    res.json({places});
}

const getPlaceByUserId = (req, res, next) =>{
    const userId = req.params.uid;
    const place = DUMMY_PLACES.find(place => {
        return place.creator === userId
    })

    if(!place){
        throw new HttpError('Could not find a place for the provided user id', 404)
    }

    res.json({place})
}
const createPlace = (req, res, next) => {
    const { title, description, coordinates, address, creator } = req.body;
    const createdPlace = {
        id: uuid.v4(),
        title,
        description,
        location : coordinates,
        address,
        creator
    }

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({place: createdPlace});
}

const updatePlace = (req, res, next) =>{
    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatedPlace = { ...DUMMY_PLACES.find(place => place.id === placeId)};
    const placeIndex = DUMMY_PLACES.findIndex(place => place.id === placeId);
    updatePlace.title= title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatePlace;
    res.status(200).json({place: updatePlace})
    
}

const deletePlace = (req, res, next) =>{
    const placeId = req.params.pid;
    DUMMY_PLACES = DUMMY_PLACES.filter(place => place !== placeId)

    res.status(200).json({message: 'Deleted place'})
}

exports.getPlacesById = getPlacesById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;