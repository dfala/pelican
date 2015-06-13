var app = angular.module('pelicanApp', ['ngRoute', 'firebase'])

// .constant('loggedInUser', {
// 	userId: (function () {
// 				var appRef = new Firebase("https://pelican.firebaseio.com/");

// 				appRef.authWithOAuthPopup("facebook", function(error, authData) {
// 					if (error) {
// 						console.error("Login Failed!", error);
// 					} else {
// 						console.log(authData);
// 						return authData;
// 					}
// 				},{
// 					scope: 'email,user_likes'
// 				});
// 			})()
// })

.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	$locationProvider.html5Mode({
		enabled: true,
		requiredBase: false
	});

	$routeProvider
	.when('/', {
		templateUrl: 'templates/userLists.html',
		controller: 'mainController',
		resolve: {
			passedUserId: function () {
				return null;
			}
		}
	})

	.when('/home', {
		templateUrl: 'templates/homeLists.html',
		controller: 'mainController',
		resolve: {
			passedUserId: function () {
				return null;
			}
		}
	})

	.when('/search', {
		templateUrl: 'templates/search.html',
		controller: 'searchController'
	})

	.when('/profile/:userId', {
		templateUrl: 'templates/friendList.html',
		controller: 'mainController',
		resolve: {
			passedUserId: function ($route) {
				//$location.path('/')
				return $route.current.params.userId;
			}
		}
	})

	.when('/profile/:userId/:listId', {
		templateUrl: 'templates/listTemplate.html',
		controller: 'listController',
		resolve: {
			passedListInfo: function ($route) {
				return $route.current.params;
			}
		}
	})

	.when('/404', {
		templateUrl: 'templates/404.html'
	})

	.otherwise({
		redirectTo: '/'
	});

}]);