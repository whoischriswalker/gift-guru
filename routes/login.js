var express = require('express')
var router = express.Router()

router.get('/', isLoggedIn, (req, res) => {
  var pageValues = {}

  var flash = req.flash('error')

  if (flash.length !== 0) {
    pageValues.message = flash
  }
  res.render('login', pageValues)
})

module.exports = router

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (!req.isAuthenticated()) { return next() }
  res.redirect('/')
}
