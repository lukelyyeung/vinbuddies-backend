const passport = require('passport');
const passportJWT = require('passport-jwt');
const config = require ('./config');
const ExtractJwt = passportJWT.ExtractJwt;

module.exports = () => {
    const strategy = new passportJWT.Strategy({
        secretOrKey: config.jwtSecret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }, (payload, done) => done(null, { id: user.id }));

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