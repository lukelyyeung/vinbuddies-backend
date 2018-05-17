const GENERAL_STATUS = require('../constant/generalConstant');

const insert = (knex, trx, table, relation, chunk = 10, dataReturn=null) => {
    return knex
        .batchInsert(table, relation, chunk)
        .transacting(trx)
        .returning(dataReturn)
        .catch(err => {
            console.log(err);
            throw new Error(GENERAL_STATUS.DATABASE_ERROR);
        })
}

const reinsert = async (knex, trx, table, linkage, newRelation, chunk = 10, dataReturn = null) => {
    try {

        await knex(table).transacting(trx).where(linkage).del();
        return await knex.batchInsert(table, newRelation, chunk).transacting(trx).returning(dataReturn);
        
    } catch(err) {
        console.log(err);
        throw new Error(GENERAL_STATUS.DATABASE_ERROR);
    };
}

module.exports = {
    batchInsert: insert,
    batchReinsert: reinsert 
}