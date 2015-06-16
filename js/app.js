var app = angular.module('pelicanApp', ['ngRoute', 'firebase'])

.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	$locationProvider.html5Mode({
		enabled: true,
		requiredBase: false
	});

	$routeProvider
	.when('/', {
		templateUrl: 'templates/userLists.html',
		controller: 'MainController',
		resolve: {
			passedUserId: function ($rootScope, $location) {
				var userId = document.cookie;
				userId = userId.substring(3);
				if (userId) {
					$rootScope.rootUserId = userId;
					return {
						userId: userId,
						isUser: true
					}
				} else {
					$location.path('/home');
					return null;
				}
			}
		}
	})

	.when('/home', {
		templateUrl: 'templates/homeLists.html',
		controller: 'MainController',
		resolve: {
			passedUserId: function () {
				return null;
			}
		}
	})

	.when('/search', {
		templateUrl: 'templates/search.html',
		controller: 'SearchController'
	})

	.when('/profile/:userId', {
		templateUrl: 'templates/friendList.html',
		controller: 'MainController',
		resolve: {
			passedUserId: function ($route) {
				//$location.path('/')
				return {
					userId: $route.current.params.userId,
					isUser: false
				}
			}
		}
	})

	.when('/profile/:userId/:listId', {
		templateUrl: 'templates/listTemplate.html',
		controller: 'ListController',
		resolve: {
			passedListInfo: function ($route) {
				return $route.current.params;
			}
		}
	})

	.when('/bookmark', {
		templateUrl: 'bookmark/extension.html',
		controller: 'ExtensionController',
		resolve: {
			passedUserId: function ($rootScope, $location) {
				var userId = document.cookie;
				userId = userId.substring(3);
				if (userId) {
					return {
						userId: userId
					}
				} else {
					$location.path('/home');
					return null;
				}
			}
		}
	})

	.when('/404', {
		templateUrl: 'templates/404.html'
	})

	.otherwise({
		redirectTo: '/404'
	});

}]);