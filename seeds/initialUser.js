const initialUsers = [
  { username: 'admin', password: '$2a$10$2DXMPffbCF3K2KLph9OmFO89QM2NrvB8mBQCxW4js3BBrW8/hDjb2', provider: 'local', role: 'admin', email: 'admin@email.com' },
  { username: 'testUser', password: '$2a$10$2DXMPffbCF3K2KLph9OmFO89QM2NrvB8mBQCxW4js3BBrW8/hDjb2', provider: 'local', role: 'user', email: 'user@email.com' }
];

exports.seed = function (knex, Promise) {
  return knex('users').del()
    .then(() => knex('users').insert(initialUsers))
};