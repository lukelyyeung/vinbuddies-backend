const USER_STATUS = require('../constant/userConstant');
const hashPassword = require('../utils/bcrypt').hashPassword;

class UserService {
    constructor(knex) {
        this.knex = knex;
    }

    async getUser(userId) {
        try {

            let userInfo = await this.knex('users').first('*').where({ id: userId });
            if (typeof userInfo === 'undefined') {
                throw new Error(USER_STATUS.NO_USER);
            };
            return userInfo;

        } catch (err) {
            if (err.msg = USER_STATUS.NO_USER) {
                throw new Error(USER_STATUS.NO_USER);
            };
            console.log(err);
            throw new Error(USER_STATUS.SERVER_ERROR);
        };
    }

    async getAllUser() {
        let user = await this.knex('users').select('*')
        if (user.length <= 0) {
            throw new Error(USER_STATUS.NO_USER);
        };

        return user;
    }

    async createUser(reqBody) {
        const userInfo = await this.tidyUpUserProfile(reqBody);
        try {

            let userId = await this.knex('users').insert(userInfo).returning('id')
            return {
                userId: userId[0],
                status: USER_STATUS.CREATE_SUCCESSFUL
            };

        } catch (err) {
            //* thorw error if the insertion violate the unique composite key *
            if (err.code === '23505') {
                throw new Error(USER_STATUS.USER_EXIST);
            }
            console.log(err);
            throw new Error(USER_STATUS.SERVER_ERROR);
        }
    }

    async updateUser(userId, reqBody) {
        try {

            const userInfo = await this.tidyUpUserProfile(reqBody);
            await this.knex('users').first({ id: userId }).update(userInfo)
            return { status: USER_STATUS.UPDATE_SUCCESSFUL };

        } catch (err) {
            console.log(err);
            throw new Error(USER_STATUS.SERVER_ERROR);
        }
    }

    async deleteUser(userId) {
        try {

            await this.knex('users').where({ id: userId }).del();
            return { status: USER_STATUS.DELETE_SUCCESSFUL };

        } catch (err) {
            console.log(err);
            throw new Error(USER_STATUS.SERVER_ERROR);
        }
    }

    async tidyUpUserProfile(reqBody) {
        let saltedPassword = await hashPassword(reqBody.password);
        let userInfo = {
            name: reqBody.name,
            email: reqBody.email,
            password: saltedPassword,
            provider: reqBody.provider,
            social_id: reqBody.socialId,
            first_login: reqBody.firstLogin,
            role: reqBody.role
        };

        let user = {};
        for (let prop in userInfo) {
            if (userInfo[prop] !== '' && typeof userInfo[prop] !== 'undefined') {
                user[prop] = userInfo[prop];
            }
        };
        return user;
    }
}

module.exports = UserService;