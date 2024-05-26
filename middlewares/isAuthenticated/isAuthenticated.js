import passport from "passport";

const isAuthenticated = (req, res, next) => {
   passport.authenticate('jwt', {session: false}, (err, user, info) => {
    
    if (err || !user) {
        res.status(401).json({
            message: info ? info?.message : 'Please login, as authentication token is required for your request.',
            error: err ? err?.message : undefined,
        })
    }
    // store user in req object if found
    req.user = user?._id
    
    //run the next middleware
    return next()
   })(req, res, next) 
}

export default isAuthenticated;