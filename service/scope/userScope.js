const userScope = ['id', 'username', 'surename', 'firstname','sex', 'birthday', 'email', 'social_id', 'provider', 'picture', 'role'];
const extraScope = ['password', 'first_login', 'deleted'];
const adminScope = userScope.slice().concat(extraScope);

module.exports = {
    userScope: userScope,
    adminScope: adminScope
}
