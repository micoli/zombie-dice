//import config from '../config'
//var passport			= require('passport');
//var LocalStrategy		= require('passport-local').Strategy;
//var FacebookStrategy	= require('passport-facebook').Strategy;
//var TwitterStrategy	= require('passport-twitter').Strategy;
//var User				= require('../models/user');
//var passportJWT		= require("passport-jwt");
//let LocalStrategy		= passportLocal.Strategy
//let FacebookStrategy	= passportFacebook.Strategy
//let TwitterStrategy	= passportTwitter.Strategy
//let ExtractJwt			= passportJWT.ExtractJwt;
//let Strategy			= passportJWT.Strategy;

import { config } from '../config'

import * as passport from 'passport'
import * as passportLocal from 'passport-local'
import * as passportFacebook from 'passport-facebook'
import * as passportTwitter from 'passport-twitter'
import * as User from '../models/user'
import * as passportJWT from 'passport-jwt'

module.exports = (function(){
	// Serialize and Deserialize user instances to and from the session.
	passport.serializeUser(function(user, done) {
		console.log('passport.serializeUser');
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		console.log('passport.deserializeUser');
		User.findById(id, function (err, user) {
			console.log('User.findById');
			done(err, user);
		});
	});

	passport.use(new passportLocal.Strategy(function(username, password, done) {
		console.log(4545);
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
	}));

	// In case of Facebook, tokenA is the access token, while tokenB is the refersh token.
	// In case of Twitter, tokenA is the token, whilet tokenB is the tokenSecret.
	var verifySocialAccount = function(tokenA, tokenB, data, done) {
		console.log('verifySocialAccount');
		User.findOrCreate(data, function (err, user) {
			if (err) { return done(err); }
			return done(err, user);
		});
	};

	passport.use(new passportFacebook.Strategy(config.facebook, verifySocialAccount));
	passport.use(new passportTwitter.Strategy(config.twitter, verifySocialAccount));
	passport.use(new passportJWT.Strategy({
		secretOrKey: config.sessionSecret,
		jwtFromRequest : passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
	}, function(payload, done) {
		console.log('strategy User.findOne');
		User.findOne({
			_id: payload.id
		}, function(err, user) {
			if (err) {
				return done(err);
			}

			if (!user) {
				return done(null, false, { message: 'Incorrect username or password.' });
			}

			return done(null, user ? user : false);
		});
	}));
	return passport;
})();
