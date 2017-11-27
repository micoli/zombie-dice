import * as Database from "../src/database";


export function createGameDummy(userId?: string, name?: string, description?: string) {
	var user = {
		name: name || "dummy game",
		description: description || "I'm a dummy game!"
	};

	if (userId) {
		user["userId"] = userId;
	}

	return user;
}

export function createUserDummy(email?: string) {
	var user = {
		email: email || "dummy@mail.com",
		name: "Dummy Jones",
		password: "123123"
	};

	return user;
}


export function clearDatabase(database: Database.IDatabase, done: MochaDone) {
	var promiseUser = database.userModel.remove({});
	var promiseGame = database.gameModel.remove({});

	Promise.all([promiseUser, promiseGame]).then(() => {
		done();
	}).catch((error) => {
		console.log(error);
	});
}

export function createSeedGameData(database: Database.IDatabase, done: MochaDone) {
	return database.userModel.create(createUserDummy())
		.then((user) => {
			return Promise.all([
				database.gameModel.create(createGameDummy(user._id, "Game 1", "Some dummy data 1")),
				database.gameModel.create(createGameDummy(user._id, "Game 2", "Some dummy data 2")),
				database.gameModel.create(createGameDummy(user._id, "Game 3", "Some dummy data 3")),
			]);
		}).then((game) => {
			done();
		}).catch((error) => {
			console.log(error);
		});
}

export function createSeedUserData(database: Database.IDatabase, done: MochaDone) {
	database.userModel.create(createUserDummy())
		.then((user) => {
			done();
		})
		.catch((error) => {
			console.log(error);
		});
}

