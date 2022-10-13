//multer
//middle ware for express to store the file such as image

const multer = require('multer');
const { v1: uuidV1 } = require("uuid");
const MIME_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg'
}

const fileUpload = multer({
    limits: 500000, //500kb
    storage: multer.diskStorage({
        //where to store the file
        destination: (req, file, cb) =>{
            cb(null, 'uploads/images')
        },
        filename: (req, file, cb) =>{
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, uuidV1() + '.' + ext)
        }
    }),
    fileFilter: (req, file, cb) =>{
        //Check if we have certain type of file type. If not, it returns 'undefined'
        // !!: Used to convert 'undefined', 'false'
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        console.log('isValid', isValid)
        let error = isValid ? null : new Error('Invalid mine type');
        cb(error, isValid);
    }
})

module.exports = fileUpload;