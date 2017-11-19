(function(){
	'use strict';

	var dwnApp = angular.module('zombieDiceCounterApp', [
		'ui.bootstrap',
		'ui.router'
	]);

	dwnApp.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
		$urlRouterProvider.otherwise("/game");

		$stateProvider
		.state('zombieDice', {
			url			: '/',
			templateUrl	: 'partials/home.html'
		})
		.state('zombieDice.game', {
			url			: "game",
			templateUrl	: 'partials/game.html',
			controller	: 'gameCtrl'
		})
	}]);
})();
