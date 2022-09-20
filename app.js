const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes')
const app = express();
const PORT = 5000;

app.use('/api/places' ,placesRoutes);
app.use('/api/users', usersRoutes);
//error handling
app.use((error, req, res, next) =>{
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred'})
})


app.listen(PORT, () => console.log('Server is running'))