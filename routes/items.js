var express = require('express')
var router = express.Router()
var items = require('../actions/items')
const axios = require('axios')
const cheerio = require('cheerio')

router.post('/add', isLoggedIn, (req, res) => {
  const userId = req.user.userId
  if (req.body.description == null) {
    const productDetails = getProductDetails(req.body.url)
    productDetails.price = Number(productDetails.price.replace(/[^0-9.-]+/g, ''))
    var itemData = {
      desc: productDetails.description,
      url: productDetails.url,
      price: productDetails.price
    }
  } else {
    req.body.price = Number(req.body.price.replace(/[^0-9.-]+/g, ''))
    itemData = {
      desc: req.body.description,
      url: req.body.url,
      price: req.body.price
    }
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

async function getProductDetails (url) {
  // Make a GET request to the given URL
  if (url.indexOf(' ') !== -1) {
    url = url.split(/http(s)?/)[1]
  } else {
    let a = document.createElement('a')
    a.href = url
    let domain = a.hostname

    const response = await axios.get(url)

    // Use cheerio to parse the HTML and extract the product price and description
    const $ = cheerio.load(response.data)
    let priceElement = String
    let descElement = String
    switch (domain) {
      case 'amazon.com':
        priceElement = '#priceblock_ourprice'
        descElement = '#productDescription'
        var price = $(priceElement).text()
        var description = $(descElement).text()
        break

      default:
        break
    }
    // Return the product price and description
    return ({ url, price, description })
  }
}
