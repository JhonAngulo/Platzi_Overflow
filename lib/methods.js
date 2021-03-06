'use strict'

const questions = require('../models/index').questions

async function setAnswerRight(questionId, answerId, user) {
  let result
  try {
    result = await questions.setAnswerRight(questionId, answerId, user)
    return result
  } catch (error) {
    console.error(error)
    return false
  }
}
async function getLast(amount) {
  let data 
  try {
    data = await questions.getLast(amount)
  } catch (error) {
    console.error(error)
  }
  return (data)
}

module.exports = {
  setAnswerRight,
  getLast
}