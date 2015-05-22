var pelicanApp = angular.module('pelicanApp',[]);

pelicanApp.controller('PelicanController', ['$scope', '$timeout', function($scope, $timeout) {

	// INITIATING APP
	var firebase = new Firebase("https://pelican.firebaseio.com/");
	var allLists = firebase.child("list");


	////////////////////////////////
	///////////////TESTING PURPOSES
	////////////////////////////////


	$scope.login = function () {
		firebase.authWithOAuthPopup("facebook", function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
			} else {
				console.log("Authenticated successfully with payload:", authData);
			}
		});
	}


	



	////////////////////////////////
	///////////////TESTING PURPOSES
	////////////////////////////////

	$scope.allData = [];

	$scope.activeTitle = "No title :(";
	$scope.activeLink = "No link :(";
	$scope.activeDescription = "No description :(";

	$scope.modalTitle = "Pick a list";

	var listToAdd;

	

	// GET ALL DATA
	var getAllData = function () {
		firebase.on('value', function (data) {
			var rawData = data.val();

			// parsing data
			for (key in rawData) {
				$scope.allData.push(rawData[key]);
			}

			$scope.allData = $scope.allData[0];

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
		$scope.chooseList = true;
		$('body').css('overflow', 'hidden');
	}

	$scope.closeBigModal = function () {
		$('body').css('overflow', 'auto');

		//set adding steps back to 1
		listToAdd = '';
		$scope.addPost = false;
		$scope.alertMessage = '';
		$scope.modalTitle = "Pick a list";
	}

	$('#addPostModal').on('hidden.bs.modal', function () {
    	$scope.closeBigModal();
	})

	$scope.selectList = function (list) {
		if (list.title) { listToAdd = list.title; } else { listToAdd = list }
		$scope.chooseList = false;
		$scope.addPost = true;
		$scope.modalTitle = "Add details";
		
		$timeout(function () {
			$('#add-title').focus();
		})
	}



	// PUSH A NEW POST
	$scope.createPost = function (title, link, description) {
		if (!listToAdd) return;

		// validation
		if (!title) { return $scope.displayAlert('Please add a title') }
		if (!link && !description) { return $scope.displayAlert('Please add a link OR description') }

		if (link) {
			// valid link?
			if (link.indexOf('.') < 0) {
				return $scope.displayAlert('Please add a valid link');
			}

			// add http to link (if none)
			if (link && link.indexOf('http') < 0) {
				link = 'http://' + link;
			}
		}

		var newPost = {
			title: title,
			timestamp: Date()
		}

		if (link) { newPost.link = link }
		if (description) { newPost.description = description }

		console.log(newPost);

		postToFirebase(newPost);

		// not necessary due to reload location temp hack
		listToAdd = '';
		$scope.closeBigModal();

		//TODO: this is a hack to prevent bugs:
		location.reload();
	}

	// add post to database
	var postToFirebase = function (newPost) {
		firebase.child('list/' + listToAdd + '/listPosts').push(newPost);
	}



	// SET KEY VALUE IN FIREBASE
	$scope.createList = function(listName) {
		firebase.child('list/' + listName + '/title').set(listName);
		$scope.selectList(listName);
	}

	$scope.displayAlert = function(message) {
		$scope.alertMessage = message;
	}



}]);