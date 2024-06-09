import passport from "passport";


const authOrNot = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        
        if (err || !user) {
            req.user = null
            return next()
        }

        req.user = user
        return next()
    })(req, res, next)
}

export default authOrNot;