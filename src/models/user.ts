import { IUser } from "../database/schemas/user";
import { IDatabase,getDatatase } from "../database";

let database = getDatatase();

export function create (data, callback){
	var newUser = new database.userModel(data);
	newUser.save(callback);
};

export function findOne (data, callback){
	console.log('findOne')
	database.userModel.findOne(data, callback);
}

export function findById  (id, callback){
	database.userModel.findById(id, callback);
}

/**
 * Find a user, and create one if doesn't exist already.
 * This method is used ONLY to find user accounts registered via Social Authentication.
 *
 */
export function findOrCreate (data, callback){
	findOne({'socialId': data.id}, function(err, user){
		if(err) {
			return callback(err);
		}
		if(user){
			return callback(err, user);
		} else {
			var userData = {
				username: data.displayName,
				socialId: data.id,
				picture: data.photos[0].value || null
			};

			// To avoid expired Facebook CDN URLs
			// Request user's profile picture using user id
			// @see http://stackoverflow.com/a/34593933/6649553
			if(data.provider == "facebook" && userData.picture){
				userData.picture = "http://graph.facebook.com/" + data.id + "/picture?type=large";
			}

			create(userData, function(err, newUser){
				callback(err, newUser);
			});
		}
	});
}

export function isAuthenticated  (req, res, next) {
	if(req.isAuthenticated()){
		next();
	}else{
		res.redirect('/');
	}
}

/*
module.exports = {
	create,
	findOne,
	findById,
	findOrCreate,
	isAuthenticated
};
*/

/*


import * as user from '../database/schemas/user'

export function create (data, callback){
	let newUser = new user.User(data);
	//console.log('newUser',newUser,data,callback);
	newUser.save(callback);
};

export function findOne (data, callback){
	user.User.findOne(data, callback);
}

export function findById (id, callback){
	user.User.findById(id, callback);
}

export function findOrCreate (data, callback){
	findOne({'socialId': data.id}, function(err, user){
		if(err) { return callback(err); }
		if(user){
			return callback(err, user);
		} else {
			let userData = {
				username: data.displayName,
				socialId: data.id,
				picture: data.photos[0].value || null
			};

			// To avoid expired Facebook CDN URLs
			// Request user's profile picture using user id
			// @see http://stackoverflow.com/a/34593933/6649553
			if(data.provider == "facebook" && userData.picture){
				userData.picture = "http://graph.facebook.com/" + data.id + "/picture?type=large";
			}

			create(userData, function(err, newUser){
				callback(err, newUser);
			});
		}
	});
}

export function isAuthenticated (req, res, next) {
	if(req.isAuthenticated()){
		next();
	}else{
		res.redirect('/');
	}
}
*/
