'use strict';


var passport		= require("passport");
var passportJWT	= require("passport-jwt");
var User			= require('../models/user');
var config		= require("../config");
var ExtractJwt	= passportJWT.ExtractJwt;
var Strategy		= passportJWT.Strategy;
var params = {
	secretOrKey: config.sessionSecret,
	jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken()
	/*jwtFromRequest: ExtractJwt.versionOneCompatibility({
		authScheme: 'Bearer'
*/
};

module.exports = function() {
	var strategy = new Strategy(params, function(payload, done) {
		User.findOne({
			_id: payload.id
		}, function(err, user) {
			if (err) { 
				return done(err); 
			}

			if (!user) {
				return done(null, false, { message: 'Incorrect username or password.' });
			}
			console.log(user);
			return done(null, user ? user : false);
		});
	});
	passport.use(strategy);
	return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
        		console.log('authenticate');
            return passport.authenticate("jwt", {
        			session: false
        		});
        }
    };
};
