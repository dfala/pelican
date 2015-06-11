angular.module('pelicanApp')

.directive('activeSearch', function ($timeout) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {

			// Focus cursor on input field
			$timeout(function () {
				$('#search-input').focus();
			})

			// Expand when solutions appear
			scope.$watch('postsResult', function (newVal, oldVal) {
				if (newVal !== oldVal && newVal.length > 0) {
					elem.animate({height: "250px"}, 300);
					$('#search-description').animate({margin: '0 0 10px 0'}, 300);
				}
			})

			// Shrink when search is empty
			scope.$watch('searchQuery', function (newVal, oldVal) {
				if (newVal !== oldVal && !newVal) {
					elem.animate({height: "100vh"}, 300);
					$('#search-description').animate({margin: '0 0 40px 0'}, 300);
					
					scope.postsResult = [];
					scope.noResults = false;
					$('#no-results').fadeOut(300);
				}
			})

		}
	}
})