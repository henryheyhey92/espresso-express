const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { checkIfAuthenticatedJWT } = require('../../middlewares');
const { User, BlacklistedToken } = require('../../models');


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
        console.log("login in works")
        let accessToken = generateAccessToken(user.toJSON(), process.env.TOKEN_SECRET, '15m');
        let refreshToken = generateAccessToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, '7d');
        let userId = user.get('id');
        res.json({
            accessToken, refreshToken, userId
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
//this part need in the front end need set a timer that uses axios 
router.post('/refresh', async(req,res)=>{
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    }

    // check if the refresh token has been black listed
    let blacklistedToken = await BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        require: false
    })


    // if the refresh token has already been blacklisted
    if (blacklistedToken) { 
        res.status(401);
        return res.send('The refresh token has already expired')
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

router.post('/logout', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    } else {
            console.log("enter logout")
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,async (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            const token = new BlacklistedToken();
            token.set('token', refreshToken);
            token.set('date_created', new Date()); // use current date
            await token.save();
            res.send({
                'message': 'logged out'
            })
        })

    }

})


module.exports = router;