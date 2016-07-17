var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/passport');

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;


var User = mongoose.model('User', {
  name:String,
  passwordHash:String
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




// meat of the blog, setting up passport
app.use(session({secret:"this string should be hidden"}))
passport.use(new localStrategy({
  //these are defualt value, but you can use email as username field
  usernameField:'username',
  passwordField:'password',
},function(username, password, done){
  User.findOne({name:username}, function(err, user){
    console.log(username, password);
    if (err){
      return done(err, null)
    }
    if (!user){
      return done(null, false, {message:'no such user'})
    }
    if (user.passwordHash !== password){
      return done(null, false, {message:'password incorrect'})
    }else{
      
      return done(null,user)
    }
  })
}));


passport.serializeUser(function(user, done){
  return done(null, user._id)
})

passport.deserializeUser(function(id, done){
  User.findById(id, function (err, user) {
    if (err){return done(err, false)}

    return done(null, user)
  })
})



app.use(passport.initialize())
app.use(passport.session())





app.use(function(req, res, next){
  if (req.user){
    console.log('line 88')
    req.user.authenticated = true
  }
  next();
})



app.use('/', function(req, res, next){
  console.log('line97', req.user);
  console.log('line98', req.isAuthenticated());

  next();
},routes);

app.get('/login', function(req, res){
  res.render('login')
})

app.post('/login',
  passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false })
);




app.use('/users', users);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// module.exports = app;

app.listen(8080);