// local authentication
// For more details go to https://github.com/jaredhanson/passport-local
var LocalStrategy = require('passport-local').Strategy;

var libs = process.cwd() + '/libs/';

var User = require(libs+'model/user');

module.exports = function(passport) {

    // Maintaining persistent login sessions
    // serialized  authenticated user to the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialized when subsequent requests are made
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

	//login authentication
     passport.use('login', new LocalStrategy({
        usernameField : 'email',
		passReqToCallback : true
	 },
    function(req, email, password, done) {
        process.nextTick(function() {
            User.findOne({ 'email': email}, function(err, user) {
                if (err){ return done(err);}
                if (!user){
					// console.log('User does not exist.');
					return done(null, false, req.flash('error', 'The user does not exist.'));
				}
	
                if (!user.verifyPassword(password)){
                    // console.log('Please enter correct password');
					return done(null, false, req.flash('error', 'Please enter correct password'));

				}				
               else 
                    req.session.user = user;
                    return done(null, user);
            });
        });

    }));

	//signup authentication
     passport.use('signup', new LocalStrategy({
        usernameField : 'email',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        process.nextTick(function() { 
            if (!req.user) {
                User.findOne({'email': email}, function(err, user) {
            	    if (err){ return done(err);}
                    if (user) {
                        // console.log('The user already exists');
                        return done(null, false, req.flash('error', 'The user already exists'));
					} 
					else {
                        var newUser = new User();
                        newUser.userName = req.body.user_name;
                        newUser.email = email,
                        newUser.password = newUser.generateHash(password);
					
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            req.session.user = newUser;
                            return done(null, newUser);
                        });
                    }

                });
            } else {
                var user = req.user;
		        user.userName = req.body.user_name;
                user.email = email;
                user.password = user.generateHash(password);

                user.save(function(err) {
                    if (err)
                        throw err;
                    req.session.user = newUser;
                    return done(null, user);
                });

            }

        });
    }));

};
