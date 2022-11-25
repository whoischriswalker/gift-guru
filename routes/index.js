const { any } = require('bluebird')
var express = require('express')
var router = express.Router()
var items = require('../actions/items')

function fnPageData(user,wishes,oldWishes,message) {
  this.user = user
  this.wishes = wishes
  this.oldWishes = oldWishes
  this.message = message
}

router.get('/', isLoggedIn, (req, res) => {
  const user = req.user
  const message = req.flash('addItemMessage') || req.flash('removeItemMessage')

  const wishes = items.getWishList(req.user.userId, function (err, wishes) {
    if (err) throw err
    return done(null,wishes)
  })
  const oldWishes = items.getWishListHistory(req.user.userId, function (err, oldWishes) {
    if (err) throw err
    return done(null,oldWishes)
  })
  const pageData = new fnPageData(user,wishes,oldWishes,message)
  res.render('index', pageData)
})

module.exports = router

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login')
}
