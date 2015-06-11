angular.module('pelicanApp')

.controller('searchController', function ($scope, searchPelican, $sce) {
	$scope.postsResult;
	searchPelican.loadAllData();

	$scope.searchAPelican = function () {
		$scope.postsResult = searchPelican.searchAPelican($scope.searchQuery);
	}

		// Highlighting text
	$scope.highlight = function(text, search) {
	    console.log(text, search);
	    if (!search) {
	        return $sce.trustAsHtml(text);
	    }
	    return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlightedText">' + search + '</span>'));
	};
})