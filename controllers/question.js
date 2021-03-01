'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')
const { join } = require('path')
const { v1: uuid} = require('uuid')

const write = promisify(writeFile)

const questions = require('../models/index').questions
const Joi = require('@hapi/joi')

async function createQuestion (req, h) {

  if (!req.state.user) {
    return h.redirect('/login')
  }
 
  let result, filename
  try {

    if (Buffer.isBuffer(req.payload.image)) {
      filename = `${uuid()}.png`
      await write(join(__dirname, '..', 'public', 'uploads', filename), req.payload.image)
    }

    result = await questions.create(req.payload, filename, req.state.user)
    // console.log(`Pregunta creada con el ID ${result}`)
    req.log('info', `Pregunta creada con el ID ${result}`)
    return h.redirect(`/question/${result}`)
  } catch (error) {
    // console.error(`Ocurrio un error: ${error}`)
    req.log('error', `Ocurrio un error: ${error}`)
    return h.view('ask', {
      title: 'Crear pregunta',
      error: 'Problemas creando la pregunta'
    }).code(500).takeover()
  }
}

async function answerQuestion (req, h) {

  if (!req.state.user) {
    return h.redirect('/login')
  }

  let result
  try {
    result = await questions.answer(req.payload, req.state.user)
    // console.log(`Respuesta creada: ${result}`)
    req.log('info', `Respuesta creada: ${result}`)
  } catch (error) {
    console.error(error)
  }

  return h.redirect(`/question/${req.payload.id}`)
}

async function setAnswerRight(req, h) {

  if (!req.state.user) {
    return h.redirect('/login')
  }

  let result
  try {
    result = await req.server.methods.setAnswerRight(req.params.questionId, req.params.answerId, req.state.user)
    return h.redirect(`/question/${req.params.questionId}`)
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  createQuestion,
  answerQuestion,
  setAnswerRight
}