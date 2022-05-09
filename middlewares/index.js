
//for shop keeper only
const checkIfAuthenticated = (req, res, next) => {
    let access = req.session.user.user_type;
    if (access === "A") {
        next()
    } else {
        req.flash("error_messages", "You need to sign in to access this page");
        res.redirect('/profile');
    }
}

const checkIfManagerOwnerAuthenticated = (req, res, next) => {
    let access = req.session.user.user_type;
    if(access === "M" || access === "A"){
        next()
    } else {
        req.flash("error_messages", "You need to sign in as shop manager or owner to access the page");
        res.redirect('/profile');
    }
}

// for normal users only
const checkIfUserOwnerAuthenticated = (req, res, next) => {
    let access = req.session.user.user_type;
    if(access === "U" || access === "A"){
        next()
    } else {
        req.flash("error_messages", "You need to sign in as normal user or owner to access the page");
        res.redirect('/profile');
    }
}

// for all access
const checkIfAllAuthenticated = (req, res, next) => {
   
    if(req.session.user.user_type){
        next()
    } else {
        req.flash("error_messages", "You need to sign in as normal user or owner or manager to access the page");
        res.redirect('/profile');
    }
}


module.exports = {
    checkIfAuthenticated, checkIfUserOwnerAuthenticated, checkIfManagerOwnerAuthenticated, checkIfAllAuthenticated
}