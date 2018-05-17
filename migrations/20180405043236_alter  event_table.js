
exports.up = function (knex, Promise) {
    return knex.schema.table('events', function (table) {
        table.boolean('deleted').defaultTo(false).notNullable();
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table('events', function (table) {
        table.dropColumn('deleted');
    });
};
