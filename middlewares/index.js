const jwt = require('jsonwebtoken');


//for shop keeper only
const checkIfAuthenticated = (req, res, next) => {
    let access = req.session.user.user_type;
    if (access === "A") {
        next()
    } else {
        req.flash("error_messages", "You need to sign in as shop owner to access this page");
        res.redirect('/profile');
    }
}

const checkIfManagerOwnerAuthenticated = (req, res, next) => {
    let access = req.session.user.user_type;
    if (access === "M" || access === "A") {
        next()
    } else {
        req.flash("error_messages", "You need to sign in as shop manager or owner to access the page");
        res.redirect('/profile');
    }
}

// for normal users only
const checkIfUserOwnerAuthenticated = (req, res, next) => {
    let access = req.session.user.user_type;
    if (access === "U" || access === "A") {
        next()
    } else {
        req.flash("error_messages", "You need to sign in as normal user or owner to access the page");
        res.redirect('/profile');
    }
}

// for all access
const checkIfAllAuthenticated = (req, res, next) => {

    if (req.session.user.user_type) {
        next()
    } else {
        req.flash("error_messages", "You need to sign in as normal user or owner or manager to access the page");
        res.redirect('/profile');
    }
}

const checkIfAuthenticatedJWT = (req, res, next) => {
    let authHeader = req.headers.authorization;
    const body = req.body
    console.log("Enter Authericated JWT");
    console.log(authHeader);
    console.log(body)
    
    try {
        if (authHeader) {
            console.log("Enter authHeader");
            const token = authHeader.split(' ')[1];

            jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                req.user = user;
                next();
            });
        } else {
            console.log("Eneter else case of autherHeader");
            res.sendStatus(401);
        }
    } catch (e) {
        res.status(403);
        res.json({
            'message': "JWT error"
        })
        console.log(e);
    }

};



module.exports = {
    checkIfAuthenticated,
    checkIfUserOwnerAuthenticated,
    checkIfManagerOwnerAuthenticated,
    checkIfAllAuthenticated,
    checkIfAuthenticatedJWT
}