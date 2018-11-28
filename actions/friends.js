var mysql = require('mysql')
var dbconfig = require('../config/database')

var pool = mysql.createPool(dbconfig.connection)

module.exports = {
  getFriendsList: function (userId, done) {
    //  var friendsListQuery = 'SELECT userId, name FROM users INNER JOIN friends ON users.userId = friends.subscriberId WHERE friends.publisherId = ? ORDER BY ?? ASC'

    var friendsListQuery = 'SELECT users.userId, users.name, users.email, users.username FROM users WHERE users.userId <> ? ORDER BY name ASC'

    pool.query(friendsListQuery, userId, function (err, friends) {
      return done(err, friends)
    })
  },
  getFriendInfo: function (userId, done) {
    var friendsListQuery = 'SELECT users.name, users.email, users.username FROM users WHERE users.userId = ?'

    pool.query(friendsListQuery, [userId], function (err, friends) {
      return done(err, friends[0])
    })
  },
  addFriend: function (publisherId, subscriberId, done) {
    var friendshipData = {
      publisherId: publisherId,
      subscriberId: subscriberId
    }

    pool.query('INSERT INTO friends SET ?', friendshipData, function (err, friendship) {
      if (err) return done(err, null, { message: 'Unable to create friendship!' })
      return done(null, true, { message: 'Friendship added.' })
    })
  },
  removeFriend: function (friendshipId, done) {
    pool.query('DELETE FROM friends WHERE friendshipId = ?', friendshipId, function (err, friendship) {
      if (err) done(err, null, { message: 'Unable to remove friendship!' })
      return done(null, true, { message: 'Friendship removed.' })
    })
  }
}
