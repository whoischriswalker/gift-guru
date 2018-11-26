var express = require('express')
var router = express.Router()
var items = require('../actions/items')

router.post('/add', isLoggedIn, (req, res) => {
  const userId = req.user.userId
  req.body.price = Number(req.body.price.replace(/[^0-9.-]+/g, ''))
  const itemData = {
    desc: req.body.description,
    url: req.body.url,
    price: req.body.price
  }
  const mustHave = req.body.mustHave

  items.addWish(userId, itemData, mustHave, function (err, result) {
    if (err) throw err
    req.flash('itemMessage', result)
    res.redirect('/')
  })
})

router.get('/remove/:wishId', isLoggedIn, (req, res) => {
  var wishId = req.params.wishId
  items.removeWish(wishId, function (err, result) {
    if (err) {
      req.flash('itemMessage', result)
      res.redirect('/')
    }
    if (result) {
      req.flash('itemMessage', result)
      res.redirect('/')
    }
  })
})

router.get('/purchase/:userId/:wishId', isLoggedIn, (req, res) => {
  var userId = req.params.userId
  var wishId = req.params.wishId
  items.purchaseWish(wishId, function (err, result) {
    if (err) {
      req.flash('friendsMessage', result)
      res.redirect('/friends/wishes/' + userId)
    }
    if (result) {
      req.flash('friendsMessage', result)
      res.redirect('/friends/wishes/' + userId)
    }
  })
})

module.exports = router

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login')
}
