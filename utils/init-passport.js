import * as passport from 'passport'
import * as passportJWT from 'passport-jwt';
import config from './config';
import users from './fakeUser';
const ExtractJwt = passportJWT.ExtractJwt;

export default function () {
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