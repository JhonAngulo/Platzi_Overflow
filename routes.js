'use strict'

const Joi = require('@hapi/joi')
const site = require('./controllers/site')
const user = require('./controllers/user')
const question = require('./controllers/question')

module.exports = [
  {
    method: 'GET',
    path: '/',
    options:{
      cache: {
        expiresIn: 1000 * 30,
        privacy: 'private'
      }
    },
    handler: site.home
  },
  {
    method: 'GET',
    path: '/register',
    handler: site.register
  },
  {
    method: 'POST',
    path: '/create-user',
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
        failAction: user.failValidation
      }
    },
    handler: user.createUser
  },
  {
    method: 'POST',
    path: '/validate-user',
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
        failAction: user.failValidation
      }
    },
    handler: user.validateUser
  },
  {
    method: 'GET',
    path: '/login',
    handler: site.login
  },
  {
    method: 'GET',
    path: '/question/{id}',
    handler: site.viewQuestion
  },
  {
    method: 'GET',
    path: '/logout',
    handler: user.logout
  },
  {
    method: 'GET',
    path: '/ask',
    handler: site.ask
  },
  {
    method: 'POST',
    path: '/create-question',
    options: {
      payload: {
        parse: true,
        multipart: true
      },
      validate: {
        payload: Joi.object({
          title: Joi.string().required(),
          description: Joi.string().required(),
          image: Joi.any().optional()
        }),
        failAction: user.failValidation
      }
    },
    handler: question.createQuestion
  },
  {
    method: 'POST',
    path: '/answer-question',
    options: {
      validate: {
        payload: Joi.object({
          answer: Joi.string().required(),
          id: Joi.string().required(),
        }),
        failAction: user.failValidation
      }
    },
    handler: question.answerQuestion
  },
  {
    method: 'GET',
    path: '/answer/{questionId}/{answerId}',
    handler: question.setAnswerRight
  },
  {
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: '.',
        index: ['index.html']
      }
    }
  },
  {
    method: ['GET', 'POST'],
    path: '/{any*}',
    handler: site.notFound
  }
]