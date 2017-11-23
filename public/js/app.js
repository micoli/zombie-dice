(function(){
	'use strict';

	var dwnApp = angular.module('zombieDiceCounterApp', [
		'ui.bootstrap',
		'ui.router',
		'LocalStorageModule'
	]);

	dwnApp.config(['$stateProvider','$urlRouterProvider','$httpProvider',function($stateProvider,$urlRouterProvider,$httpProvider) {
		
		$urlRouterProvider.otherwise("/game");
		
		$httpProvider.interceptors.push('authentication.authInterceptor');

		$stateProvider
		.state('dash', {
			url			: '/',
			templateUrl	: 'partials/home.html',
			resolve : {
				authorize: ['authentication.authorization', function (authorization) {
					return authorization.authorize();
				}]
			}
		})
		.state('game', {
			url			: "/game",
			templateUrl	: 'partials/game.html',
			controller	: 'gameCtrl',
			resolve : {
				authorize: ['authentication.authorization', function (authorization) {
					return authorization.authorize();
				}]
			}
		})
		.state('signin', {
			url: '/connexion',
			templateUrl: "partials/signin.html",
			controller: 'authentication.signinController',
			resolve : {
				authorize : ['authentication.authorization', function (authorization) {
					return authorization.redirectifAuthenticated();
				}]
			}
		})
		.state('accessdenied', {
			url: '/accessdenied',
			templateUrl: "partials/accessdenied.html",
			controller: 'authentication.accessdeniedController'
		})
	}])
	.run(['$rootScope', '$state', '$stateParams',function ($rootScope, $state, $stateParams) {
		$rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
			$rootScope.toState = toState;
			$rootScope.toStateParams = toStateParams;
		});
	}]);
})();
