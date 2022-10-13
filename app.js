const fs = require('fs');
const path = require('path')

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const app = express();
const PORT = process.env.PORT || 5000;
const mongooseUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.3juubee.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

app.use(bodyParser.json());
//static is used to pass the static file such as image, css to JavaScript file
app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use((req, res, next) =>{
    //set the information to response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    next();
})

app.use('/api/places' ,placesRoutes);
app.use('/api/users', usersRoutes);
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});
//error handling
app.use((error, req, res, next) =>{
    //Use file property of multer to delete a photo
    //if a user already exists, photo is not saved.
    if(req.file){
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        })
    }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred'})
})

mongoose
    .connect(mongooseUrl)
    .then(() =>{
        console.log('Mongo is connected')
    })
    .then(() =>{
        app.listen(PORT, () =>{
            console.log(`Server is running on ${PORT}`)
        });
    })
    .catch(err => console.log('error message', err.message));