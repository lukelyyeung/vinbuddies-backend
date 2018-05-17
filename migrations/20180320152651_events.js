exports.up = function(knex, Promise) {
    return knex.schema.createTable('events', function(table) {
        table.increments('event_id').unique();
        table.integer('creator_id');
        table.foreign('creator_id').references('users.id');
        table.string('event_title').notNullable();
        table.dateTime('date').notNullable();
        table.text('description');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('events');
};
