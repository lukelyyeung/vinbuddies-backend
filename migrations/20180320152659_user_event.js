exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_event', function (table) {
        table.increments().unique();
        table.integer('user_id');
        table.foreign('user_id').references('users.id');
        table.integer('event_id');
        table.foreign('event_id').references('events.event_id');
        table.string('role').notNullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('user_event');
};
