var mysql = require('mysql')
var dbconfig = require('../config/database')

var pool = mysql.createPool(dbconfig.connection)

module.exports = {
  getWishList: function (userId, done) {
    var wishListQuery = 'SELECT items.desc, items.url, items.price, wishes.wishId, wishes.userId, IF(wishes.mustHave,"true","false") mustHave,  IF(wishes.purchaseStatus, "true", "false") purchaseStatus, wishes.createDate FROM wishes INNER JOIN items ON wishes.itemId = items.itemId WHERE wishes.userId = ? ORDER BY ?? DESC, ?? DESC'

    pool.query(wishListQuery, [userId, 'wishes.purchaseStatus', 'wishes.createDate'], function (err, wishes) {
      if (err) return done(err)
      return done(null, wishes)
    })
  },
  addWish: function (userId, itemData, mustHave, done) {
    pool.query('INSERT INTO items SET ?', itemData, function (err, item) {
      if (err) return done(err, null, { message: 'Unable to add item!' })

      var wishData = {
        itemId: item.insertId,
        userId: userId,
        mustHave: mustHave
      }

      pool.query('INSERT INTO wishes SET ?', wishData, function (err, wish) {
        if (err) return done(err, null, { message: 'Unable to add wish!' })
        return done(null, true, { message: 'Wish Added!' })
      })
    })
  },
  removeWish: function (wishId, done) {
    pool.query('DELETE FROM wishes WHERE wishId = ?', wishId, function (err, wish) {
      if (err) done(err, null, { message: 'Unable to remove wish!' })
      return done(null, true, { message: 'Wish removed.' })
    })
  },
  purchaseWish: function (wishId, done) {
    pool.query('UPDATE wishes SET wishes.purchaseStatus = 1 WHERE wishId = ?', wishId, function (err, wish) {
      if (err) done(err, null, { message: 'Unable to mark wish as purchased!' })
      return done(null, true, { message: 'Wish marked as purchased.' })
    })
  }
}
