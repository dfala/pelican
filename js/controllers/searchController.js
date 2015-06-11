angular.module('pelicanApp')

.controller('searchController', function ($scope, searchPelican, $sce) {
	$scope.postsResult;
	
	// Load all data
	searchPelican.loadAllData();

	// Query the data
	$scope.searchAPelican = function () {
		$scope.postsResult = searchPelican.searchAPelican($scope.searchQuery);
	}

	// Highlighting query matches
	$scope.highlight = function(text, search) {
	    if (!search) {
	        return $sce.trustAsHtml(text);
	    }
	    return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlightedText">' + search + '</span>'));
	};
})