exports.up = function(knex, Promise) {
    return knex.schema.createTable('events', function(table) {
        table.increments('event_id').unique();
        table.string('event_title').notNullable();
        table.dateTime('date').notNullable();
        table.text('description');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('events');
};
