var express = require('express')
var router = express.Router()
var items = require('../actions/items')

router.get('/', isLoggedIn, (req, res) => {
  items.getWishList(req.user.userId, function (err, result) {
    if (err) throw err
    var pageData = {
      user: req.user,
      wishes: result,
      message: req.flash('addItemMessage') || req.flash('removeItemMessage')
    }
    res.render('index', pageData)
  })
})

module.exports = router

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login')
}
