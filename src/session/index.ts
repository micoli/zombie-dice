var expressSession	= require('express-session');
var cookieSession	= require('cookie-session');
//var MongoStore		= require('connect-mongo')(expressSession);
var db				= require('../database');
import {config} from '../config'

var init = function () {
	//return cookieSession({ secret: config.sessionSecret});

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
			secret : config.sessionSecret , 
			key : 'sid',
			resave : true,
			saveUninitialized : true, 
			maxAge : 360*5 ,
			cookie : {
				secure: false 
			}
		});
	}
}

module.exports = init();