exports.up = function(knex, Promise) {
    return knex.schema.createTable('events', function(table) {
        table.increments('event_id').unique();
        table.string('event_name').notNullable();
        table.dateTime('date_time').notNullable();
        table.text('description');
        table.integer('wine_id');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('events');
};
