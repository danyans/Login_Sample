var express = require('express');
var passport = require('passport');
var router = express.Router();
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

//password-reset

var libs = process.cwd() + '/libs/';
var config = require(libs + 'controllers/config');
var transport = config.get('transport');
// var nodemailer = require(libs + 'controllers/email');
var User = require(libs+'model/user');

/* Home Page. */
router.get('/', function (req, res) {
    var user = req.session.user;
    if(user){
        res.render('home-v2',{link:'#',home: 'Hi! '+ user.userName});
    }else{
        res.render('home-v2',{link:'/login',home:'Login',username:'' });
    }
});

// function requireLogin (req, res, next) {
//     if (!req.user) {
//         res.render('home-v2',{link:'/login',home:'Login',username:'' });
//     } else {
//       next();
//     }
//   };

// router.get('/',requireLogin,function(req,res){

//     res.render('home-v2',{link:'#',home: 'Hi! '+ req.user.userName});
// });

router.get('/login', function(req, res) {
    res.render('login-v2', {error: req.flash('error'),info: req.flash('info') });
});

router.get('/signup', function(req, res) {
    res.render('signup-v2', {message: req.flash('error') });
});

router.post('/signup', passport.authenticate('signup', {
    successRedirect : '/',
    failureRedirect : '/signup', 
    failureFlash : true 
}));

router.post('/login', passport.authenticate('login', {
    successRedirect : '/', 
    failureRedirect : '/login', 
    failureFlash : true
}));

router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
  });

  router.get('/forget',function(req, res){

    res.render('forget',{error: req.flash('error'), info:req.flash('info')});
  });

  router.post('/forget', function(req, res) {
    async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          User.findOne({ 'email': req.body.email }, function(err, user) {
            if (!user) {
              req.flash('error', 'No account with that email address exists.');
              return res.redirect('/forget');
            }
    
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
            user.save(function(err) {
              done(err, token, user);
            });
          });
        },
        function(token, user, done) {
            var mailOptions = {
                to: user.email,
                from: 'niki.sun@ehealth.com',
                subject: 'Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/'  + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              };
            nodemailer.createTransport(transport).sendMail(mailOptions, function(err){
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                // res.redirect('/forget');
                done(err, 'done');
            });
        }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/forget');
      });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ 'resetPasswordToken': req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forget');
      }
      res.render('reset', {error: req.flash('error'), info:req.flash('info')});
    });
  });


router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function(done) {
          User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('back');
            }
    
            user.password = user.generateHash(req.body.password);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
    
            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);

              });
            });
          });
        },
        function(user, done) {
          var mailOptions = {
            to: user.email,
            from: 'niki.sun@ehealth.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          };
          nodemailer.createTransport(transport).sendMail(mailOptions, function(err){
            req.flash('info', 'Success! Your password has been changed.');
            // res.redirect('/login');
            done(err, 'done');
        });
        }
      ], function(err) {
        res.redirect('/login');
      });
});


module.exports = router;
