(function() {
	'use strict';
	angular
		.module('zombieDiceCounterApp')

		.factory('mySocket', ['socketFactory','$rootScope',function(socketFactory, $rootScope) {
			var myIoSocket = io.connect('/chatroom');

			var mySocket = socketFactory({
				ioSocket : myIoSocket
			});
			mySocket.forward('someEvent');

			$rootScope.$on('authentication:login', function(evt, args) {
				mySocket.emit('login', args.token);
			});

			$rootScope.$on('authentication:logout', function(evt, args) {
				mySocket.emit('logout');
			});

			return mySocket;
		}])

		.controller('navCtrl', [ '$scope', '$state', 'authentication.authService','mySocket', function($scope, $state, authService,mySocket) {
			mySocket.emit('join', {
				a : 1
			}, function() {
				console.log('cb join');
			})
			$scope.$on('socket:someEvent', function(ev, data) {
				console.log(ev, data);
			});

			$scope.$on('authentication:login', function(evt, args) {
				$scope.user = args;
			});

			$scope.$on('authentication:logout', function(evt, args) {
				$scope.user = null;
			});

			$scope.logout = function() {
				authService.logout()
				$state.go("dash");
			};

		} ])

		.controller('gamesListCtrl', function($scope, $uibModal, $http) {
			$scope.refresh = function() {
				$scope.games = [];
			}
			$scope.refresh();
		})

		.controller('gameCtrl', function($scope, $http) {
			var drawGraph = function(data) {
				var svg = d3.select(document.getElementById("results-render-0"));
				svg.selectAll("*").remove();
				var margin = {
					top : 10,
					right : 50,
					bottom : 30,
					left : 10
				};
				var datas = [];
				var allMaxValue = 0;
				var maxRounds = {};
				_.each(data, function(serie) {
					_.each(serie, function(v) {
						datas.push({
							round : v.round,
							score : v.totalScore
						});
						maxRounds[v.key] = v.round;
						if (v.totalScore > allMaxValue) {
							allMaxValue = v.totalScore;
						}
					});
				});

				var width = +svg._nodes[0][0].clientWidth - margin.left - margin.right;
				var height = +svg._nodes[0][0].clientHeight - margin.top - margin.bottom;
				var labelPadding = 3;

				var g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var x = d3
					.scalePoint()
					.domain(_.range(0, data[0].length))
					.range([ 0, width ]);

				var y = d3
					.scaleLinear()
					.domain([ 0, allMaxValue ])
					.range([ height, 0 ]);

				var z = d3.scaleCategory10();
				g.append("g")
					.attr("class", "axis axis--x")
					.attr("transform", "translate(0," + height + ")")
					.call(d3.axisBottom(x));

				var serie = g.selectAll(".serie")
					.data(data)
					.enter().append("g")
					.attr("class", "serie");

				serie.append("path")
					.attr("class", "line")
					.style("stroke", function(d) {
						return z(d[0].key);
					})
					.attr("d", d3.line()
						.x(function(d) {
							return x(d.round);
						})
						.y(function(d) {
							return y(d.totalScore);
						})
				);

				var label = serie
					.selectAll(".label")
					.data(function(d) {
						return d;
					})
					.enter().append("g")
					.attr("class", "label")
					.attr("transform", function(d, i) {
						return "translate(" + x(d.round) + "," + y(d.totalScore) + ")";
					});

				label.append("text")
					.attr("dy", ".35em")
					.each(function(d) {
						d3.select(this)
							.append("tspan")
							.attr("x", 0)
							.attr("dy", "1.2em")
							.text(function(d) {
								return d.totalScore;
							});
						d3.select(this)
							.append("tspan")
							.attr("x", 0)
							.attr("dy", "1.2em")
							.text(function(d) {
								return (d.data ? d.data.brains + '/' + d.data.bangs : '');
							});
					})
					.filter(function(d, i) {
						return i === maxRounds[d.key];
					})
					.append("tspan")
					.attr("class", "label-key")
					.text(function(d) {
						return " " + d.key;
					});

				label.append("rect", "text")
					.datum(function() {
						return this.nextSibling.getBBox();
					})
					.attr("x", function(d) {
						return d.x - labelPadding;
					})
					.attr("y", function(d) {
						return d.y - labelPadding;
					})
					.attr("width", function(d) {
						return d.width + 2 * labelPadding;
					})
					.attr("height", function(d) {
						return d.height + 2 * labelPadding;
					});
			};

			var names = [
				'Adam', 'Adrian', 'Alan', 'Alexander', 'Andrew', 'Anthony', 'Austin', 'Benjamin', 'Blake', 'Boris', 'Brandon',
				'Brian', 'Cameron', 'Carl', 'Charles', 'Christian', 'Christopher', 'Colin', 'Connor', 'Dan', 'David', 'Dominic', 'Dylan',
				'Edward', 'Eric', 'Evan', 'Frank', 'Gavin', 'Gordon', 'Harry', 'Ian', 'Isaac', 'Jack', 'Jacob', 'Jake', 'James', 'Jason',
				'Joe', 'John', 'Jonathan', 'Joseph', 'Joshua', 'Julian', 'Justin', 'Keith', 'Kevin', 'Leonard', 'Liam', 'Lucas', 'Luke',
				'Matt', 'Max', 'Michael', 'Nathan', 'Neil', 'Nicholas', 'Oliver', 'Owen', 'Paul', 'Peter', 'Phil', 'Piers', 'Richard',
				'Robert', 'Ryan', 'Sam', 'Sean', 'Sebastian', 'Simon', 'Stephen', 'Steven', 'Stewart', 'Thomas', 'Tim', 'Trevor', 'Victor',
				'Warren', 'William', 'Abigail', 'Alexandra', 'Alison', 'Amanda', 'Amelia', 'Amy', 'Andrea', 'Angela', 'Anna', 'Anne', 'Audrey',
				'Ava', 'Bella', 'Bernadette', 'Carol', 'Caroline', 'Carolyn', 'Chloe', 'Claire', 'Deirdre', 'Diana', 'Diane', 'Donna', 'Dorothy',
				'Felicity', 'Fiona', 'Gabrielle', 'Grace', 'Hannah', 'Heather', 'Irene', 'Jan', 'Jane', 'Jasmine', 'Jennifer', 'Jessica', 'Joan',
				'Joanne', 'Julia', 'Karen', 'Katherine', 'Kimberly', 'Kylie', 'Lauren', 'Leah', 'Lillian', 'Lily', 'Lisa', 'Madeleine', 'Maria', 'Mary',
				'Megan', 'Melanie', 'Michelle', 'Molly', 'Natalie', 'Nicola', 'Olivia', 'Penelope', 'Pippa', 'Rachel', 'Rebecca', 'Rose', 'Ruth', 'Sally',
				'Samantha', 'Sarah', 'Sonia', 'Sophie', 'Stephanie', 'Sue', 'Theresa', 'Tracey', 'Una', 'Vanessa', 'Victoria',
				'Virginia', 'Wanda', 'Wendy', 'Yvonne', 'Zoe', 'Elizabeth', 'Ella', 'Emily', 'Emma', 'Faith'
			];

			$scope.getNumber = function(n) {
				return new Array(n);
			};

			var getName = function() {
				return _.sample(names);
			};

			$scope.settings = function(b) {
				$scope.settingMode = b;
			};
			$scope.settings(false);

			var newPlayer = function(name) {
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
			}
			;

			$scope.initGame = function() {
				$scope.data = {};
				$scope.data.rounds = []
				$scope.data.players = [ newPlayer(getName()) ];
				$scope.nextPlayer();
			};

			$scope.newGame = function() {
				$scope.data.rounds = [];
				$scope.data.currentPlayer = $scope.data.players[$scope.data.players.indexOf($scope.data.currentPlayer) + 1];
				$scope.nextPlayer();
			};

			$scope.nextPlayer = function() {
				if ($scope.data.players.indexOf($scope.data.currentPlayer) == $scope.data.players.length - 1 || $scope.data.rounds.length == 0) {
					$scope.addRound();
				} else {
					$scope.data.currentPlayer = $scope.data.players[$scope.data.players.indexOf($scope.data.currentPlayer) + 1];
				}
				if (!$scope.data.currentRound.scores.hasOwnProperty($scope.data.currentPlayer.id)) {
					$scope.data.currentRound.scores[$scope.data.currentPlayer.id] = {
						brains : 0,
						bangs : 0,
						score : 0
					};
				}
				$scope.data.currentPlayerScore = $scope.data.currentRound.scores[$scope.data.currentPlayer.id];
				window.setTimeout($scope.displayScore, 200);
			}

			$scope.addRound = function() {
				$scope.data.rounds.push({
					id : guid(),
					ts : Date.now(),
					scores : {}
				});
				$scope.data.currentPlayer = $scope.data.players[0];
				$scope.data.currentRound = $scope.data.rounds[$scope.data.rounds.length - 1]
			};

			$scope.addPlayer = function() {
				$scope.data.players.push(newPlayer(getName()));
			};

			$scope.removePlayer = function(playerId) {
				var wasCurrent = $scope.data.currentPlayer.id == playerId;
				$scope.data.players = _.filter($scope.data.players, function(v) {
					return v.id != playerId
				});
				if (wasCurrent) {
					$scope.data.currentPlayer = $scope.data.players[0];
				}
			};

			$scope.score = function(type, n) {
				var roundData = $scope.data.currentRound.scores[$scope.data.currentPlayer.id];
				roundData[type] += n;
				if (roundData[type] < 0) {
					roundData[type] = 0;
				}
				roundData.score = (roundData.bangs >= 3) ? 0 : roundData.brains;
				$scope.displayScore();
			};

			$scope.displayScore = function() {
				$scope.graphicalScores = [];
				$scope.data.players = _.map($scope.data.players, function(v) {
					v.score = 0;
					var playerScores = [ {
						key : v.name,
						round : 0,
						totalScore : 0
					} ];
					_.each($scope.data.rounds, function(r, kround) {
						_.each(r.scores, function(s, k) {
							if (k == v.id) {
								v.score += s.score;
								playerScores.push({
									key : v.name,
									round : kround + 1,
									totalScore : v.score,
									data : s
								});
							}
						});
					});
					$scope.graphicalScores.push(playerScores);
					return v;
				});
				drawGraph($scope.graphicalScores);
			};

			$scope.setCurrentRoundAndPlayer = function(round, player) {
				$scope.data.currentPlayer = player;
				$scope.data.currentRound = round;
				$scope.data.currentPlayerScore = $scope.data.currentRound.scores[$scope.data.currentPlayer.id]
			}
			$scope.initGame();
		});
})();
