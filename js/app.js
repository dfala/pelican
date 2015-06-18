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
			passedUserId: function ($location, cookiesService) {
				var cookieId = cookiesService.checkCookie();
				if (cookieId) {
					return {
						userId: cookieId,
						isUser: true
					}
				} else {
					$location.path('/home');
					return undefined;
				}
			}
		}
	})

	.when('/home', {
		templateUrl: 'templates/homeLists.html',
		controller: 'HomeController',
		resolve: {
			passedUserId: function ($location, cookiesService) {
				var cookieId = cookiesService.checkCookie();
				if (cookieId) {
					return cookieId;
				} else {
					return undefined;
				}
			}
		}
	})

	.when('/search', {
		templateUrl: 'templates/search.html',
		controller: 'SearchController'
	})

	.when('/profile/:userId', {
		templateUrl: 'templates/friendList.html',
		controller: 'FriendController',
		resolve: {
			passedUserId: function ($route, $location, cookiesService) {
				if ($route.current.params.userId === cookiesService.checkCookie()) {
					$location.path('/');
				} else {
					return {
						userId: $route.current.params.userId,
						isUser: false
					}
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
			passedUserId: function ($location) {
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