'use strict';
var express 		= require('express');
var app			= express();
var path			= require('path');
var bodyParser	= require('body-parser');
var routes		= require('../app/routes');
var session		= require('../app/session');
var passport		= require('../app/auth');
var ioServer		= require('../app/socket')(app);
var logger		= require('../app/logger');
var config		= require('../app/config');

var port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname+'/../public'));
app.use(session)
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);

app.use(function(req, res, next) {
  res.status(404).sendFile(process.cwd() + '/app/views/404.htm');
});

ioServer.listen(port);