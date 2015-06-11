var app = angular.module('pelicanApp', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	$locationProvider.html5Mode({
		enabled: true,
		requiredBase: false
	});

	$routeProvider
	.when('/', {
		templateUrl: 'templates/search.html',
		controller: 'searchController'
	})

	.when('/profile', {
		templateUrl: 'templates/mainView.html',
		controller: 'mainController'
	})

	.when('/404', {
		templateUrl: 'templates/404.html'
	})

	.otherwise({redirectTo: '/404'});

}]);