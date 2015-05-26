var pelicanApp = angular.module('pelicanApp');

pelicanApp.directive('clearSearch', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if(event.which === 27) {
				event.preventDefault();

				scope.$apply(function(){
					scope.textSearch = '';
				});
			}
		});
	};
})