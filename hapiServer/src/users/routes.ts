import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Joi from "joi";
import UserController from "./user-controller";
import { UserModel } from "./user";
import * as UserValidator from "./user-validator";
import { IDatabase } from "../database";
import { IServerConfigurations } from "../configurations";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: IDatabase) {

	const userController = new UserController(serverConfigs, database);
	server.bind(userController);

	server.route({
		method: 'GET',
		path: '/users/info',
		config: {
			handler: userController.infoUser,
			auth: "jwt",
			tags: ['api', 'users'],
			description: 'Get user info.',
			validate: {
				headers: UserValidator.jwtValidator,
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'User founded.'
						},
						'401': {
							'description': 'Please login.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'DELETE',
		path: '/users',
		config: {
			handler: userController.deleteUser,
			auth: "jwt",
			tags: ['api', 'users'],
			description: 'Delete current user.',
			validate: {
				headers: UserValidator.jwtValidator
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'User deleted.',
						},
						'401': {
							'description': 'User does not have authorization.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'PUT',
		path: '/users',
		config: {
			handler: userController.updateUser,
			auth: "jwt",
			tags: ['api', 'users'],
			description: 'Update current user info.',
			validate: {
				payload: UserValidator.updateUserModel,
				headers: UserValidator.jwtValidator
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'Updated info.',
						},
						'401': {
							'description': 'User does not have authorization.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'POST',
		path: '/users',
		config: {
			handler: userController.createUser,
			tags: ['api', 'users'],
			description: 'Create a user.',
			validate: {
				payload: UserValidator.createUserModel
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'201': {
							'description': 'User created.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'POST',
		path: '/users/login',
		config: {
			handler: userController.loginUser,
			tags: ['api', 'users'],
			description: 'Login a user.',
			validate: {
				payload: UserValidator.loginUserModel
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'User logged in.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'GET',
		path: '/users/auth/twitter',
		config: {
			tags	: ['api', 'users'],
			auth	: 'twitter',
			description: 'authenticate through twitter.',
			handler: function(request, reply) {
				if (!request.auth.isAuthenticated) {
					return reply({'Authentication failed: ' : request.auth.error.message});
				}

				//Just store a part of the twitter profile information in the session as an example. You could do something
				//more useful here - like loading or setting up an account (social signup).
				const profile = request.auth.credentials.profile;
				console.log(profile);
/*
				request.cookieAuth.set({
					twitterId: profile.id,
					username: profile.username,
					displayName: profile.displayName
				});
*/
				return reply.redirect('/toto');
			}
		}
	});
}
