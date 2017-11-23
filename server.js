'use strict';

// Chat application dependencies
var express 		= require('express');
var app  		= express();
var path 		= require('path');
var bodyParser 	= require('body-parser');

// Chat application components
var routes 		= require('./app/routes');
var session		= require('./app/session');
var passport    = require('./app/auth');
var ioServer 	= require('./app/socket')(app);
var logger 		= require('./app/logger');
var config 		= require('./app/config');

var port = process.env.PORT || 3000;

// View engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


app.use(session().initialize());

app.get("/auth/check", session().authenticate(), function(req, res) {  
	res.json(req.user);
});

app.use('/', routes);

// Middleware to catch 404 errors
app.use(function(req, res, next) {
  res.status(404).sendFile(process.cwd() + '/app/views/404.htm');
});

ioServer.listen(port);