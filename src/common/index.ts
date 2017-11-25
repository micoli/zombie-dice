'use strict';

import {config} from '../config'
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

/*

import config from '../config'
import * as jwt	from 'jsonwebtoken'

class Common {
	public static createJWTToken (user){
		return  jwt.sign({
			id : user.id,
			name : user.username,
			config : {
				rights : []
			}
		}, config.sessionSecret)
	}
}

export default Common
*/