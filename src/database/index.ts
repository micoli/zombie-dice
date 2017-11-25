import {config} from '../config'
import * as Mongoose from 'mongoose'

let dbURI = "mongodb://" + 
			encodeURIComponent(config.db.username) + ":" + 
			encodeURIComponent(config.db.password) + "@" + 
			config.db.host + ":" + 
			config.db.port + "/" + 
			config.db.name;
Mongoose.connect(dbURI);

Mongoose.connection.on('error', function(err) {
	if(err) throw err;
});

global.Promise = require('q').Promise; 
require('mongoose').Promise = global.Promise;

module.exports = { 
	Mongoose, 
	models: {
		user: require('./schemas/user.js'),
		room: require('./schemas/room.js')
	}
};

