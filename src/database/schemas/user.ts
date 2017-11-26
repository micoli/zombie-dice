import * as Mongoose from "mongoose"
import * as bcrypt from "bcrypt-nodejs"
const DEFAULT_USER_PICTURE = "/img/user.jpg"
const SALT_WORK_FACTOR = 10

export interface IUser extends Mongoose.Document {
	username: string;
	password: string;
	socialId: string;
	picture: string;
	validatePassword(requestPassword): boolean;
}

export const UserSchema = new Mongoose.Schema(
{
	username: { type: String, required: true },
	password: { type: String, required: true },
	socialId: { type: String, required: true },
	picture:  { type: String, default:  DEFAULT_USER_PICTURE}
},
{
	timestamps: true
});

UserSchema.methods.validatePassword  = function(password, callback) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		if (err) return callback(err);
		callback(null, isMatch);
	});
};


UserSchema.pre('save', function (next) {
	var user = this;

	// ensure user picture is set
	if(!user.picture){
		user.picture = DEFAULT_USER_PICTURE;
	}

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		// hash the password using our new salt
		bcrypt.hash(user.password, salt, null, function(err, hash) {
			if (err) return next(err);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

export const UserModel = Mongoose.model<IUser>('User', UserSchema);

/*

import * as Mongoose from 'mongoose'
import * as bcrypt from 'bcrypt-nodejs'

const SALT_WORK_FACTOR = 10;
const DEFAULT_USER_PICTURE = "/img/user.jpg";

export interface IUser extends Mongoose.Document {
username: string;
password: string;
socialId: string;
picture: string;
validatePassword(requestPassword): boolean;
}


export const UserSchema = new Mongoose.Schema({
	username: { type: String, required: true},
	password: { type: String, default: null },
	socialId: { type: String, default: null },
	picture:  { type: String, default:  DEFAULT_USER_PICTURE}
});

UserSchema.pre('save', function(next) {
	var user = this;

	// ensure user picture is set
	if(!user.picture){
		user.picture = DEFAULT_USER_PICTURE;
	}

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		// hash the password using our new salt
		bcrypt.hash(user.password, salt, null, function(err, hash) {
			if (err) return next(err);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.validatePassword = function(password, callback) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		if (err) return callback(err);
		callback(null, isMatch);
	});
};

//export const userModel = Mongoose.model('user', UserSchema);
export const UserModel = Mongoose.model<IUser>('User', UserSchema);

*/
