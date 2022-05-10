const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { checkIfAuthenticatedJWT } = require('../../middlewares');
const { User } = require('../../models');


const generateAccessToken = (user, secret, expiresIn) => {
    //three arguments
    return jwt.sign({
        'first_name': user.first_name,
        'last_name': user.last_name,
        'id': user.id,
        'email': user.email,
        'user_type': user.user_type
    }, secret, {
        'expiresIn': expiresIn
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

        let accessToken = generateAccessToken(user.toJSON(), process.env.TOKEN_SECRET, '15m');
        let refreshToken = generateAccessToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, '7d');
        res.send({
            accessToken, refreshToken
        })
    } else {
        res.send({
            'error': 'Wrong email or password'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    console.log("Enter profile")
    const user = req.user;
    res.send(user);
})

//allow the client to get a new access token 
router.post('/refresh', async(req,res)=>{
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if (err) {
            return res.sendStatus(403);
        }

        let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, '15m');
        res.send({
            accessToken
        });
    })
})

module.exports = router;