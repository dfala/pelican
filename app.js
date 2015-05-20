var pelicanApp = angular.module('pelicanApp',[]);

pelicanApp.controller('PelicanController', ['$scope', function($scope) {

	var firebase = new Firebase("https://pelican.firebaseio.com/");

	$scope.allData = [];


	// GET ALL DATA
	var getAllData = function () {
		firebase.on('value', function (data) {
			var rawData = data.val();

			//parsing data and pushing to array
			for (key in rawData) {
				$scope.allData.push(rawData[key]);
			}

			console.log($scope.allData);
			$scope.$apply();
		})
	}
	getAllData();

	// PUSH A NEW POST
	$scope.createPost = function (title, link, description) {
		firebase.child('daniel').push({
			title: title,
			link: link,
			description: description,
			timestamp: Date()
		})
	}

	// CREATE NEW LIST
	$scope.createList = function (listName) {
		firebase.set(listName);
	}



}]);