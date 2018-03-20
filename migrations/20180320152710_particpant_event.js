exports.up = function (knex, Promise) {
    return knex.schema.createTable('participant_event', function (table) {
        table.increments().unique();
        table.integer('participant_id');
        table.integer('event_id');
        table.foreign('participant_id').references('users.id');
        table.foreign('event_id').references('events.event_id');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('participant_event');
};
