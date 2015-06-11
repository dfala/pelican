angular.module('pelicanApp')

.controller('searchController', function ($scope, searchPelican) {
	searchPelican.loadAllData();
	$scope.postsResult;

	$scope.searchAPelican = function () {
		$scope.postsResult = searchPelican.searchAPelican($scope.searchQuery);
	}
})