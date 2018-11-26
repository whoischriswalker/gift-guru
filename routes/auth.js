var express = require('express')
var router = express.Router()
var passport = require('passport')

router.post('/register', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/register',
  failureFlash: true
}))

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

router.get('/profile', isLoggedIn, (req, res) => {
  res.status(200).json(req.user)
})

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login')
}
