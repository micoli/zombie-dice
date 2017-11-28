import * as chai from "chai";
import GameController from "../../src/games/game-controller";
import { IGame } from "../../src/games/game";
import { IUser } from "../../src/users/user";
import * as Configs from "../../src/configurations";
import * as Server from "../../src/server";
import * as Database from "../../src/database";
import * as Utils from "../utils";

const configDb = Configs.getDatabaseConfig();
const database = Database.init(configDb);
const assert = chai.assert;
const serverConfig = Configs.getServerConfigs();

describe("TastController Tests", () => {

	let server;

	before((done) => {
		Server.init(serverConfig, database).then((s) => {
			server = s;
			done();
		});
	});

	beforeEach((done) => {
		Utils.createSeedGameData(database, done);
	});

	afterEach((done) => {
		Utils.clearDatabase(database, done);
	});

	it("Get games", (done) => {
		var user = Utils.createUserDummy();

		server.inject({
			method: 'POST', url: serverConfig.routePrefix + '/users/login', payload: {
				email: user.email,
				password: user.password
			}
		}, (res) => {
			assert.equal(200, res.statusCode);
			var login: any = JSON.parse(res.payload);

			server.inject({ method: 'Get', url: serverConfig.routePrefix + '/games', headers: { "authorization": login.token } }, (res) => {
				assert.equal(200, res.statusCode);
				var responseBody: Array<IGame> = JSON.parse(res.payload);
				assert.equal(3, responseBody.length);
				done();
			});
		});
	});

	it("Get single game", (done) => {
		var user = Utils.createUserDummy();

		server.inject({
			method: 'POST', url: serverConfig.routePrefix + '/users/login', payload: {
				email: user.email,
				password: user.password
			}
		}, (res) => {
			assert.equal(200, res.statusCode);
			var login: any = JSON.parse(res.payload);

			database.gameModel.findOne({}).then((game) => {
				server.inject({
					method: 'Get',
					url: serverConfig.routePrefix + '/games/' + game._id,
					headers: { "authorization": login.token }
				}, (res) => {
					assert.equal(200, res.statusCode);
					var responseBody: IGame = JSON.parse(res.payload);
					assert.equal(game.name, responseBody.name);
					done();
				});
			});
		});
	});

	it("Create game", (done) => {
		var user = Utils.createUserDummy();

		server.inject({
			method: 'POST',
			url: serverConfig.routePrefix + '/users/login',
			payload: { email: user.email, password: user.password }
		}, (res) => {
			assert.equal(200, res.statusCode);
			var login: any = JSON.parse(res.payload);

			database.userModel.findOne({ email: user.email }).then((user: IUser) => {
				var game = Utils.createGameDummy();

				server.inject({
					method: 'POST',
					url: serverConfig.routePrefix + '/games',
					payload: game,
					headers: { "authorization": login.token }
				}, (res) => {
					assert.equal(201, res.statusCode);
					var responseBody: IGame = <IGame>JSON.parse(res.payload);
					assert.equal(game.name, responseBody.name);
					assert.equal(game.description, responseBody.description);
					done();
				});
			});
		});
	});

	it("Update game", (done) => {
		var user = Utils.createUserDummy();

		server.inject({
			method: 'POST',
			url: serverConfig.routePrefix + '/users/login',
			payload: { email: user.email, password: user.password }
		}, (res) => {
			assert.equal(200, res.statusCode);
			var login: any = JSON.parse(res.payload);

			database.gameModel.findOne({}).then((game) => {

				var updateGame = {
					completed: true,
					name: game.name,
					description: game.description
				};

				server.inject({
					method: 'PUT',
					url: serverConfig.routePrefix + '/games/' + game._id,
					payload: updateGame,
					headers: { "authorization": login.token }
				},
					(res) => {
						assert.equal(200, res.statusCode);
						console.log(res.payload);
						var responseBody: IGame = JSON.parse(res.payload);
						assert.isTrue(responseBody.completed);
						done();
					});
			});
		});
	});

	it("Delete single game", (done) => {
		var user = Utils.createUserDummy();

		server.inject({
			method: 'POST',
			url: serverConfig.routePrefix + '/users/login',
			payload: { email: user.email, password: user.password }
		}, (res) => {
			assert.equal(200, res.statusCode);
			var login: any = JSON.parse(res.payload);

			database.gameModel.findOne({}).then((game) => {
				server.inject({
					method: 'DELETE',
					url: serverConfig.routePrefix + '/games/' + game._id,
					headers: { "authorization": login.token }
				}, (res) => {
					assert.equal(200, res.statusCode);
					var responseBody: IGame = JSON.parse(res.payload);
					assert.equal(game.name, responseBody.name);

					database.gameModel.findById(responseBody._id).then((deletedGame) => {
						assert.isNull(deletedGame);
						done();
					});
				});
			});
		});
	});
});
