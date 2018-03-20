exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_event', function (table) {
        table.increments().unique();
        table.integer('creator_id');
        table.integer('event_id');
        table.foreign('creator_id').references('users.id');
        table.foreign('event_id').references('events.event_id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('user_event');
};
