const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const UserServices = require('../services/user_services');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const { User } = require('../models');
const { createUserForm, createLoginForm, bootstrapField } = require('../forms');

async function getUserById(userId) {
    const user = await User.where({
        'id': userId
    }).fetch({
        'require': true
    })
    return user;
}

router.get('/all', async (req, res) => {
    try {
        let users = await User.collection().fetch();
        res.render('users/index', {
            'users': users.toJSON()
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.get('/register', async (req, res) => {
    // display the registration form
    const registerForm = createUserForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', async (req, res) => {
    const registerForm = createUserForm();
    registerForm.handle(req, {
        'success': async (form) => {
            const user = new User({
                'first_name': form.data.first_name,
                'last_name': form.data.last_name,
                'address': form.data.address,
                'country': form.data.country,
                'email': form.data.email,
                'phone': form.data.phone,
                'password': getHashedPassword(form.data.password),
                'confirm_password': form.data.confirm_password,
                'user_type': form.data.user_type
            });
            await user.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/');
            // res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:id/update', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);

        const form = createUserForm();

        form.fields.first_name.value = user.get('first_name');
        form.fields.last_name.value = user.get('last_name');
        form.fields.address.value = user.get('address');
        form.fields.country.value = user.get('country');
        form.fields.email.value = user.get('email');
        form.fields.phone.value = user.get('phone');
        form.fields.password.value = getHashedPassword(user.get('password'));
        form.fields.confirm_password.value = user.get('confirm_password');
        form.fields.user_type.value = user.get('user_type');

        res.render('users/update', {
            'form': form.toHTML(bootstrapField),
            'users': user.toJSON()
        })

    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})


router.post('/:id/update', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        const form = createUserForm();

        form.handle(req, {
            'success': async (form) => {
                user.set(form.data);
                user.save();
                res.redirect('/users');
            },
            'error': async (form) => {
                res.render('users/update', {
                    'form': form.toHTML(bootstrapField),
                    'users': user.toJSON()
                })
            }
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.get('/:id/delete', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);

        res.render('users/delete', {
            'users': user.toJSON()
        })
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})

router.post('/:id/delete', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        await user.destroy();
        res.redirect('/users');
    } catch (e) {
        res.status(500);
        res.json({
            'message': "Internal server error. Please contact administrator"
        })
        console.log(e);
    }
})



router.get('/', (req, res) => {
    const loginForm = createLoginForm();
    res.render('users/login.hbs', {
        'form': loginForm.toHTML(bootstrapField)
    })
})


router.post('/', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // process the login

            // ...find the user by email and password
            console.log("Hello hahahaha")
            let findUser = new UserServices();
            let user = await findUser.getUserByEmail(form.data.email);
            console.log(user);
            // let user = await User.where({
            //     'email': form.data.email
            // }).fetch({
            //     require: false
            // }
            // );
            console.log(user);

            if (!user) {
                req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                res.redirect('/');
            } else {
                // check if the password matches
                if (user.get('password') === getHashedPassword(form.data.password)) {
                    // add to the session that login succeed

                    // store the user details
                    req.session.user = {
                        id: user.get('id'),
                        first_name: user.get('first_name'),
                        last_name: user.get('last_name'),
                        email: user.get('email')
                    }
                    req.flash("success_messages", "Welcome back, " + user.get('first_name') + user.get('last_name'));
                    res.redirect('/profile');
                } else {
                    req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                    res.redirect('/')
                }
            }
        }, 'error': (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please fill in the form again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/profile', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', "Please login to see the page");
        res.redirect('/');
    } else {
        let user = await User.where({
            'id': req.session.user.id
        }).fetch({
            'required': true
        })

        res.render('users/profile', {
            'user': user.toJSON()
        })
    }

})

router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "Goodbye");
    res.redirect('/');
})

module.exports = router;