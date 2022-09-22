const axios = require('axios');
const HttpError = require('../models/http-error');
const API_KEY = process.env.API_KEY
console.log(API_KEY)

async function getCoordForAddress(address){
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);

    const data = response.data;

    if(!data || data.status === 'ZERO_RESULT'){
        const error =  new HttpError('Could not find location', 422);
        throw error;
    }

    console.log(data)
    const coordinates = data.results[0].geometry.location;

    return coordinates;
}

module.exports = getCoordForAddress;