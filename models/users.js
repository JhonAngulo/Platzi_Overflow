'use strict'

const bcrytp = require('bcrypt')

class Users {
  constructor (db) {
    this.db = db
    this.ref = this.db.ref('/')
    this.collection = this.ref.child('users')
  }

  async create (data) {
    const user = {
      ...data
    }
    user.password = await this.constructor.encrypt(user.password)
    const newUser = this.collection.push()
    newUser.set(user)

    return newUser.key
  }

  async validateUser (data) {
    const userQuery = await this.collection.orderByChild('email').equalTo(data.email).once('value')
    const userFount = userQuery.val()


    if (userFount) {
      const userId = Object.keys(userFount)[0]
      const passwdRigth = await bcrytp.compare(data.password, userFount[userId].password)
      const result = (passwdRigth) ? userFount[userId] : false
      return result
    }
    return false
  }

  static async encrypt (passwd) {
    const saltRounds = 10
    const hashedPassword = await bcrytp.hash(passwd, saltRounds)
    return hashedPassword
  }
}

module.exports = Users