const QUESTION_HISTORY_STATUS = require('../constant/questionHistoryConstant');

class QuestionHistoryService {
    constructor(knex) {
        this.knex = knex;
    }

    getHistory(userId) {
        return this.knex
            .select([
                'questions.question_id',
                'questions.text as question_text',
                'options.option_id',
                'options.text as option_text',
                'options.implication',
            ])
            .from('user_question_history')
            .join('questions', 'user_question_history.question_id', 'questions.question_id')
            .join('options', 'user_question_history.option_id', 'options.option_id')
            .where('questions.expired', false)
            .andWhere('options.expired', false)
            .then((history) => {
                if (typeof history === 'undefined' || history.length <= 0) {
                    throw new Error(QUESTION_HISTORY_STATUS.GET_HISTORY_FAIL);
                };
                return {
                    status: QUESTION_HISTORY_STATUS.GET_HISTORY_SUCCESSFUL,
                    userId: userId,
                    history: history
                };
            })
            .catch((err) => {
                console.log(err);
                throw new Error(QUESTION_HISTORY_STATUS.SERVER_ERROR)
            });
    }

    async postHistory(userId, reqBody) {
        try {
            let relation = {
                user_id: Number(userId),
                question_id: reqBody.questionId,
                option_id: reqBody.optionId
            };
            let history = await this.knex('user_question_history')
                .first('question_id', 'user_id', 'option_id')
                .where({ user_id: userId, question_id: relation.question_id });

            if (typeof history === 'undefined') {
                return await this.insertHistory(relation);
            } else if (history.option_id === relation.option_id) {
                return { status: QUESTION_HISTORY_STATUS.POST_HISTORY_SUCCESSFUL };
            };

            return await this.updateHistory(relation);
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

    updateHistory(relation) {
        return this.knex('user_question_history')
            .first('user_id', 'question_id', 'option_id')
            .where({ user_id: relation.user_id, question_id: relation.question_id })
            .update({ option_id: relation.option_id })
            .then(() => ({ status: QUESTION_HISTORY_STATUS.POST_HISTORY_SUCCESSFUL }))
            .catch((err) => {
                console.log(err);
                throw new Error(QUESTION_HISTORY_STATUS.POST_HISTORY_FAIL);
            });
    }

    delHistory(userId) {
        return this.knex('user_question_history').where('user_id', userId).del()
            .then(() => ({ status: QUESTION_HISTORY_STATUS.DELETE_HISTORY_SUCCESSFUL }))
            .catch((err) => {
                console.log(err);
                throw new Error(QUESTION_HISTORY_STATUS.DELETE_HISTORY_FAIL);
            });
    }
}

module.exports = QuestionHistoryService;