exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.table('questions', function (table) { table.timestamps(false, true); }),
        knex.schema.table('options', function (table) { table.timestamps(false, true); }),
        knex.schema.table('question_options', function (table) { table.timestamps(false, true); }),
        knex.schema.table('user_question_history', function (table) { table.timestamps(false, true); }),
        knex.schema.table('events', function (table) { table.timestamps(false, true); }),
        knex.schema.table('user_event', function (table) { table.timestamps(false, true); }),
        knex.schema.table('event_gallery', function (table) { table.timestamps(false, true); }),
        knex.schema.table('wines', function (table) { table.timestamps(false, true); }),
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.table('questions', function (table) { table.dropTimestamps(); }),
        knex.schema.table('options', function (table) { table.dropTimestamps(); }),
        knex.schema.table('question_options', function (table) { table.dropTimestamps(); }),
        knex.schema.table('user_question_history', function (table) { table.dropTimestamps(); }),
        knex.schema.table('events', function (table) { table.dropTimestamps(); }),
        knex.schema.table('user_event', function (table) { table.dropTimestamps(); }),
        knex.schema.table('event_gallery', function (table) { table.dropTimestamps(); }),
        knex.schema.table('wines', function (table) { table.dropTimestamps(); })
    ])
};
