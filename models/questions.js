'use stric'

class Questions {
  constructor(db) {
    this.db = db
    this.ref = this.db.ref('/')
    this.collection = this.ref.child('questions')
  }

  async create (info, filename, user) {
    const data = {
      description: info.description,
      title: info.title,
      owner: user
    }

    if (filename) {
      data.filename = filename
    }

    const newQuestion = this.collection.push()
    newQuestion.set(data)
    return newQuestion.key
  }

  async getLast (amount) {
    const query = await this.collection.limitToLast(amount).once('value')
    const data = query.val()
    return data
  }

  async getOne (id) {
    const query = await this.collection.child(id).once('value')
    const data = query.val()
    return data
  }

  async answer (data, user) {
    const insert = {
      text: data.answer,
      user
    }
    const answers = await this.collection.child(data.id).child('answers').push()
    answers.set(insert)
    return answers
  }

  async setAnswerRight (questionId, answerId, user) {
    const query = await this.collection.child(questionId).once('value')
    const question = query.val()
    const answers = question.answers

    if (!user.email === question.owner.email) {
      return false
    }

    for (let key in answers) {
      answers[key].correct = (key === answerId)
    }

    const update = await this.collection.child(questionId).child('answers').update(answers)
    return update
  }
}

module.exports = Questions