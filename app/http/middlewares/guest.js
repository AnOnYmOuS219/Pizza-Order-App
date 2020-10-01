function guest(req, res, next){

    // passport method
    if(!req.isAuthenticated()){
        return next()
    }   
    return res.redirect('/')
}

module.exports = guest