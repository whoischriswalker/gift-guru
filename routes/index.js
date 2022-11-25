const { any } = require('bluebird')
var express = require('express')
var router = express.Router()
var items = require('../actions/items')

router.get('/', isLoggedIn, (req, res) => {
  const user = req.user
  const message = req.flash('addItemMessage') || req.flash('removeItemMessage')

  items.getWishList(req.user.userId, function (err, wishes) {
    if (err) throw err
    pageData = new fnPageData(user,wishes,message)
  })
/*  const oldWishes = items.getWishListHistory(req.user.userId, function (err, oldWishes) {
    if (err) throw err
    return done(null,oldWishes)
  })*/
  res.render('index', pageData)
})

module.exports = router

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login')
}

// create pageData object for logged in user
function fnPageData(user,wishes,message) {
  this.user = user
  this.wishes = wishes
  this.message = message
}