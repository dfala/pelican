var app = angular.module('pelicanApp')

.controller('MainController',
  function ($scope, $rootScope, $timeout, $location, cookiesService, homeFeedService, loginService, contentService, passedUserId, userInfoService) {
	
	////////////////////////////////////////////////
	//////////////// INITIATING APP ////////////////
	////////////////////////////////////////////////

	$scope.activeUser = userInfoService.serveUser().user;
	$scope.lists = userInfoService.serveUser().lists;

	var firebase = new Firebase("https://pelican.firebaseio.com/");
	var allLists = firebase.child("list");

	$scope.bannerTitle = 'The Pelican Blog';
	$scope.activeTitle = "No title :(";
	$scope.postComments = [];
	$scope.activeLink;
	$scope.activeDescription;
	$scope.editingPost = false;
	$scope.posteePicUrl;
	$scope.posteeName;

	$scope.passedUserId = passedUserId.userId;

	$scope.modalTitle = "Pick a list";
	$scope.isHomePage = true;
	var listToAdd;
	var listId; // changes everytime a new list is CREATED

	// PUBLIC POSTS REFERENCE
	var publicRef = new Firebase('https://pelican.firebaseio.com/posts');
	$scope.publicPosts = [];




	////////////////////////////////////////////////
	//////////////// LOGIN PURPOSES ////////////////
	////////////////////////////////////////////////


	var usersRef = new Firebase('https://pelican.firebaseio.com/users');
	var userRef; // complete once a login happens
	$scope.activeUser;
	$scope.lists = [];
	$scope.posts = [];
	$scope.friendList = [];




	var userFirstLogin = function () {
		console.info('No lists to load');
		// $scope.$digest();
	}


	//MAKING COOKIES WORK!
	var checkForCookies = function () {
		var cookieUserId = cookiesService.checkCookie();
		if(cookieUserId) {
			$scope.getUserData(cookieUserId);
		}
	}
	// checkForCookies();



	////////////////////////////////////////////////
	////////////// POSTING COMMENTS ////////////////
	////////////////////////////////////////////////


	$scope.addComment = function (comment) {
		if (!comment || !$scope.postId) return;

		var newComment = {
			content: comment,
			commenteeName: $scope.activeUser.name,
			commenteeId: $scope.activeUser.id,
			commenteePicUrl: $scope.activeUser.picUrl,
			timestamp: Firebase.ServerValue.TIMESTAMP
		}

		var commentRef = new Firebase('https://pelican.firebaseio.com/posts/' + $scope.postId + '/comments');
		
		// save comment
		var newRef = commentRef.push(newComment);
		newRef = newRef.key();

		// pushing id
		commentRef.child(newRef).update({commentId: newRef});
		
		// reflecting front-end changes
		location.reload();

		newComment.timestamp = 'just now';
		$scope.postComments.unshift(newComment);
	}






	////////////////////////////////////////////////
	/////////////// SETING PROFILES ////////////////
	////////////////////////////////////////////////

	$scope.seeProfile = function (posteeId, isUser) {
		if (!isUser)
			isUser = false;
		
		var posteeRef = new Firebase('https://pelican.firebaseio.com/users/' + posteeId);

		posteeRef.once('value', function (data) {
			// save user in service for later ref
			if (isUser)
				userInfoService.saveUser(data.val())

			$scope.cleanUserData(data.val(), isUser);
			$scope.isHomePage = false;
			$scope.$digest();
		})
	}

	var checkForPassedUserId = function () {
		$scope.seeProfile(passedUserId.userId, passedUserId.isUser);
	}
	
	// detecting passed user id
	if (passedUserId) {
		userRef = new Firebase('https://pelican.firebaseio.com/users/' + passedUserId.userId);
		checkForPassedUserId();
	} else if ($rootScope.rootUserId) {
		$scope.activeUser = userInfoService.serveUser().user;
		$scope.lists = userInfoService.serveUser().lists;
		userRef = new Firebase('https://pelican.firebaseio.com/users/' + $rootScope.rootUserId);
	}

});