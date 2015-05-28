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

.directive('homeContent', function () {
	return {
		restrict: 'EA',
		templateUrl: 'templates/homeLists.html',
		replace: true,
		link : function (scope, element, attrs) {}
	};
})

.directive('userContent', function () {
	return {
		restrict: 'EA',
		templateUrl: 'templates/userLists.html',
		replace: true,
		link : function (scope, element, attrs) {}
	};
})

.directive('friendContent', function () {
	return {
		restrict: 'EA',
		templateUrl: 'templates/friendList.html',
		replace: true,
		link : function (scope, element, attrs) {}
	};
})




.directive('superShare', function () {
	return {
		restrict: 'A',
		templateUrl: 'templates/supershare.html',
		link : function (scope, element, attrs) {


			//YOUR JS FILE HERE





























		}
	};
})





.directive('elastic', ['$timeout', function ($timeout) {
	return {
		restrict: 'EA',
		link : function (scope, element, attrs) {

			var textarea = element[0];

			//Resize when the window changes
			$( window ).resize(resizeTextArea);

			element.bind("keydown", function(key) {
				if (key.keyCode === 13)
					resizeTextArea(25);
			});

			element.bind("keyup", function(key) {
				if (key.keyCode === 8)
					resizeTextArea(4);
			});

			//Resize when textArea content changes
			scope.$watch(attrs.ngModel, function (newValue, oldValue) {
				if (newValue) {
					textarea = element[0];
					resizeTextArea(5);
				}
			});

			//This was the simplest answer that I could find.  I am open to changing this.
			function resizeTextArea (addedHeight) {
				var scroll = $(document).scrollTop();
				textarea.style.height = "4px";
				textarea.style.height = (addedHeight + textarea.scrollHeight) + "px";
				$(document).scrollTop(scroll);
			}
		}
	};
}]);
