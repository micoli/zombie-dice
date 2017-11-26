import * as url	from 'url'
import * as fs from 'fs';
import * as path from 'path'
	
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
}

export const config = (new Config())