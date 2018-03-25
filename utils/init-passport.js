const passport = require('passport');
const passportJWT = require('passport-jwt');
const config = require ('./config');
const AUTH_STATUS = require('../constant/authConstant');
const ExtractJwt = passportJWT.ExtractJwt;

module.exports = (loginService) => {
    const strategy = new passportJWT.Strategy({
        secretOrKey: config.jwtSecret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }, async (payload, done) => {
        let user = await loginService.findUser(payload);

        if (user > 0) {
            return done(null, {id: user.id});
        } else {
            return done(new Error(AUTH_STATUS.LOGIN_NO_USER), null);
        }
    });
    
    passport.use(strategy);

    return {
        initialize: function () {
            return passport.initialize();
        },
        authenticate: function () {
            return passport.authenticate("jwt", config.jwtSession);
        }
    };
}