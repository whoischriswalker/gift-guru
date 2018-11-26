var express = require('express')
var router = express.Router()

router.get('/', isLoggedIn, (req, res) => {
  res.render('register')
})

module.exports = router

//  route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (!req.isAuthenticated()) { return next() }
  res.redirect('/')
}
