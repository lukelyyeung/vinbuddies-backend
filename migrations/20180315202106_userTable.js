exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function (table) {
        table.increments().unique();
        table.string('name');
        table.string('password');
        table.string('email');
        table.string('role');
        table.string('social_id');
        table.string('provider');
        table.unique(['email', 'social_id', 'provider']);
        table.timestamps(false, true);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};
