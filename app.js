require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'development';
const knexFile = require('./knexfile')[NODE_ENV];
const knex = require('knex')(knexFile);
require('./utils/knexDeferredForeignKey')(knex);
const express = require('express');
const { LoginRouter, UserRouter, QuestionRouter } = require('./routers');
const { LoginService, UserService, QuestionService } = require('./service');

const loginService = new LoginService(knex);
const userService = new UserService(knex);
const questionService = new QuestionService(knex);
const { app, server } = require('./utils/init-app')(express);

app.use('/api/v1/auth', new LoginRouter(loginService).router());
app.use('/api/v1/user', new UserRouter(userService).router());
app.use('/api/v1/questions', new QuestionRouter(questionService).router());
server.listen(8080, () => console.log('Listen on the port 8080.'));