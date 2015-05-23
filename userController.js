var pelicanApp = angular.module('pelicanApp',[]);

pelicanApp.controller('PelicanController', ['$scope', '$timeout', function($scope, $timeout) {

	// INITIATING APP
	var firebase = new Firebase("https://pelican.firebaseio.com/");
	var allLists = firebase.child("list");

	$scope.activeTitle = "No title :(";
	$scope.activeLink = "No link :(";
	$scope.activeDescription = "No description :(";

	$scope.modalTitle = "Pick a list";
	var listToAdd;

	////////////////////////////////
	///////////////LOGIN PURPOSES
	////////////////////////////////


	var usersRef = new Firebase('https://pelican.firebaseio.com/users');
	var userRef; // complete once a login happens
	$scope.activeUser;
	$scope.lists = [];

	// initial facebook request
	$scope.login = function () {
		firebase.authWithOAuthPopup("facebook", function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
			} else {
				checkUser(authData);
			}
		},{
			scope: 'email,user_likes'
		});
	}

	// checking if user exists
	var checkUser = function (data) {
		var id = data.uid;
		
		usersRef.once('value', function (snapshot) {
			if (snapshot.hasChild(id)) {
				getUserData(id); // the user exists
			} else {
				createNewUser(data); // the user does not exist
			}
		})
	}

	// creating a new user
	var createNewUser = function (data) {
		var id = data.uid;

		var user = {
			id: id,
			name: data.facebook.displayName,
			email: data.facebook.email,
			picUrl: data.facebook.cachedUserProfile.picture.data.url,
			lists: 'lists'
		}

		firebase.child('users/' + id).set(user);

		// activeUser defined at global $scope
		$scope.activeUser = {
			id: id,
			name: data.facebook.displayName
		}

		console.log('User created');
		getUserData(id);
	}

	// getting data for logged-in user
	var getUserData = function (id) {
		userRef = new Firebase('https://pelican.firebaseio.com/users/' + id);

		userRef.once('value', function (data) {
			var userData = data.val();

			$scope.activeUser = {
				id: userData.id,
				name: userData.name,
				picUrl: userData.picUrl
			}

			if (userData.lists === 'lists') return userFirstLogin();
			
			for (key in userData.lists) {
				var tempList = userData.lists[key];
				tempList.listId = key;
				$scope.lists.push(tempList);
			}

			console.log('$scope.lists', $scope.lists);

			// trigger an angular digest cycle
			$scope.$digest();
		});
	}

	var userFirstLogin = function () {
		console.log('no lists under this user')
		$scope.$digest();
	}





	/////////////////////////////
	// MODIFYING LISTS AND POSTS
	////////////////////////////

	// User clicked on list to add post
	$scope.selectList = function (list) {
		listToAdd = list;

		console.log(listToAdd);

		$scope.chooseList = false;
		$scope.addPost = true;
		$scope.modalTitle = "Add details";
		
		$timeout(function () {
			$('#add-title').focus();
		})
	}

	// Creating a new list
	$scope.createList = function(listName) {
		if (!$scope.activeUser) return console.log('user not defined');

		var newList = {
			listName: listName,
			posts: 'coming soon'
		}

		var newPostRef = firebase.child('users/' + $scope.activeUser.id + '/lists').push(newList);
		
		// get key of recent post
		var postId = newPostRef.key();

		$('#add-list').val('');
		$scope.selectList(postId);
	}

	// Create a new post
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

		userRef.child('/lists/' + listToAdd + '/posts').push(newPost);

		// Trigger new digest cycle
		$scope.closeBigModal();
		$('#addPostModal').modal('hide');

		// TODO: this is a hack -- only need to reload the lists (or posts in list)
		$scope.lists = [];
		getUserData($scope.activeUser.id);
	}


	//////////////////////////////////
	///////////////END LOGIN PURPOSES
	//////////////////////////////////



	// Set-content-on-post modal
	$scope.changeModal = function (title, link, description) {
		$scope.activeTitle = title;
		$scope.activeLink = link;
		$scope.activeDescription = description;
	}

	// Add-new-post modal
	$scope.openBigModal = function () {
		$scope.chooseList = true;
		$scope.addPost = false;
		$('body').css('overflow', 'hidden');
	}

	// Cloding add-new-post modal
	$scope.closeBigModal = function () {
		$('body').css('overflow', 'auto');

		// Reset the process
		listToAdd = '';
		$scope.addPost = false;
		$scope.alertMessage = '';
		$scope.modalTitle = "Pick a list";

		$('#add-title').val('');
		$('#add-link').val('');
		$('#add-description').val('');
	}

	$('#addPostModal').on('hidden.bs.modal', function () {
    	$scope.closeBigModal();
	})

	// Add-new-post alert message
	$scope.displayAlert = function(message) {
		$scope.alertMessage = message;
	}


}]);