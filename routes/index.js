const { any } = require('bluebird')
var express = require('express')
var router = express.Router()
var items = require('../actions/items')

router.get('/', isLoggedIn, (req, res) => {
  const user = req.user
  const message = req.flash('addItemMessage') || req.flash('removeItemMessage')

  items.getWishList(req.user.userId, function (err, wishes) {
    if (err) throw err
    items.getWishListHistory(req.user.userId, function (err, oldWishes) {
      if (err) throw err    
      pageData = new fnPageData(user, wishes, oldWishes, message)
      res.render('index', pageData)
    })
  })
})

// new endpoint: fetch metadata for a provided URL
router.post('/items/fetch-metadata', function (req, res) {
  var url = req.body && req.body.url
  if (!url) return res.status(400).json({ error: 'No URL provided' })

  items.fetchItemMetadata(url, function (err, data) {
    if (err) {
      console.error('fetch-metadata error:', err && err.message)
      return res.status(500).json({ error: 'Unable to fetch metadata' })
    }
    res.json(data)
  })
})

module.exports = router

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login')
}

// create pageData object for logged in user
function fnPageData (user, wishes, oldWishes, message) {
  this.user = user
  this.wishes = wishes
  this.message = message
  this.oldWishes = oldWishes
}
