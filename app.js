var express = require('express')
var session = require('express-session')
var MemoryStore = require('memorystore')(session)
// var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var path = require('path')
var passport = require('passport')
var mustacheExpress = require('mustache-express')

var createError = require('http-errors')
var logger = require('morgan')
var flash = require('connect-flash')
var app = express()

require('./config/passport')(passport) // pass passport for configuration

var indexRouter = require('./routes/index')
var authRouter = require('./routes/auth')
var usersRouter = require('./routes/users')
var loginRouter = require('./routes/login')
var registerRouter = require('./routes/register')
var itemRouter = require('./routes/items')
var friendsRouter = require('./routes/friends')

app.engine('mst', mustacheExpress(path.join(__dirname, 'views/partials'), '.mst'))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'mst')

app.use(logger('dev'))
app.use(express.static(path.join(__dirname, 'public')))
// app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  secret: 'hella-top-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/items', itemRouter)
app.use('/friends', friendsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
