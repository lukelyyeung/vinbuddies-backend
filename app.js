require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'development';
const knexFile = require('./knexfile')[NODE_ENV];
const knex = require('knex')(knexFile);
const express = require('express');
const LoginRouter = require('./routers/loginRouter');
const LoginService = require('./service/LoginService');

const loginService = new LoginService(knex);
const { app, server } = require('./utils/init-app')(express);

app.use('/api/v1/auth', new LoginRouter(loginService).router());
server.listen(8080, () => console.log('Listen on the port 8080.'));