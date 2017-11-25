'use strict';

var express		= require('express');
var router		= express.Router();
var passport		= require('passport');
var jwt			= require('jsonwebtoken');
import {config} from '../config'
var User			= require('../models/user');
var common		= require('../common');
router.get('/', function(req, res, next) {
	// If user is already logged in, then redirect to rooms page
	if(req.isAuthenticated()){
		res.redirect('/index.html');
	}else{
		res.render('login', {
			success: req.flash('success')[0],
			errors: req.flash('error'), 
			showRegisterForm: req.flash('showRegisterForm')[0]
		});
	}
});

router.get('/auth/login', function(req, res, next) {
	console.log('login 11', next);
	passport.authenticate('local', { failWithError: true })(req, res, function(){
	console.log('login 22');
	
	});
);


router.get("/auth/check", passport.authenticate("jwt", {
	session: false
}), function(req, res) {  
	res.json(req.user);
});

router.post('/auth/login', passport.authenticate('local', { failWithError: true }),
	function(req, res, next) {
		return res.json({
			success : true,
			message : '', 
			name : req.user.username,
			token : common.createJWTToken(req.user)
		}); 
	},
	function(err, req, res, next) {
			return res.json({
			success : false,
			message : err.message,
			error : err
		}); 
	}
);

// Register via username and password
router.post('/auth/register', function(req, res, next) {
	var credentials = {'username': req.body.username, 'password': req.body.password };

	if(credentials.username === '' || credentials.password === ''){
		res.json({'success':false,'message': 'Missing credentials'});
	}else{
		// Check if the username already exists for non-social account
		User.findOne({'username': new RegExp('^' + req.body.username + '$', 'i'), 'socialId': null}, function(err, user){
			if(err) throw err;
			if(user){
				res.json({'success':false,'message': 'Username already exists.'});
			}else{
				User.create(credentials, function(err, newUser){
					if(err) throw err;
					res.json({'success':true,'message': 'Your account has been created. Please log in.'});
				});
			}
		});
	}
});

// Social Authentication routes
// 1. Login via Facebook
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', function(req, res, next) {
	passport.authenticate('facebook', function(err, user, info) {
		if (err) { 
			return next(err); 
		}
		if (!user) { 
			return res.redirect('/#/connexion'); 
		}
		return res.redirect('/#/auth/callback/' + common.createJWTToken(user));
	})(req, res, next);
});

// 2. Login via Twitter
router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', function(req, res, next) {
	passport.authenticate('twitter', function(err, user, info) {
		if (err) { 
			return next(err); 
		}
		if (!user) { 
			return res.redirect('/#/connexion'); 
		}
		return res.redirect('/#/auth/callback/' + common.createJWTToken(user));
	})(req, res, next);
});

// Rooms
router.get('/rooms', [User.isAuthenticated, function(req, res, next) {
	Room.find(function(err, rooms){
		if(err) throw err;
		res.render('rooms', { rooms });
	});
}]);

// Chat Room 
router.get('/chat/:id', [User.isAuthenticated, function(req, res, next) {
	var roomId = req.params.id;
	Room.findById(roomId, function(err, room){
		if(err) throw err;
		if(!room){
			return next(); 
		}
		res.render('chatroom', { user: req.user, room: room });
	});
	
}]);

module.exports = router;

/*

import * as express from 'express'
var passport		= require('passport');
var jwt			= require('jsonwebtoken');
var config		= require('../config');
var User			= require('../models/user');
var common		= require('../common');

var router = express.Router();

router.get("/aaa", function(req, res) {  
	res.json({aaa:1});
});

router.get('/', function(req, res, next) {
	if(req.isAuthenticated()){
		res.redirect('/index.html');
	}else{
		res.render('login', {
			success: req.flash('success')[0],
			errors: req.flash('error'), 
			showRegisterForm: req.flash('showRegisterForm')[0]
		});
	}
});

router.get("/auth/check", passport.authenticate("jwt", {
	session: false
}), function(req, res) {  
	res.json(req.user);
});


router.get('/auth/login', function(req, res, next) {
	console.log('login 11',req, res, next);
	passport.authenticate('local', { failWithError: true })(req, res, function(){
	console.log('login 22',arguments);
	
	});
);

router.post('/auth/login', passport.authenticate('local', { failWithError: true }),
	function(req, res, next) {
		console.log('login 2',common.createJWTToken(req.user))
		return res.json({
			success : true,
			message : '', 
			name : req.user.username,
			token : common.createJWTToken(req.user)
		}); 
	},
	function(err, req, res, next) {
			return res.json({
			success : false,
			message : err.message,
			error : err
		}); 
	}
);

// Register via username and password
router.post('/auth/register', function(req, res, next) {
	var credentials = {'username': req.body.username, 'password': req.body.password };

	if(credentials.username === '' || credentials.password === ''){
		res.json({'success':false,'message': 'Missing credentials'});
	}else{
		// Check if the username already exists for non-social account
		User.findOne({'username': new RegExp('^' + req.body.username + '$', 'i'), 'socialId': null}, function(err, user){
			if(err) throw err;
			if(user){
				res.json({'success':false,'message': 'Username already exists.'});
			}else{
				User.create(credentials, function(err, newUser){
					if(err) throw err;
					res.json({'success':true,'message': 'Your account has been created. Please log in.'});
				});
			}
		});
	}
});

// Social Authentication routes
// 1. Login via Facebook
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', function(req, res, next) {
	passport.authenticate('facebook', function(err, user, info) {
		if (err) { 
			return next(err); 
		}
		if (!user) { 
			return res.redirect('/#/connexion'); 
		}
		return res.redirect('/#/auth/callback/' + common.createJWTToken(user));
	})(req, res, next);
});

// 2. Login via Twitter
router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', function(req, res, next) {
	passport.authenticate('twitter', function(err, user, info) {
		if (err) { 
			return next(err); 
		}
		if (!user) { 
			return res.redirect('/#/connexion'); 
		}
		return res.redirect('/#/auth/callback/' + common.createJWTToken(user));
	})(req, res, next);
});

export function init(app){
	app.use('/',router)
}




*/