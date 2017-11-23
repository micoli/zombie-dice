(function(){
	'use strict';
	angular
	.module('zombieDiceCounterApp')
	.constant("authentication.AUTH_EVENTS", {
		loginSuccess: "auth-login-success",
		loginFailed: "auth-login-failed",
		logoutSuccess: "auth-logout-success",
		sessionTimeout: "auth-session-timeout",
		notAuthenticated: "auth-not-authenticated",
		notAuthorized: "auth-not-authorized",
		authorized: "auth-authorized"
	})
	.factory("authentication.authService", [ "$q", "$http", "$timeout", "$rootScope", "$location", "$state", "localStorageService", function($q, $http, $timeout, $rootScope, $location, $state, localStorageService) {
		var _rightNotConnected, _currentIdentity, authService, _authenticated = 0;

		authService = {
			userToken : '' 
		};
		
		authService.isIdentityResolved = function() {
			return angular.isDefined(_currentIdentity);
		};
		
		authService.isAuthenticated = function() {
			console.log('_authenticated',_authenticated);
			return _authenticated;
		};
		
		authService.isInAnyRights = function(rights) {
			var i, j;
			rights = angular.isArray(rights) ? rights : [ rights ];
			if (arguments.length > 1) for (i = 1; i < arguments.length; i++) rights.push(arguments[i]);
			try {
				if (!_authenticated || !_currentIdentity.hasOwnProperty("config")) return false;
				if (!_currentIdentity.config.hasOwnProperty("rightSa")) return false;
			} catch (e) {
				return false;
			}
			for (j = 0; j < rights.length; j++) if (_currentIdentity.config.rightSa[rights[j]]) return true;
			return false;
		};
		
		authService.removeAuthenticate = function() {
			_currentIdentity = null;
			_authenticated = null;
			authService.setToken(null);
			localStorageService.remove("token");
		};

		authService.initTokenId = function(token) {
			authService.userToken = token;
			$http.defaults.headers.common["Authorization"] = "Bearer " + token
		}
		
		authService.setTokenId = function(token) {
			authService.initTokenId(token);
			localStorageService.set("token", token);
		};
		
		authService.getTokenId = function() {
			return localStorageService.get("token");
		};
		
		authService.clearTokenId = function() {
			return localStorageService.remove("token");
		};
		
		authService.checkAndLoadIdentity = function() {
			var deferred = $q.defer();
			if (angular.isDefined(_currentIdentity)) {
				deferred.resolve(_currentIdentity);
				return deferred.promise;
			}
			_currentIdentity = null;
			_authenticated = false;
			var token = authService.getTokenId();
			if (token){
					authService.initTokenId(token);
					$http({
					method : "GET",
					url : "auth/check"
				}).success(function(res) {
					authService.setIdentity(token,{
						name : res.username,
						config : {
							rights : []
						}
					})
					deferred.resolve(_currentIdentity);
				}).error(function() {
					deferred.reject(null);
				})
			} else {
				deferred.reject();
			}
			return deferred.promise;
		};
		
		authService.getCurrentIdentity = function() {
			return _currentIdentity;
		};
		
		authService.login = function (credentials) {
			_currentIdentity = null;
			_authenticated = false;
			return $http({
				method: "POST",
				url: "auth/login",
				data: credentials
			}).then(function(res) {
				var deferred = $q.defer();
				try {
					if (res.data.success) {
						authService.setIdentity(res.data.token,{
							name : res.data.name,
							config : {
								rights : []
							}
						});
						deferred.resolve(res.data.id)
					} else {
						deferred.reject(res.data.message);
					}
				} catch (e) {
					deferred.reject(res.data.message);
				}
				return deferred.promise;
			}, function(res) {
				var deferred = $q.defer();
				deferred.reject(res.data.message);
				return deferred.promise;
			});
		};
		
		authService.logout = function() {
			_currentIdentity = null;
			_authenticated = false;
			authService.clearTokenId();
		};
		
		authService.isSessionAuthenticated = function() {
			return $http({
				method: "POST",
				url: "auth/check"
			});
		};

		authService.setIdentity = function(token,identity) {
			_currentIdentity = identity;
			_authenticated = true;
			authService.setTokenId(token);	
		};
		return authService;
	}])
	.factory("authentication.authorization", [ "$rootScope", "$state", "authentication.authService", function($rootScope, $state, authService) {
		return {
			authorize : function() {
				console.log('authorize 1');
				return authService.checkAndLoadIdentity().then(function() {
					var isAuthenticated = authService.isAuthenticated();
					$rootScope.toState.data = $rootScope.toState.data || {};
					if ($rootScope.toState.data.rights && $rootScope.toState.data.rights.length > 0 && !authService.isInAnyRights($rootScope.toState.data.rights)){ 
						if (isAuthenticated) {
							$state.go("accessdenied")
						}
					} else if (!isAuthenticated) {
						$rootScope.returnToState = $rootScope.toState;
						$rootScope.returnToStateParams = $rootScope.toStateParams;
						$state.go("signin");
					}
				});
			},
			redirectifAuthenticated: function() {
				return authService.checkAndLoadIdentity().then(function() {
					if (authService.isAuthenticated()){
						$state.go("dash");
					}
				});
			}
		};
	}])
	.service("authentication.authInterceptor", [ "$rootScope", "$q", "authentication.AUTH_EVENTS", function($rootScope, $q, AUTH_EVENTS) {
			this.responseError = function(response) {
				if (response.data) if (response.data.hasOwnProperty("class") && /AccessDeniedException$/.test(response.data.class)) {
					$rootScope.$broadcast("secureArea:ressourceDenied", {
						message: response.data.message
					});
					return $q.reject(response);
				}
				if (response.config && !/\/auth\/validate$/.test(response.config.url)) {
					var event = {
						401: AUTH_EVENTS.notAuthenticated,
						403: AUTH_EVENTS.notAuthorized,
						419: AUTH_EVENTS.sessionTimeout,
						440: AUTH_EVENTS.sessionTimeout
					}[response.status];
					if (event) $rootScope.$broadcast(event, response);
				}
				return $q.reject(response);
			};
			return this;
	}])
	.controller("authentication.accessdeniedController", [ "$scope", "$stateParams", function($scope, $stateParams) {
		if (angular.isDefined($stateParams.message)){
			$scope.message = $stateParams.message;
		}
	}])
	.controller("authentication.signinController", [ "$rootScope", "$scope", "$state", "$http","localStorageService", "authentication.authService", "$location", function($rootScope, $scope, $state, $http, localStorageService, authService, $location) {
		$scope.data = {
			mode : 'login',
			message :'',
			errorMessage :'',
			rememberCredentials : false
		};
		
		var cred = localStorageService.get("credentials");
		$scope.credentials = cred ? cred : {
			username: "",
			password: ""
		};
		$scope.checkMail = function(mail) {
			return new RegExp("^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,10}$").test(mail);
		};
		
		$scope.login = function (credentials) {
			$scope.data.message='';
			$scope.data.errorMessage='';
			if (!credentials.username || !credentials.password){ 
				$scope.data.errorMessage='formulaire incomplet';
			}else {
				credentials.username = credentials.username.toLowerCase();
				authService
				.login(credentials)
				.then(function(data) {
					if ($scope.data.rememberCredentials && credentials.username && credentials.password){ 
						localStorageService.set("credentials", {
							username: credentials.username,
							password: credentials.password
						})
					}else{
						localStorageService.remove("credentials");
					}
					if ($scope.returnToState && "signin" != $scope.returnToState.name){
						$state.go($scope.returnToState.name, $scope.returnToStateParams)
					}else{
						$state.go("dash");
					}
				}, function(e) {
					$scope.data.errorMessage = e;
				}).catch(function(data) {
					$scope.loginError = true;
				});
			}
		};
		
		$scope.register = function(credentials) {
			$scope.data.message='';
			$scope.data.errorMessage='';
			if (!credentials.username || !credentials.password){ 
				$scope.data.errorMessage='formulaire incomplet';
			}else {
				credentials.username = credentials.username.toLowerCase();
				return $http({
					method: "POST",
					url: "auth/register",
					data: credentials
				}).then(function(res) {
					if(res.data.success){
						$scope.data.mode='login';
						$scope.data.message = res.data.message;
						$scope.data.errorMessage='';
					}else{
						$scope.data.message = '';
						$scope.data.errorMessage=res.data.message;
					}
				}, function(res) {
				});

			}
		};
	}]);
})();