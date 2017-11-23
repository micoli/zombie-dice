var expressSession 	= require('express-session');
var cookieSession 	= require('cookie-session');
//var MongoStore	= require('connect-mongo')(expressSession);
var db 		    = require('../database');
var config 		= require('../config');

var init = function () {
	//return cookieSession({ secret: config.sessionSecret, maxAge: 360*5 });
	return expressSession({ secret: config.sessionSecret , key: 'sid', cookie: { secure: true }})

	if(process.env.NODE_ENV === 'production') {
		return expressSession({
			secret: config.sessionSecret,
			resave: true,
			saveUninitialized: true,
			unset: 'destroy',
			cookie: {
				secure: false,
				maxage: 6000000
			},
			proxy: false
			//store: new MongoStore({ mongooseConnection: db.Mongoose.connection })
		});
	} else {
		return expressSession({
			secret: config.sessionSecret,
			resave: true,
			cookie: {
				secure: true,
				maxage: 6000000
			},
			proxy: false,
			unset: 'destroy',
			saveUninitialized: true
		});
	}
}

module.exports = init();

