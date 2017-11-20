(function(){
	'use strict';
	angular
	.module('zombieDiceCounterApp')
	.factory('minirouter', function($http) {
		var app={};
		return app;
	})
	.controller('gamesListCtrl',function($scope,$uibModal,$http,minirouter){
		$scope.refresh = function(){
			/*$http.get('/get', {})
			.then(
			function(response){
				$scope.data = response.data;
				console.log($scope.data);
			});*/
			$scope.games = [];
		}
		$scope.refresh();
	})
	.controller('gameCtrl',function($scope,$http,minirouter){
		var names = [
			'Adam','Adrian','Alan','Alexander','Andrew','Anthony','Austin','Benjamin','Blake','Boris','Brandon',
			'Brian','Cameron','Carl','Charles','Christian','Christopher','Colin','Connor','Dan','David','Dominic','Dylan',
			'Edward','Eric','Evan','Frank','Gavin','Gordon','Harry','Ian','Isaac','Jack','Jacob','Jake','James','Jason',
			'Joe','John','Jonathan','Joseph','Joshua','Julian','Justin','Keith','Kevin','Leonard','Liam','Lucas','Luke',
			'Matt','Max','Michael','Nathan','Neil','Nicholas','Oliver','Owen','Paul','Peter','Phil','Piers','Richard',
			'Robert','Ryan','Sam','Sean','Sebastian','Simon','Stephen','Steven','Stewart','Thomas','Tim','Trevor','Victor',
			'Warren','William','Abigail','Alexandra','Alison','Amanda','Amelia','Amy','Andrea','Angela','Anna','Anne','Audrey',
			'Ava','Bella','Bernadette','Carol','Caroline','Carolyn','Chloe','Claire','Deirdre','Diana','Diane','Donna','Dorothy',
			'Felicity','Fiona','Gabrielle','Grace','Hannah','Heather','Irene','Jan','Jane','Jasmine','Jennifer','Jessica','Joan',
			'Joanne','Julia','Karen','Katherine','Kimberly','Kylie','Lauren','Leah','Lillian','Lily','Lisa','Madeleine','Maria','Mary',
			'Megan','Melanie','Michelle','Molly','Natalie','Nicola','Olivia','Penelope','Pippa','Rachel','Rebecca','Rose','Ruth','Sally',
			'Samantha','Sarah','Sonia','Sophie','Stephanie','Sue','Theresa','Tracey','Una','Vanessa','Victoria',
			'Virginia','Wanda','Wendy','Yvonne','Zoe','Elizabeth','Ella','Emily','Emma','Faith'
		];
		
		$scope.getNumber = function(n){
			return new Array(n);   	
		};
		
		var getName = function(){
			return _.sample(names); 
		};

		$scope.settings = function(b){
			$scope.settingMode = b;
		};
		$scope.settings(false);
		
		var newPlayer = function(name){
			return {
				id : guid(),
				name : name,
				score : 0
			};
		};
		
		function guid() {
			function s4() {
			    return Math.floor((1 + Math.random()) * 0x10000)
			        .toString(16)
			        .substring(1);
			}
		    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		};
		
		$scope.initGame = function(){
			$scope.data={};
			$scope.data.rounds=[]
			$scope.data.players=[newPlayer(getName())];
			$scope.nextPlayer();
		};

		$scope.newGame = function(){
			$scope.data.rounds=[];
			$scope.data.currentPlayer = $scope.data.players[$scope.data.players.indexOf($scope.data.currentPlayer)+1];
			$scope.nextPlayer();
		};
		
		$scope.nextPlayer = function(){
			if($scope.data.players.indexOf($scope.data.currentPlayer) == $scope.data.players.length-1 || $scope.data.rounds.length==0){
				$scope.addRound();
			}else{
				$scope.data.currentPlayer = $scope.data.players[$scope.data.players.indexOf($scope.data.currentPlayer)+1];
			}
			if(!$scope.data.currentRound.scores.hasOwnProperty($scope.data.currentPlayer.id)){
				$scope.data.currentRound.scores[$scope.data.currentPlayer.id]={
					brains:0,
					bangs:0,
					score:0						
				};
			}
			$scope.data.currentPlayerScore = $scope.data.currentRound.scores[$scope.data.currentPlayer.id]
		}
		
		$scope.addRound = function(){
			$scope.data.rounds.push({
				id:guid(),
				ts:Date.now(),
				scores:{}
			});
			$scope.data.currentPlayer = $scope.data.players[0];
			$scope.data.currentRound = $scope.data.rounds[$scope.data.rounds.length-1]
		};
		
		$scope.addPlayer = function(){
			$scope.data.players.push(newPlayer(getName()));	
		};
		
		$scope.removePlayer = function(player){
			var wasCurrent = $scope.data.currentPlayer=player;
			$scope.data.players = _.without($scope.data.players,player);
			if(wasCurrent){
				$scope.data.currentPlayer = $scope.data.players;	
			}
		};
		
		$scope.score = function(type,n){
			var roundData = $scope.data.currentRound.scores[$scope.data.currentPlayer.id];
			roundData[type]+=n;
			if(roundData[type]<0){
				roundData[type]=0;
			}
			roundData.score = (roundData.bangs>=3)?0:roundData.brains;
			$scope.data.players = _.map($scope.data.players,function(v){
				v.score = 0;
				_.each($scope.data.rounds,function(r){
					_.each(r.scores,function(s,k){
						if(k == v.id){
							v.score+=s.score;	
						}
					});
					
				});
				return v;
			});
		};
		
		$scope.initGame();
	})
})();