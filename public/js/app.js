(function() {
	'use strict';

	var dwnApp = angular.module('zombieDiceCounterApp', [
		'ui.bootstrap',
		'ui.router',
		'LocalStorageModule',
		'btford.socket-io',
		'angular-jwt'
	]);

	dwnApp.config([ '$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {

		$urlRouterProvider.otherwise("/game");

		$httpProvider.interceptors.push('authentication.authInterceptor');

		$stateProvider
			.state('dash', {
				url : '/',
				templateUrl : 'partials/home.html',
				resolve : {
					authorize : [ 'authentication.authorization', function(authorization) {
						return authorization.authorize();
					} ]
				}
			})
			.state('game', {
				url : "/game",
				templateUrl : 'partials/game.html',
				controller : 'gameCtrl',
				resolve : {
					authorize : [ 'authentication.authorization', function(authorization) {
						return authorization.authorize();
					} ]
				}
			})
			.state('signin', {
				url : '/auth',
				templateUrl : "partials/signin.html",
				controller : 'authentication.signinController',
				resolve : {
					authorize : [ 'authentication.authorization', function(authorization) {
						return authorization.redirectifAuthenticated();
					} ]
				}
			})
			.state('authcallback', {
				url : '/auth/callback/:token',
				templateUrl : "partials/blank.html",
				controller : 'authentication.authCallbackController'
			})
			.state('accessdenied', {
				url : '/accessdenied',
				templateUrl : "partials/accessdenied.html",
				controller : 'authentication.accessdeniedController'
			})
	} ]);

	dwnApp.run([ '$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
		$rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
			$rootScope.toState = toState;
			$rootScope.toStateParams = toStateParams;
		});
	} ]);
})();
