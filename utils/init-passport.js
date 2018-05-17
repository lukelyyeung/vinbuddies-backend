const passport = require('passport');
const passportJWT = require('passport-jwt');
const config = require('./config');
const GENERAL_STATUS = require('../constant/generalConstant');
const ExtractJwt = passportJWT.ExtractJwt;

module.exports = (loginService) => {
    try {
        const strategy = new passportJWT.Strategy({
            secretOrKey: config.publicKey,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        }, async (payload, done) => {
            let user = await loginService.findUser(payload);
            if (user.id > 0) {
                return done(null, {
                    id: user.id,
                    role: user.role,
                    firstLogin: user.first_login
                });
            } else {
                return done(new Error(GENERAL_STATUS.NOT_AUTHORIZED), null);
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
    } catch (err) {
        console.log(err);
    }
}