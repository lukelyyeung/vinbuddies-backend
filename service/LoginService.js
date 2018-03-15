const axios = require('axios');
const jst = require('jwt-simple');
const users = require('../utils/fakeUser');
const { SIGNUP_STATUS, LOGIN_STATUS } = require('../constant/authConstant')
require('../utils/init-passport')();

class LoginService {
    constructor(knex) {
        this.knex = knex;
    }

    async localSignup(reqBody) {

        try {

            let user = await this.findUser({
                email: reqBody.email,
                provider: 'local'
            });

            if (user.id < 0) {
                let status = await this.createUser({
                    name: reqBody.name,
                    email: reqBody.email,
                    password: reqBody.password,
                    provider: 'local'
                });

                return (status >= 0) ? SIGNUP_STATUS.SUCCESSFUL : SIGNUP_STATUS.UNKNOWN;

            } else {
                throw new Error(SIGNUP_STATUS.USER_EXIST);
            }
            
        } catch (err) {
            console.log(err);
            throw new Error(SIGNUP_STATUS.UNKNOWN);
        }
    }

    async localLogin(reqBody) {
        
        try {

            let user = await this.findUser({
                email: reqBody.email,
                password: reqBody.password,
                provider: 'local'
            });

            if (user.id >= 0) {
                let payload = {
                    id: user.id,
                };
                return this.jwtEncode(payload);
            }

            throw new Error(LOGIN_STATUS.NOUSER);

        } catch (err) {
            console.log(err);
            throw new Error(LOGIN_STATUS.UNKNOWN);
        }
    }


    async facebookLogin(reqBody) {
        if (reqBody.access_token) {
            let access_token = reqBody.access_token;

            try {

                let data = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}`)
                if (!data.data.error) {
                    let user = await this.findUser({
                        socialId: data.data.id,
                        provider: 'facebook'
                    });

                    if (user.id < 0) {
                        let status = this.createUser({
                            socialId: data.data.id,
                            name: data.data.name,
                            provider: 'facebook',
                        });

                        return (status >= 0) ? this.jwtEncode({ id: access_token }) : LOGIN_STATUS.UNKNOWN;
                    }

                    return this.jwtEncode({ id: access_token });

                } else {
                    throw new Error(LOGIN_STATUS.NOACCESSTOEKN);
                }
            } catch (err) {
                console.log(err);
                throw new Error(LOGIN_STATUS.UNKNOWN);
            }
        } else {
            throw new Error(LOGIN_STATUS.NOACCESSTOKEN);
        }
    }

    jwtEncode(payload) {
        let token = jwt.encode(payload, config.jwtSecret);
        return { token: token };
    }

    findUser(user) {
        return this.knex.select('users').first(user)
            .catch(() => { id = -1 });
    }

    createUser(user) {
        return this.knex.select('users').insert(user).returning('id')
            .catch(() => -1);
    }
}

module.exports = LoginService; 