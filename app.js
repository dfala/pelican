var pelicanApp = angular.module('pelicanApp',[]);

pelicanApp.controller('PelicanController', ['$scope', function($scope) {

	// INITIATING APP
	var firebase = new Firebase("https://pelican.firebaseio.com/");
	var allLists = firebase.child("list");

	$scope.posts = [];
	$scope.lists = [];

	$scope.activeTitle = "No title :(";
	$scope.activeLink = "No link :(";
	$scope.activeDescription = "No description :(";

	$scope.openedBigModal = false;
	var listToAdd;

	

	// GET ALL DATA
	var getAllData = function () {
		firebase.on('value', function (data) {
			var rawData = data.val();

			//parsing data and pushing to array
			for (firstKey in rawData) {
				for (secondKey in rawData[firstKey]) {
					$scope.lists.push(secondKey);
					$scope.posts.push(rawData[firstKey][secondKey]);
				}
			}

			$scope.$apply();
		})
	}
	
	getAllData();



	// SET CONTENT ON MODAL
	$scope.changeModal = function (title, link, description) {
		$scope.activeTitle = title;
		$scope.activeLink = link;
		$scope.activeDescription = description;
	}



	// BIG MODAL
	$scope.openBigModal = function () {
		$scope.openedBigModal = true;
		$scope.chooseList = true;
		$('body').css('overflow', 'hidden');
	}

	$scope.closeBigModal = function () {
		$scope.openedBigModal = false;
		$('body').css('overflow', 'auto');

		//set adding steps back to 1
		listToAdd = '';
		$scope.addPost = false;
	}

	$scope.selectList = function (list) {
		listToAdd = list;
		console.log(listToAdd);
		$scope.chooseList = false;
		$scope.addPost = true;
	}



	// PUSH A NEW POST
	$scope.createPost = function (title, link, description) {
		if (!listToAdd) return;

		firebase.child('list/' + listToAdd).push({
			title: title,
			link: link,
			description: description,
			timestamp: Date()
		})

		listToAdd = '';
		$scope.closeBigModal();
	}



	// SET KEY VALUE IN FIREBASE
	$scope.createList = function(listName) {
		firebase.child('list/' + listName).set(listName);
		$scope.selectList(listName);
	}



}]);