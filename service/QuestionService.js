const GENERAL_STATUS = require('../constant/generalConstant');
const QUESTION_STATUS = require('../constant/questionConstant');
const guard = require('../utils/guard/guard');
const joinjs = require('join-js').default;
const map = require('./resultMap');
const objectWithoutKey = require('../utils/objectWithoutKey');
const { batchInsert, batchReinsert } = require('../utils/batchInsertTransacting');

class QuestionService {
    constructor(knex) {
        this.knex = knex;
    }

    async postQuestion(req) {
        let { body: { options, question } } = req;
        if (!guard.isAdmin(req)) {
            throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
        }
        let questionId;
        try {
            await this.knex.transaction(async (trx) => {
                questionId = await this.insertQuestion(trx, question);
                await this.insertOptionMeta(trx, questionId[0], options).then(trx.commit);
            });

            return ({
                status: QUESTION_STATUS.CREATE_QUESTION_SUCCESSFUL,
                id: questionId[0]
            });

        } catch (err) {
            console.log(err);
            throw new Error(GENERAL_STATUS.DATABASE_ERROR);
        }
    }


    async getQuestion(req, queryArray) {
        let [includeExpired] = queryArray;
        let { params: { questionId } } = req;
        try {
            let questionWithOptions = await this.queryQuestion(questionId, queryArray);

            if (!guard.isAdmin(req) || includeExpired !== true) {
                questionWithOptions = questionWithOptions.filter(question => question.expired === false);
            }
            
            if (typeof questionWithOptions === 'undefined' || questionWithOptions.length <= 0) {
                throw new Error(QUESTION_STATUS.READ_FAIL_NO_QUESTION);
            };

            return {
                status: QUESTION_STATUS.READ_QUESTION_SUCCESSFUL,
                question: questionWithOptions
            };

        } catch (err) {
            if (err.message === QUESTION_STATUS.READ_FAIL_NO_QUESTION) {
                throw new Error(QUESTION_STATUS.READ_FAIL_NO_QUESTION);
            };
            console.log(err);
            throw new Error(GENERAL_STATUS.DATABASE_ERROR);
        }
    }

    async getAllQuestions(req, queryArray) {
        try {

            let questionWithOptions = await this.queryQuestion(null, queryArray);
            return (questionWithOptions);

            if (!guard.isAdmin(req) || inlcudeExpired !== true) {
                questionWithOptions = questionWithOptions.filter(question => question.expired === false);
            }

            return {
                status: QUESTION_STATUS.READ_QUESTION_SUCCESSFUL,
                questions: questionWithOptions
            };

        } catch (err) {
            if (err.message === QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION) {
                throw new Error(QUESTION_STATUS.READ_QUESTION_FAIL_NO_QUESTION);
            };
            console.log(err);
            throw new Error(GENERAL_STATUS.DATABASE_ERROR);
        }
    }

    async updateQuestion(req) {
        if (!guard.isAdmin(req)) {
            throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
        }

        let { body: { question, options }, params: { questionId } } = req;

        let entity = await this.queryQuestion(questionId, []);
        if (typeof entity === 'undefined' || entity.length <= 0) {
            return { status: QUESTION_STATUS.UPDATE_NO_ENTITY };
        };

        await this.knex.transaction(async (trx) => {
            if (question) {
                let result = await this.knex('questions').transacting(trx).where('question_id', questionId).update(question);
            }
            if (options) {
                for (const option of options) {
                    let [pureOptions, metaArray] = objectWithoutKey(option, 'meta');
                    await this.knex('options').transacting(trx).where('option_id', option.option_id).update(pureOptions);
                    if (metaArray && metaArray.length > 0) {
                        let metaOptionRelation = metaArray.reduce((cumulator, meta) => cumulator = cumulator.concat({
                            option_id: option.option_id,
                            metadata_id: meta
                        }), []);
                        await batchReinsert(this.knex, trx, 'option_metadata', { option_id: option.option_id }, metaOptionRelation);
                    }
                }
            }
        });
        return { status: QUESTION_STATUS.UPDATE_SUCCESSFUL };
    }

    async createNewOption(req) {
        let { params: { questionId }, body: { options } } = req;

        try {
            let entity = await this.queryQuestion(questionId, []);
            if (typeof entity === 'undefined' || entity.length <= 0) {
                return { status: QUESTION_STATUS.UPDATE_NO_ENTITY };
            };

            await this.knex.transaction(async (trx) => {
                await this.insertOptionMeta(trx, questionId, options).then(trx.commit);
            });
        } catch (err) {
            console.log(err);
            throw new Error(GENERAL_STATUS.DATABASE_ERROR);
        }

        return {
            status: QUESTION_STATUS.CREATE_OPTION_SUCCESSFUL
        };
    }

    async insertOptionMeta(trx, questionId, options) {
        let pureOptions = options.map(option => objectWithoutKey(option, 'meta')[0]);
        let optionIds = await this.insertQuestionOption(trx, questionId, pureOptions);
        let metaArrays = options.map((option, index) => option.meta ? { id: optionIds[index], meta: option.meta } : { meta: [] });

        let metaOptionRelation = metaArrays.reduce((bigCumulator, option) =>
            bigCumulator.concat(
                option.meta.reduce((smallCumulator, meta) =>
                    smallCumulator.concat({
                        option_id: option.id,
                        metadata_id: meta
                    }), [])
            ), []);
        return await batchInsert(this.knex, trx, 'option_metadata', metaOptionRelation)
    }

    insertQuestion(trx, question) {
        return this.knex('questions')
            .transacting(trx)
            .insert(question)
            .returning('question_id')
            .catch(() => {
                throw new Error(QUESTION_STATUS.QUESTION_FAIL_INVALID_INPUT);
            });
    }

    async insertQuestionOption(trx, questionId, options) {
        let chunkSize = options.length;
        let ids = await batchInsert(this.knex, trx, 'options', options, chunkSize, 'option_id');
        let relations = ids.map(id => ({ question_id: questionId, option_id: id }));
        await batchInsert(this.knex, trx, 'question_options', relations, chunkSize);
        return ids;
    }

    queryQuestion(questionId = null, queryArray) {
        let [includeExpired, limit, offset] = queryArray;
        limit = limit || 10;
        offset = offset || 0;
        return this.knex.select('q.question_id', 'q.text', 'q.expired' ,
            this.knex.raw(`array_agg(json_build_object(
                'option_id',  opt.option_id,
                'text',  opt.text,
                'expired',  opt.expired,
                'implication', opt.implication
            )) as options`))
            .from('questions as q')
            .join('question_options as qo', 'q.question_id', 'qo.question_id')
            .join('options as opt', 'opt.option_id', 'qo.option_id')
            .modify(queryBuilder => {
                if (questionId) {
                    queryBuilder.where('q.question_id', questionId)
                }
            })
            .groupBy(['q.question_id', 'q.text', 'q.expired'])
            .orderBy('q.question_id')
            .limit(limit || 5)
            .offset(offset || 0)
            .catch(err => {
                console.log(err);
                throw new Error(err);
            })
    }
}

module.exports = QuestionService;