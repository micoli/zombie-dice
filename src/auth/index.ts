'use strict';

//import config from '../config'
import {config} from '../config'
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
	console.log(config);
	// Plug-in Facebook & Twitter Strategies
	passport.use(new FacebookStrategy(config.facebook, verifySocialAccount));
	passport.use(new TwitterStrategy(config.twitter, verifySocialAccount));

	passport.use(new Strategy(params, function(payload, done) {
		console.log('strategy User.findOne');
		return;
		User.findOne({
			_id: payload.id
		}, function(err, user) {
			if (err) {
				return done(err);
			}

			if (!user) {
				return done(null, false, { message: 'Incorrect username or password.' });
			}
			//console.log(user,done);

			return done(null, user ? user : false);
		});
	}));
	return passport;
}

module.exports = init();
/*
import {config} from '../config'
import * as User from '../models/user'
import * as passport from 'passport'
import * as passportJWT from 'passport-jwt'
import * as passportLocal from 'passport-local'
import * as passportFacebook from 'passport-facebook'
import * as passportTwitter from 'passport-twitter'

passport.serializeUser = function(user, done) {
	console.log('passport.serializeUser',done)
	done(null, user.id);
}
	
passport.deserializeUser = function(id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
}

passport.use(new passportLocal.Strategy(function(username, password, done) {
	User.findOne({
		username: new RegExp(username, 'i'), 
		socialId: null 
	}, function(err, user) {
		if (err) { 
			return done(err); 
		}
	
		if (!user) {
			return done(null, false, { message: 'Incorrect username or password1.' });
		}
	
		user.validatePassword(password, function(err, isMatch) {
			if (err) { return done(err); }
			if (!isMatch){
				return done(null, false, { message: 'Incorrect username or password2.' });
			}
			return done(null, user);
		});
	
	});
}))
		
let verifySocialAccount = function (tokenA, tokenB, data, done) : void {
	// In case of Facebook, tokenA is the access token, while tokenB is the refersh token.
	// In case of Twitter, tokenA is the token, whilet tokenB is the tokenSecret.
	User.findOrCreate(data, function (err, user) {
		if (err) { return done(err); }
		return done(err, user);
	});
}
		
passport.use(new passportFacebook.Strategy(config.facebook, verifySocialAccount))
passport.use(new passportTwitter.Strategy(config.twitter, verifySocialAccount))
passport.use(new passportJWT.Strategy({
	secretOrKey: config.sessionSecret,
		jwtFromRequest : passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}, function(payload, done) {
	User.findOne({
		_id: payload.id
	}, function(err, user) {
		if (err) {
		  return done(err);
		}
		if (!user) {
		  return done(null, false, { message: 'Incorrect username or password3.' });
		}
		return done(null, user ? user : false);
	});
}));

module.exports.init = function (app){
	app.use(passport.initialize());
	app.use(passport.session());
}
*/