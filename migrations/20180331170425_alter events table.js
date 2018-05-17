exports.up = function(knex, Promise) {
    return knex.schema.table('events', function (table) {
        table.dropColumn('creator_id');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('events', function (table) {
        table.integer('creator_id');
        table.foreign('creator_id').references('users_event');
    })
};
