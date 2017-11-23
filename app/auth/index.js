'use strict';

var config			= require('../config');
var passport			= require('passport');
var logger			= require('../logger');
var LocalStrategy	= require('passport-local').Strategy;
var FacebookStrategy	= require('passport-facebook').Strategy;
var TwitterStrategy	= require('passport-twitter').Strategy;
var User				= require('../models/user');
var passportJWT		= require("passport-jwt");
var ExtractJwt		= passportJWT.ExtractJwt;
var Strategy			= passportJWT.Strategy;

var params = {
	secretOrKey: config.sessionSecret,
	jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken()
};

var init = function(){

	// Serialize and Deserialize user instances to and from the session.
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	// Plug-in Local Strategy
	passport.use(new LocalStrategy(
	function(username, password, done) {
		User.findOne({ username: new RegExp(username, 'i'), socialId: null }, function(err, user) {
		if (err) { return done(err); }

		if (!user) {
			return done(null, false, { message: 'Incorrect username or password.' });
		}

		user.validatePassword(password, function(err, isMatch) {
				if (err) { return done(err); }
				if (!isMatch){
					return done(null, false, { message: 'Incorrect username or password.' });
				}
				return done(null, user);
		});

		});
	}
	));

	// In case of Facebook, tokenA is the access token, while tokenB is the refersh token.
	// In case of Twitter, tokenA is the token, whilet tokenB is the tokenSecret.
	var verifySocialAccount = function(tokenA, tokenB, data, done) {
		console.log('verifySocialAccount',tokenA, tokenB, data);
		User.findOrCreate(data, function (err, user) {
			if (err) { return done(err); }
			return done(err, user);
		});
	};

	// Plug-in Facebook & Twitter Strategies
	passport.use(new FacebookStrategy(config.facebook, verifySocialAccount));
	passport.use(new TwitterStrategy(config.twitter, verifySocialAccount));

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
			console.log(user,done);

			return done(null, user ? user : false);
		});
	});
	passport.use(strategy);
	return passport;
}

module.exports = init();






