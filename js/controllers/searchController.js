angular.module('pelicanApp')

.controller('SearchController', function ($scope, searchPelican, $sce, userInfoService) {
	$scope.postsResult;
	
	// Load all data
	searchPelican.loadAllData();

	// Check for user logged in
	$scope.activeUser = userInfoService.serveUser().user;
	$scope.lists = userInfoService.serveUser().lists;

	// Query the data
	$scope.searchAPelican = function () {
		$scope.postsResult = searchPelican.searchAPelican($scope.searchQuery);
	}

	// Highlighting query matches
	$scope.highlight = function(text, search) {
	    if(!text) return;

	    if (!search) {
	        return $sce.trustAsHtml(text);
	    }
	    return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlightedText">' + search + '</span>'));
	};
})