import * as Mongoose from "mongoose";
import {config} from '../config'
import { IUser, UserModel } from "./schemas/user";

export interface IDatabase {
	userModel: Mongoose.Model<IUser>;
}

export function getDatatase(): IDatabase {

	let dbURI = "mongodb://" +
		encodeURIComponent(config.db.username) + ":" +
		encodeURIComponent(config.db.password) + "@" +
		config.db.host + ":" +
		config.db.port + "/" +
		config.db.name;

	(<any>Mongoose).Promise = Promise;
	Mongoose.connect(process.env.MONGO_URL || dbURI);

	let mongoDb = Mongoose.connection;

	mongoDb.on('error', () => {
		console.log(`Unable to connect to database: ${dbURI}`);
	});

	mongoDb.once('open', () => {
		console.log(`Connected to database: ${dbURI}`);
	});

	return {
		userModel: UserModel
	};
}
