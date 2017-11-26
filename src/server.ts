'use strict';
var express 		= require('express');
var app			= express();
var path			= require('path');
var bodyParser	= require('body-parser');
var routes		= require('./routes');
var session		= require('./session');
var passport		= require('./auth');
var ioServer		= require('./socket')(app);
var logger		= require('./logger');
var config		= require('./config');

var port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname+'/../../public'));
app.use(session)
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);

app.use(function(req, res, next) {
	res.status(404).sendFile(process.cwd() + '/app/views/404.htm');
});

ioServer.listen(port);
/*

import * as express from 'express'
let app	= express()
import * as path	 from 'path'
import * as bodyParser from 'body-parser'
//import * as routes from './routes'
var passport		= require('./auth');
var routes = require('./routes');
import * as session from './session'
import * as auth	  from './auth'

let ioServer	 = require  ('./socket') (app)

let port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname+'/../../public'));
app.use(session)
//auth.init(app)
app.use(passport.initialize());
app.use(passport.session());

//app.use('/', routes);
app.use('/', routes);
//routes.init(app)

app.use(function(req, res, next) {
	res.status(404).sendFile(process.cwd() + '/app/views/404.htm');
});

ioServer.listen(port);
*/
