var pelicanApp = angular.module('pelicanApp',[]);

pelicanApp.controller('PelicanController', ['$scope', function($scope) {

	var firebase = new Firebase("https://pelican.firebaseio.com/");

	var addEmailNewsletter = function (userName, newScore) {
		firebase.set ({
			emailSignUp: "yofala@gmail.com"
		})
	}

	addEmailNewsletter();

}]);