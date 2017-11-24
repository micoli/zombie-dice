'use strict';

var config	= require('../config');
var logger	= require('../logger');
var jwt		= require('jsonwebtoken');

module.exports = function(){
	var exp = {};
	exp.createJWTToken = function(user){
		return  jwt.sign({
			id : user.id,
			name : user.username,
			config : {
				rights : []
			}
		}, config.sessionSecret)
	}
	return exp;
}();