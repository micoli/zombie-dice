import * as url	from 'url'
import * as fs from 'fs';
import * as path from 'path'
/*
if(false){
	var init = function () {
	
		if(process.env.NODE_ENV === 'production') {
			var redisURI 		= require('url').parse(process.env.REDIS_URL);
			var redisPassword 	= redisURI.auth.split(':')[1];
			return {
				db: {
					username: process.env.dbUsername,
					password: process.env.dbPassword,
					host: process.env.dbHost,
					port: process.env.dbPort,
					name: process.env.dbName
				},
				sessionSecret: process.env.sessionSecret,
				facebook: {
					clientID: process.env.facebookClientID,
					clientSecret: process.env.facebookClientSecret,
					callbackURL: "/auth/facebook/callback",
					profileFields: ['id', 'displayName', 'photos']
				},
				twitter:{
					consumerKey: process.env.twitterConsumerKey,
					consumerSecret: process.env.twitterConsumerSecret,
					callbackURL: "/auth/twitter/callback",
					profileFields: ['id', 'displayName', 'photos']
				},
				redis: {
					host: redisURI.hostname,
					port: redisURI.port,
					password: redisPassword
				}
			}
		}
		else {
			return require('./config.json');
		}
	}
	
	//module.exports = init();
}else{
*/	
	
	export type dbConfig = {
		username: string
		password: string
		host: string
		port: number
		name: string
	}
	export type facebookConfig = {
		clientID: string
		clientSecret: string
		callbackURL: string
		profileFields: string[]
	}
	
	export type twitterConfig = {
		consumerKey: string
		consumerSecret: string
		callbackURL: string
		profileFields: string[]
	}
	
	export type redisConfig = {
		host: string
		port: number
		password: string
	}
	
	export class Config {
		public db : dbConfig
		public sessionSecret: string
		public facebook : facebookConfig
		public twitter: twitterConfig
		public redis : redisConfig
		
		constructor(){
			if(process.env.NODE_ENV === 'production') {
				let redisURI 		= url.parse(process.env.REDIS_URL)
				let redisPassword 	= redisURI.auth.split(':')[1]
				this.db = {
					username: process.env.dbUsername,
					password: process.env.dbPassword,
					host: process.env.dbHost,
					port: parseInt(process.env.dbPort),
					name: process.env.dbName
				}
				this.sessionSecret= process.env.sessionSecret,
				this.facebook= {
					clientID: process.env.facebookClientID,
					clientSecret: process.env.facebookClientSecret,
					callbackURL: "/auth/facebook/callback",
					profileFields: ['id', 'displayName', 'photos']
				},
				this.twitter = {
					consumerKey: process.env.twitterConsumerKey,
					consumerSecret: process.env.twitterConsumerSecret,
					callbackURL: "/auth/twitter/callback",
					profileFields: ['id', 'displayName', 'photos']
				}
				this.redis = {
					host: redisURI.hostname,
					port: parseInt(redisURI.port),
					password: redisPassword
				}
			}else {
				let config = JSON.parse(fs.readFileSync(path.join(__dirname,'config.json'), 'utf8'));
				this.db = config.db
				this.sessionSecret= config.sessionSecret,
				this.facebook= config.facebook
				this.twitter = config.twitter
				this.redis = config.redis
			}
		}
		/*getConfig(){
			return {
				db : this.db,
				sessionSecret: this.sessionSecret,
				facebook : this.facebook,
				twitter: this.twitter,
				redis : this.redis
			};
		}*/
	}
	module.exports.config = new Config()
	
//}