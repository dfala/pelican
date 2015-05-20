var pelicanApp = angular.module('pelicanApp',[]);

pelicanApp.controller('PelicanController', ['$scope', function($scope) {

	// INITIATING APP
	var firebase = new Firebase("https://pelican.firebaseio.com/");
	var allLists = firebase.child("list");

	$scope.posts = [];
	$scope.lists = [];


	// GET ALL DATA
	var getAllData = function () {
		firebase.on('value', function (data) {
			var rawData = data.val();

			//parsing data and pushing to array
			for (firstKey in rawData) {
				for (secondKey in rawData[firstKey]) {
					$scope.posts.push(rawData[firstKey][secondKey]);
					$scope.lists.push(secondKey);
				}
			}

			console.log($scope.posts);

			$scope.$apply();
		})
	}
	getAllData();

	// PUSH A NEW POST
	$scope.createPost = function (title, link, description) {
		firebase.child('list/test item').push({
			title: title,
			link: link,
			description: description,
			timestamp: Date()
		})
	}

	// SET KEY VALUE IN FIREBASE
	$scope.createList = function(listName) {
		firebase.child('list/' + listName).set(listName);
	}



}]);