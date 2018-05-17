const QUESTION_HISTORY_STATUS = require('../constant/questionHistoryConstant');
const GENERAL_STATUS = require('../constant/generalConstant');
const gaurd = require('../utils/guard/guard');
const objectWithoutKey = require('../utils/objectWithoutKey');
const axios = require('axios');

class QuestionHistoryService {
    constructor(knex) {
        this.knex = knex;
    }
    //* By default, the getHistory only return the active question history, by pass true as 2nd parameter, expired question and option will be included. 
    async getHistory(req, queryArray) {
        let [includeExpired, limit, offset] = queryArray;
        limit = limit || 10;
        offset = offset || 0;
        let { params: { userId: queryId }, user } = req;
        if (!gaurd.isAdmin(req) && Number(queryId) !== user.id) {
            throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
        }
        try {
            let history = await this.knex.select('q.question_id', 'q.text',
                this.knex.raw(`array_agg(json_build_object(
                    'option_id',  opt.option_id,
                    'text',  opt.text,
                    'expired',  opt.expired,
                    'implication', opt.implication,
                    'deleted', ush.deleted,
                    'created_at', ush.created_at,
                    'updated_at', ush.updated_at
                )) as choices`
                ))
                .from('user_question_history as ush')
                .join('questions as q', 'ush.question_id', 'q.question_id')
                .join('options as opt', 'ush.option_id', 'opt.option_id')
                .where('ush.user_id', queryId)
                .groupBy(['q.question_id', 'q.text'])
                .limit(limit || 10)
                .offset(offset || 0);

            if (typeof history === 'undefined' || history.length < 0) {
                throw new Error(QUESTION_HISTORY_STATUS.GET_HISTORY_FAIL);
            };

            return {
                status: QUESTION_HISTORY_STATUS.GET_HISTORY_SUCCESSFUL,
                userId: queryId,
                history: history
            };
        } catch (err) {

            if (err.message === QUESTION_HISTORY_STATUS.GET_HISTORY_FAIL) {
                throw new Error(err.message);
            }
            console.log(err);
            throw new Error(GENERAL_STATUS.DATABASE_ERROR)
        }
    }

    async postHistory(req) {
        let { params: { userId }, body: { questionId, optionId } } = req;
        let relation = {
            user_id: userId,
            question_id: questionId,
            option_id: optionId
        };
        
        try {
            if (!gaurd.isAdmin(req) && Number(queryId) !== user.id) {
                throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
            }
    
            let userInfo = await this.getUserInfo(userId);
            let message = await this.postToElasticSearch(userInfo, questionId, optionId);

            let history = await this.knex('user_question_history')
                .first('question_id', 'user_id', 'option_id')
                .where({ user_id: userId, question_id: questionId });

            let optionValidity = await this.knex('question_options')
                .first('question_id', 'option_id')
                .where({ question_id: questionId, option_id: optionId });

            if (!optionValidity) {
                throw new Error(QUESTION_HISTORY_STATUS.INVALID_OPTION);
            }
            if (typeof history === 'undefined') {
                return await this.insertHistory(relation);
            } else if (history.option_id !== optionId) {
                await this.updateHistory(relation);
            }
            return {
                status: QUESTION_HISTORY_STATUS.POST_HISTORY_SUCCESSFUL,
                message: message
            }
        } catch (err) {
            throw new Error(err.message);
        }
    }

    insertHistory(relation) {
        return this.knex('user_question_history')
            .insert(relation)
            .then(() => ({ status: QUESTION_HISTORY_STATUS.POST_HISTORY_SUCCESSFUL }))
            .catch((err) => {
                console.log(err);
                throw new Error(QUESTION_HISTORY_STATUS.POST_HISTORY_FAIL);
            });
    }

    async updateHistory(relation) {
        await this.knex('user_question_history')
            .first('user_id', 'question_id', 'option_id')
            .where({ user_id: relation.user_id, question_id: relation.question_id })
            .update({ deleted: true })

        await this.insertHistory(relation);
    }

    delHistory(req) {
        let { params: { userId } } = req;
        return this.knex('user_question_history').where('user_id', userId).update({ deleted: true })
            .then(() => ({ status: QUESTION_HISTORY_STATUS.DELETE_HISTORY_SUCCESSFUL }))
            .catch((err) => {
                console.log(err);
                throw new Error(QUESTION_HISTORY_STATUS.DELETE_HISTORY_FAIL);
            });
    }

    async getOptionMeta() {
        let optionMeta = await this.knex.select(['option_metadata.option_id', 'option_metadata.metadata_id', 'metadata.tag'])
            .from('option_metadata')
            .join('metadata', 'metadata.metadata_id', 'option_metadata.metadata_id')

        return optionMeta.reduce((sorted, current) => {
            sorted[current.option_id] = sorted[current.option_id] || { metadata: [] };
            sorted[current.option_id].metadata.push(objectWithoutKey(current, 'option_id')[0]);
            return sorted;
        }, {});
    }

    getUserInfo(userId) {
        return this.knex('users').first('*').where('id', userId);
    }

    postToElasticSearch(userInfo, questionId, optionId) {
        return axios.post(
            'http://localhost:4200/elastic',
            {
                questionId: questionId,
                optionId: optionId,
                user: userInfo
            })
            .then(response => response.data)
            .catch(response => {
                console.log(response.error);
            });
    }
}

module.exports = QuestionHistoryService;