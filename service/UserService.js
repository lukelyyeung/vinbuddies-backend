const USER_STATUS = require('../constant/userConstant');
const GENERAL_STATUS = require('../constant/generalConstant');
const hashPassword = require('../utils/bcrypt').hashPassword;
const guard = require('../utils/guard/guard');
const { userScope, adminScope } = require('./scope/userScope');

class UserService {
    constructor(knex) {
        this.knex = knex;
    }

    async getUser(req) {
        let { params: { userId } } = req;
        try {
            let userInfo = await this.knex('users').where({ id: userId })
                .modify(queryBuilder => {
                    if (guard.isAdmin(req)) {
                        queryBuilder.first(adminScope);
                    } else {
                        queryBuilder.first(userScope);
                    }
                });
            if (typeof userInfo === 'undefined') {
                throw new Error(USER_STATUS.NO_USER);
            };
            return userInfo;

        } catch (err) {
            if (err.msg = USER_STATUS.NO_USER) {
                throw new Error(USER_STATUS.NO_USER);
            };
            console.log(err);
            throw new Error(GENERAL_STATUS.DATABASE_ERROR);
        };
    }

    async searchUser(req, queryArray) {
        let [name, orderBy, includeDeleted, limit, offset] = queryArray;
        return await this.knex('users')
            .whereRaw(`LOWER(username) LIKE ?`, [`%${name = name || ''}%`])
            .modify(queryBuilder => {
                if(!includeDeleted) {
                    queryBuilder.andWhere('deleted', false);
                }
            })
            .limit(limit = limit || 10)
            .offset(offset = offset || 0)
            .modify(queryBuilder => {
                if (guard.isAdmin(req)) {
                    queryBuilder.select(adminScope);
                } else {
                    queryBuilder.select(userScope);
                }
            })
            .orderBy(orderBy || 'username');
    }

    async createUser(req) {
        const isAdmin = guard.isAdmin(req);
        if (!isAdmin) {
            throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
        }

        let { body } = req;
        const userInfo = await this.tidyUpUserProfile(body, isAdmin);
        try {

            let user = await this.knex('users').first('id')
                .where({ username: userInfo.username || '' })
                .orWhere({ email: userInfo.email || '' })
                .orWhere({ social_id: userInfo.social_id || '' });
            if (typeof user === 'undefined') {
                let userId = await this.knex('users').insert(userInfo).returning('id');
                return {
                    status: USER_STATUS.CREATE_SUCCESSFUL,
                    userId: userId[0]
                };
            }
            //* thorw error if the insertion violate the unique composite key *
            throw new Error(USER_STATUS.USER_EXIST);

        } catch (err) {
            if (err.message === USER_STATUS.USER_EXIST) {
                throw new Error(err.message);
            }
            console.log(err);
            throw new Error(GENERAL_STATUS.SERVER_ERROR);
        }
    }

    async updateUser(req) {
        let { user, body, params } = req;
        let isAdmin = guard.isAdmin(req);
        if (!isAdmin && user.id !== params.userId) {
            throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
        }
        try {

            const userInfo = await this.tidyUpUserProfile(body, isAdmin);
            let result = await this.knex('users').first('*').where({ id: params.userId }).update(userInfo);
            return (result <= 0) ? { status: USER_STATUS.NO_ENTITY } :
                { status: USER_STATUS.UPDATE_SUCCESSFUL };

        } catch (err) {
            console.log(err);
            //* thorw error if the update violate the below: 
            // 1. unique username, email, provider composite key 
            // 2. unqiue social_id, provider composite key*
            throw new Error(USER_STATUS.INFO_USED);
        }
    }

    async deleteUser(req) {
        let { params } = req;
        let isAdmin = guard.isAdmin(req);
        if (!isAdmin && user.id !== params.userId) {
            throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
        }
        let result = await this.knex('users').first('*').where({ id: params.userId }).update({ deleted: true });
        return (result <= 0) ? { status: USER_STATUS.NO_ENTITY } :
            { status: USER_STATUS.DELETE_SUCCESSFUL };
    }

    async tidyUpUserProfile(body, isAdmin) {
        let saltedPassword = await hashPassword(body.password);
        let scope = isAdmin ? adminScope : userScope;
        return Object.keys(body).reduce((cumulator, property) => {
            if (scope.some(e => e === property) && /\S/.test(body[property]) && typeof body[property] !== 'undefined') {
                cumulator[property] = body[property];
            } else if (property = 'password') {
                cumulator[property] = saltedPassword;
            }
            return cumulator;
        }, {});
    }
}

module.exports = UserService;