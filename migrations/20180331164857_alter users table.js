exports.up = function(knex, Promise) {
    return knex.schema.table('users', function (table) {
        table.string('firstname');
        table.string('surename');
        table.boolean('deleted').defaultTo(false);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.dropColumn('firstname');
        table.dropColumn('surename');
        table.dropColumn('deleted');
    });
};
