const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        req.flash("error_messages", "You need to sign in to access this page");
        res.redirect('/');
    }
}

//check for shop owner
//when user_type equal A

//check for manager
//when user_type equals M

//check for user
//when user_type equal U
// const userAuthentication = (req, res, nex) => {
//     if(req.session.user.user_type)
// }

module.exports = {
    checkIfAuthenticated
}