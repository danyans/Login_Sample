var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var flash1 = require('express-flash');
var passport = require('passport');
var session = require('express-session');

// var methodOverride = require('method-override');

var libs = process.cwd() + '/libs/';

// var db = require(libs + 'db/mongoose');
var config = require(libs + 'controllers/config');
var log = require(libs + 'controllers/log')(module);
var api = require('./routes/api');
var apply = require('./routes/apply');
var User = require(libs+'model/user');
require(libs+'controllers/passport')(passport);

var app = express();

//stylus
// var stylus = require('stylus');
// var nib = require('nib');

// function compile(str, path) {
//   return stylus(str)
//     .set('filename', path)
//     .use(nib());
// }

// tell node to compile.styl-files to normal css-files
// app.use(stylus.middleware(
//   { src: process.cwd() + '/public'
//   , compile: compile
//   }
// ))

// set view engine for node.js
app.set('view engine', 'jade')
app.set('views', process.cwd() + '/views')
app.use(express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//add reflash and passport
app.use(flash()); 
app.use(flash1());
app.use(passport.initialize());
app.use(passport.session()); 
app.use(session({secret: '{secret}', name: 'session_id'}));
// , saveUninitialized: true, resave: true
// app.use(methodOverride());
app.use(function(req, res, next) {
    if (req.session && req.session.user) {
      User.findOne({ 'email': req.session.user.email }, function(err, user) {
        if (user) {
          req.user = user;
          delete req.user.password; // delete the password from the session
          req.session.user = user;  //refresh the session value
          res.locals.user = user;
        }
        // finishing processing the middleware and run the route
        next();
      });
    } else {
      next();
    }
  });

app.use('/', api);
app.use('/api',apply);

// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
    res.json({ 
    	error: 'Not found' 
    });
    return;
});

 // error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('%s %d %s', req.method, res.statusCode, err.message);
    res.json({ 
    	error: err.message 
    });
    return;
});




module.exports = app;