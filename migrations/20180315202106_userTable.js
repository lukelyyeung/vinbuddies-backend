exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function (table) {
        table.increments().unique();
        table.string('name').notNullable();
        table.string('password');
        table.string('email');
        table.string('role').defaultTo('user').notNullable();
        table.string('social_id');
        table.string('provider').notNullable();
        table.boolean('first_login').defaultTo(true).notNullable();
        table.unique(['email', 'provider']);
        table.unique(['social_id', 'provider']);
        table.timestamps(false, true);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};
