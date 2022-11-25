var express = require('express')
var router = express.Router()
var items = require('../actions/items')
var pageData = {}

router.get('/', isLoggedIn, (req, res) => {
  items.getWishList(req.user.userId, function (err, wishes) {
    if (err) throw err
    pageData.user = req.user
    pageData.wishes = wishes
    pageData.message = req.flash('addItemMessage') || req.flash('removeItemMessage')
  })
  items.getWishListHistory(req.user.userId, function (err, oldWishes) {
    if (err) throw err
    pageData.oldWishes = oldWishes
  })
  res.render('index', pageData)
})

module.exports = router

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login')
}
