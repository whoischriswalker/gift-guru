var mysql = require('mysql')
var dbconfig = require('../config/database')

var pool = mysql.createPool(dbconfig.connection)

// add scraper deps
var fetch = require('node-fetch')
var cheerio = require('cheerio')

module.exports = {
  getWishList: function (userId, done) {
    var wishListQuery = 'SELECT items.desc, items.url, items.price, wishes.wishId, wishes.userId, IF(wishes.mustHave, TRUE, null) mustHave,  IF(wishes.purchaseStatus, TRUE, null) purchaseStatus, wishes.createDate FROM wishes INNER JOIN items ON wishes.itemId = items.itemId WHERE wishes.createDate > "2025-10-01 00:00:00" AND wishes.userId = ? ORDER BY ?? DESC, ?? DESC'

    pool.query(wishListQuery, [userId, 'wishes.createDate', 'wishes.purchaseStatus'], function (err, wishes) {
      if (err) return done(err)
      return done(null, wishes)
    })
  },
  getWishListHistory: function (userId, done) {
    var wishListQuery = 'SELECT items.desc, items.url, items.price, wishes.wishId, wishes.userId, IF(wishes.mustHave, TRUE, null) mustHave,  IF(wishes.purchaseStatus, TRUE, null) purchaseStatus, wishes.createDate FROM wishes INNER JOIN items ON wishes.itemId = items.itemId WHERE wishes.createDate < "2025-10-01 00:00:00" AND wishes.createDate > "2024-01-01 00:00:00" AND wishes.userId = ? ORDER BY ?? DESC, ?? DESC'

    pool.query(wishListQuery, [userId, 'wishes.createDate', 'wishes.purchaseStatus'], function (err, oldWishes) {
      if (err) return done(err)
      return done(null, oldWishes)
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
      return done(null, 'Thank you for your purchase!', { message: 'Wish marked as purchased.' })
    })
  },

  // new: fetch metadata from a URL (description + price heuristics)
  fetchItemMetadata: function (url, done) {
    if (!url) return done(new Error('No URL provided'))
    // ensure protocol
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url

    fetch(url, { timeout: 10000 })
      .then(function (res) { return res.text() })
      .then(function (html) {
        var $ = cheerio.load(html)
        var desc = $('meta[property="og:title"]').attr('content') ||
                   $('meta[name="twitter:title"]').attr('content') ||
                   $('meta[name="description"]').attr('content') ||
                   $('title').text() || ''

        // try multiple selectors for price
        var price = $('meta[property="product:price:amount"]').attr('content') ||
                    $('meta[itemprop="price"]').attr('content') ||
                    $('meta[name="price"]').attr('content') ||
                    $('[itemprop=price]').attr('content') ||
                    $('[class*="price"]').first().text() ||
                    $('[id*="price"]').first().text() || ''

        // sanitize numeric-like price (keep currency symbol and digits)
        if (typeof price === 'string') {
          price = price.trim()
          // extract first currency + number group if possible
          var m = price.match(/([$€£]?[\d\.,]+)/)
          if (m) price = m[1]
        }

        return done(null, { desc: desc.trim(), price: (price || '').toString().trim() })
      })
      .catch(function (err) {
        return done(err)
      })
  }
}
