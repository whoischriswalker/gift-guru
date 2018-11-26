var mysql = require('mysql')
var dbconfig = require('../config/database')

var pool = mysql.createPool(dbconfig.connection)

module.exports = {
  getUserInfo: function (userId, done) {
    var userInfoQuery = 'SELECT users.username, users.name, users.email FROM users WHERE users.userId = ?'

    pool.query(userInfoQuery, [userId], function (err, user) {
      if (err) return done(err)
      return done(null, user)
    })
  }
}
