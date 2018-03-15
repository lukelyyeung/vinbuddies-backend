const express = require('express');
const LoginRouter = require('./routers/loginRouter');
const UserService = require('./service/UserService');
require('dotenv').config();

const UserService = new UserService();
const { app, server } = require('./utils/init-app')(express);

app.use('api/v1/auth', new LoginRouter());
server.listen(8080, () => console.log('Listen on the port 8080.'));