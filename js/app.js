var app = angular.module('pelicanApp', ['ngRoute', 'firebase'])

.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	$locationProvider.html5Mode({
		enabled: true,
		requiredBase: false
	});

	$routeProvider
	.when('/', {
		templateUrl: 'templates/mainView.html',
		controller: 'mainController'
	})

	.when('/search', {
		templateUrl: 'templates/search.html',
		controller: 'searchController'
	})

	.when('/profile/:userId', {
		templateUrl: 'templates/mainView.html',
		controller: 'mainController',
		resolve: {
			passedUserId: function ($route) {
				return $route.current.params.userId;
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