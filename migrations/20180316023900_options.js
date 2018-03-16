
exports.up = function (knex, Promise) {
  return knex.schema.createTable('options', function (table) {
    table.increments('option_id').unique();
    table.string('text');
    table.string('implication');
    table.boolean('expired');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('options');
};
