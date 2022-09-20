const express = require('express');

const router = express.Router();

router.get('/:uid', (req, res, next) =>{
    const userId = req.params.uid;
    res.json({user})
})

module.exports = router;