var mysql = require('mysql')
var dbconfig = require('../config/database')

var pool = mysql.createPool(dbconfig.connection)

// add scraper deps
var fetch = require('node-fetch')
var cheerio = require('cheerio')

module.exports = {
  getWishList: function (userId, done) {
    var wishListQuery = 'SELECT items.desc, items.url, items.price, wishes.wishId, wishes.userId, IF(wishes.mustHave, TRUE, null) mustHave,  IF(wishes.purchaseStatus, TRUE, null) purchaseStatus, wishes.createDate FROM wishes INNER JOIN items ON wishes.itemId = items.itemId WHERE wishes.createDate > "2025-10-01 00:00:00" AND wishes.userId = ? ORDER BY ?? DESC, ?? DESC'

    pool.query(wishListQuery, [userId, 'wishes.createDate', 'wishes.purchaseStatus'], function (err, wishes) {
      if (err) return done(err)
      return done(null, wishes)
    })
  },
  getWishListHistory: function (userId, done) {
    var wishListQuery = 'SELECT items.desc, items.url, items.price, wishes.wishId, wishes.userId, IF(wishes.mustHave, TRUE, null) mustHave,  IF(wishes.purchaseStatus, TRUE, null) purchaseStatus, wishes.createDate FROM wishes INNER JOIN items ON wishes.itemId = items.itemId WHERE wishes.createDate < "2025-10-01 00:00:00" AND wishes.createDate > "2024-01-01 00:00:00" AND wishes.userId = ? ORDER BY ?? DESC, ?? DESC'

    pool.query(wishListQuery, [userId, 'wishes.createDate', 'wishes.purchaseStatus'], function (err, oldWishes) {
      if (err) return done(err)
      return done(null, oldWishes)
    })
  },
  addWish: function (userId, itemData, mustHave, done) {
    pool.query('INSERT INTO items SET ?', itemData, function (err, item) {
      if (err) return done(err, null, { message: 'Unable to add item!' })

      var wishData = {
        itemId: item.insertId,
        userId: userId,
        mustHave: mustHave
      }

      pool.query('INSERT INTO wishes SET ?', wishData, function (err, wish) {
        if (err) return done(err, null, { message: 'Unable to add wish!' })
        return done(null, true, { message: 'Wish Added!' })
      })
    })
  },
  removeWish: function (wishId, done) {
    pool.query('DELETE FROM wishes WHERE wishId = ?', wishId, function (err, wish) {
      if (err) done(err, null, { message: 'Unable to remove wish!' })
      return done(null, true, { message: 'Wish removed.' })
    })
  },
  purchaseWish: function (wishId, done) {
    pool.query('UPDATE wishes SET wishes.purchaseStatus = 1 WHERE wishId = ?', wishId, function (err, wish) {
      if (err) done(err, null, { message: 'Unable to mark wish as purchased!' })
      return done(null, 'Thank you for your purchase!', { message: 'Wish marked as purchased.' })
    })
  },

  // new: fetch metadata from a URL (description + price heuristics)
  fetchItemMetadata: function (url, done) {
    if (!url) return done(new Error('No URL provided'))
    // ensure protocol
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url

    fetch(url, { timeout: 10000 })
      .then(function (res) { return res.text() })
      .then(function (html) {
        var $ = cheerio.load(html)
        var desc = ''
        var price = ''

        // helper: normalize text
        function t (sel) {
          var v = $(sel).first().text() || $(sel).first().attr('content') || ''
          return (v || '').toString().trim()
        }
        // helper: extract currency+number
        function extractPrice (str) {
          if (!str) return ''
          // common patterns: $12.34, £12, 12.34 USD, USD 12.34
          //var m = str.replace(/\u00A0/g, ' ').match(/([$€£¥]?[\d\.,]+(?:\s?[€£¥]|USD|USD)?)/i)
          //if (m) return m[1].trim()
          // fallback: digits only
          var m2 = str.match(/[\d\.,]+/)
          return m2 ? m2[0] : ''
        }

        // basic fallbacks (meta tags + title)
        var ogTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content')
        var metaDesc = $('meta[name="description"]').attr('content')
        var pageTitle = $('title').text()

        // detect host to apply retailer-specific selectors
        var host = ''
        try { host = new URL(url).hostname.toLowerCase() } catch (e) { host = '' }

        if (host.indexOf('amazon.') !== -1) {
          desc = $('#productTitle').text().trim() || metaDesc || ogTitle || pageTitle || metaDesc || ''
          price = t('#priceblock_ourprice') || t('#priceblock_dealprice') || t('#priceblock_saleprice') ||
                  t('#priceblock_pospromoprice') || t('#newBuyBoxPrice') || t('#tp_price_block_total_price_ww') ||
                  t('[data-asin-price]') || t('[id*="price"]') || $('meta[name="price"]').attr('content') || ''
        } else if (host.indexOf('ebay.') !== -1) {
          desc = $('#itemTitle').text().replace(/^Details about\s*/i, '').trim() || ogTitle || pageTitle || metaDesc || ''
          price = t('#prcIsum') || t('#mm-saleDscPrc') || t('.notranslate') || t('[itemprop=price]') || ''
        } else if (host.indexOf('walmart.') !== -1) {
          desc = $('h1.prod-ProductTitle, h1[itemprop=name]').text().trim() || ogTitle || pageTitle || metaDesc || ''
          // price may be split into characteristic/mantissa or in aria-label
          price = t('span.price-characteristic') && t('span.price-mantissa') ? ('$' + t('span.price-characteristic') + '.' + t('span.price-mantissa')) :
                  t('span[itemprop=price]') || t('.price-characteristic') || t('.price-group') || t('.price') || ''
        } else if (host.indexOf('target.') !== -1) {
          desc = $('h1[data-test="product-title"]').text().trim() || ogTitle || pageTitle || metaDesc || ''
          price = t('span[data-test="product-price"]') || t('[data-test=price]') || t('[data-test="price"]') || t('.h-padding-r-tiny') || ''
        } else if (host.indexOf('bestbuy.') !== -1) {
          desc = $('.sku-title h1').text().trim() || ogTitle || pageTitle || metaDesc || ''
          price = t('.priceView-hero-price .sr-only') || t('.priceView-customer-price span') || t('[itemprop=price]') || ''
        } else if (host.indexOf('etsy.') !== -1) {
          desc = $('h1[data-buy-box-listing-title], h1.single-title, h1[itemprop=name]').text().trim() || ogTitle || pageTitle || metaDesc || ''
          price = t('p[data-buy-box-region] .currency-value') || t('.wt-text-title-03 .currency-value') || t('[data-test="price"]') || t('[itemprop=price]') || ''
        } else {
          // generic attempts
          desc = ogTitle || $('meta[name="twitter:description"]').attr('content') || metaDesc || pageTitle || ''
          price = $('meta[property="product:price:amount"]').attr('content') ||
                  $('meta[itemprop="price"]').attr('content') ||
                  $('[itemprop=price]').attr('content') ||
                  t('[class*="price"]') || t('[id*="price"]') || t('[class*="amount"]') || ''
        }

        // remove leading "Amazon.com" prefix if present
        try {
          if (host.indexOf('amazon.') !== -1 && typeof desc === 'string' && desc) {
            desc = desc.replace(/^Amazon\.com\s*[:\-\—–]?\s*/i, '')
          }
        } catch (e) {
          // no-op on unexpected errors
        }

        // final sanitization/normalize
        if (typeof desc === 'string') desc = desc.replace(/\s+/g, ' ').trim()
        if (typeof price === 'string') price = extractPrice(price)

        return done(null, { desc: (desc || '').toString(), price: (price || '').toString() })
      })
      .catch(function (err) {
        return done(err)
      })
  }
}
