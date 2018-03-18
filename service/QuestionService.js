const QUESTION_STATUS = require('../constant/questionConstant');

class QuestionService {
    constructor(knex) {
        this.knex = knex;
    }

    async createQuestion(reqBody) {
        let question = reqBody.question;
        let options = reqBody.options;

        try {

            await this.knex.transaction(async (trx) => {

                let questionId = await this.knex('questions')
                    .transacting(trx)
                    .insert(question)
                    .returning('question_id');

                if (typeof questionId === 'undefined' || questionId[0] <= 0) {
                    trx.rollBack();
                    throw new Error(QUESTION_STATUS.SERVER_ERROR);
                };

                let chunkSize = options.length;
                let ids = await this.knex.batchInsert('options', options, chunkSize)
                    .transacting(trx)
                    .returning('option_id');

                let relations = ids.map(id => ({ question_id: questionId[0], option_id: id }));

                await this.knex.batchInsert('question_options', relations, chunkSize)
                    .transacting(trx)
                    .then(trx.commit);
            });

        } catch (err) {
            console.log(err);
            throw new Error(QUESTION_STATUS.SERVER_ERROR);
        }

        return QUESTION_STATUS.CREATE_QUESTION_SUCCESSFUL;
    }

    async getQuestion(questionId) { }

    async getAllQuestion() { }

    async updateQuestion(questionId, reqBody) {

        let question = {
            text: reqBody.text,
            expired: reqBody.expired
        };

        return this.knex('question')
            .update(this.tidyUp(question))
            .then(() => QUESTION_STATUS.UPDATE_QUESTION_SUCCESSFUL)
            .catch((err) => {
                console.log(err);
                throw new Error(QUESTION_STATUS.SERVER_ERROR);
            });
    }

    async tidyUp(item) {

        let cleanObject = {};
        for (let prop in item) {
            if (item[prop] !== '' && typeof item[prop] !== 'undefined') {
                cleanObject[prop] = item[prop];
            }
        };
        return cleanObject;
    }
}

module.exports = QuestionService;