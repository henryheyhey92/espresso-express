const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');

// setup cloudinary
cloudinary.config({
    'api_key': process.env.CLOUDINARY_API_KEY,
    'api_secret': process.env.CLOUDINARY_API_SECRET
});

router.get('/sign', async (req,res)=>{
    // retrieve the params to sign
    // Why use JSON.parse?
    // because req.query.params_to_string is a JSON formatted string
    // so we use JSON.parse to convert from JSON string to JSON object
    const paramsToSign = JSON.parse(req.query.params_to_sign);

    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // get the signature from cloudinary
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    res.send(signature);
})

module.exports = router;