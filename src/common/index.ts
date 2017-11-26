import {config} from '../config'
import * as logger from '../logger'
import * as jwt from 'jsonwebtoken'

export function createJWTToken (user){
	return  jwt.sign({
		id : user.id,
		name : user.username,
		config : {
			rights : []
		}
	}, config.sessionSecret)
}
