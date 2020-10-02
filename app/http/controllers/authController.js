const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')

function authController(){

    function _getredirectUrl(req){
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
    }

    return {
        login(req, res){
            res.render('auth/login')
        },
        postLogin(req, res, next){
            passport.authenticate('local', (err, user, info) => {
                //it is done function
                if(err){
                    req.flash('error', info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err)=>{
                    if(err){
                        req.flash('error', info.message)
                        return next(err)
                    }
                    return res.redirect(_getredirectUrl(req))    
                })

            })(req, res, next)
        },
        register(req, res){
            res.render('auth/register')
        },
        async postRegister(req, res){
            const { name, email, password } = req.body  //url-encoded data
            if(!name || !email || !password){

                // Flash is valid for only single request an will disappear when a newrequest is made
                req.flash('error', 'All fields are required')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }

            // Check if email exists or not
            User.exists({ email }, (err, result) => {
                if(result){
                    req.flash('error', 'Email already taken')
                    req.flash('name', name)
                    req.flash('email', email)
                    return res.redirect('/register')
                }
            })

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10)

            // Create a user
            const user = new User({
                name, 
                email,
                password: hashedPassword,
            })

            user.save().then(user => {

                //login

                return res.redirect('/')
            }).catch(err => {
                req.flash('error', 'Something went wrong')
                return res.redirect('/register')
            })
        },
        logout(req, res){
            req.logout()
            return res.redirect('/login')
        }
        
    }
}

module.exports = authController