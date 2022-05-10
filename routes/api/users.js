const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {checkIfAuthenticatedJWT} = require('../../middlewares');
const { User } = require('../../models');


const generateAccessToken = (user) => {
    //three arguments
    return jwt.sign({
        'first_name': user.get('first_name'),
        'last_name': user.get('last_name'),
        'id': user.get('id'),
        'email': user.get('email'),
        'user_type': user.get('user_type')
    }, process.env.TOKEN_SECRET, {
        expiresIn: "1h"
    });
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}


router.post('/login', async (req, res) => {
    console.log(req.body.email);
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        require: false
    });
    //there's no session in the api
    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        let accessToken = generateAccessToken(user);
        res.send({
            'accessToken': accessToken
        })
    } else {
        res.send({
            'error':'Wrong email or password'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async(req,res)=>{
    console.log("Enter profile")
    const user = req.user;
    res.send(user);
})

module.exports = router;