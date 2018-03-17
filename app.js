require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'development';
const knexFile = require('./knexfile')[NODE_ENV];
const knex = require('knex')(knexFile);
const express = require('express');
const { LoginRouter, UserRouter } = require('./routers');
const { LoginService, UserService } = require('./service');

const loginService = new LoginService(knex);
const userService = new UserService(knex);
const { app, server } = require('./utils/init-app')(express);

app.use('/api/v1/auth', new LoginRouter(loginService).router());
app.use('/api/v1/user', new UserRouter(userService).router());
server.listen(8080, () => console.log('Listen on the port 8080.'));