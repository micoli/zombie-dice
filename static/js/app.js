(function(){
	'use strict';

	var dwnApp = angular.module('zombieDiceCounterApp', [
		'ui.bootstrap',
		'ui.router',
		'angular-flot'
	]);

	dwnApp.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
		$urlRouterProvider.otherwise("/game");

		$stateProvider
		.state('zombieDice', {
			url			: '/',
			templateUrl	: 'static/partials/home.html'
		})
		.state('zombieDice.game', {
			url			: "game",
			templateUrl	: 'static/partials/game.html',
			controller	: 'gameCtrl'
		})
	}]);
})();
