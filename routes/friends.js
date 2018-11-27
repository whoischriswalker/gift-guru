var express = require('express')
var router = express.Router()
var items = require('../actions/items')
var friends = require('../actions/friends')

router.get('/', isLoggedIn, (req, res) => {
  friends.getFriendsList(req.user.userId, function (err, result) {
    if (err) throw err
    var pageData = {
      user: req.user,
      friends: result,
      message: req.flash('friendsMessage')
    }
    res.render('friends', pageData)
  })
})

router.post('/add/:userId', isLoggedIn, (req, res) => {
  var publisherId = req.user.userId
  var subscriberId = req.param.userId

  friends.addFriend(publisherId, subscriberId, function (err, result) {
    if (err) throw err
    req.flash('friendsMessage', 'Friend added!')
    res.redirect('/friends')
  })
})

router.post('/remove/:userId', isLoggedIn, (req, res) => {
  friends.removeFriend(req.user.userId, function (err, result) {
    if (err) throw err
    var pageData = {
      user: req.user,
      friends: result,
      message: req.flash('friendsMessage')
    }
    res.render('friends', pageData)
  })
})

router.get('/wishes/:userId', isLoggedIn, (req, res) => {
  var userId = req.params.userId
  var user = req.user
  friends.getFriendInfo(userId, function (err, friendInfo) {
    if (err) throw err
    items.getWishList(userId, function (err, wishList) {
      if (err) throw err
      var message = req.flash('friendsMessage')
      res.render('wishes', { name: friendInfo.name, message: message, wishes: wishList, user: user })
    })
  })
})

module.exports = router

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login')
}
