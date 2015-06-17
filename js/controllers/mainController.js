var app = angular.module('pelicanApp')

.controller('MainController', 
	function ($scope, $rootScope, $timeout, $location, cookiesService, homeFeedService, loginService, contentService, passedUserId, userInfoService) {
	
	////////////////////////////////////////////////
	//////////////// INITIATING APP ////////////////
	////////////////////////////////////////////////

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

	$scope.modalTitle = "Pick a list";
	$scope.isHomePage = true;
	var listToAdd;


	// LISTS REFERENCES
	var listsRef = new Firebase('https://pelican.firebaseio.com/lists');
	var listId; // changes everytime a new list is CREATED

	// POSTS REFERENCES
	var postsRef = new Firebase('https://pelican.firebaseio.com/posts');

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
	////////// MODIFYING LISTS AND POSTS ///////////
	////////////////////////////////////////////////


	// User clicked on list to add post
	$scope.selectList = function (list) {
		// this is a hack to trigger elastic directive on addDescription ng-model change
		var tempDescription = $scope.addDescription;
		$scope.addDescription = '';

		listToAdd = list;

		$scope.chooseList = false;
		$scope.addPost = true;
		$scope.modalTitle = "Add details";
		
		$timeout(function () {
			$('#add-title').focus();
			$scope.addDescription = tempDescription;
		})
	}



	// Creating a new list
	$scope.createList = function(listName) {
		if (!$scope.activeUser) return console.log('user not defined');

		contentService.createList(listName, userRef, $scope.activeUser.id)
			.then(function (listKey) {
				listToAdd = listKey;
			})
			/// get the key here and add to listToAdd

		$scope.postList = '';
		$scope.selectList(listToAdd);
	}


	// TODO: NEED TO MOVE THIS (createPost) TO UX/UI?
	// CAN YOU POST SOMETHING FROM OTHER CONTROLLERS?

	// Create a new post
	$scope.createPost = function () {
		var title = $scope.postTitle;
		var link = $scope.postLink;
		var description = $scope.addDescription;

		// validation
		if (!listToAdd) return console.warn('listToAdd is not defined');
		if (!title) { return $scope.displayAlert('Please add a title') }

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
			timestamp: Firebase.ServerValue.TIMESTAMP,
			posteeName: $scope.activeUser.name,
			posteeId: $scope.activeUser.id,
			posteePicUrl: $scope.activeUser.picUrl,
			listId: listToAdd
		}


		// adding link
		if (link) { newPost.link = link }

		// adding description
		var postText = $scope.addDescription;

		if (postText) {
			// encoding < and >
			postText = postText.replace(/</g, "&#60;");
			postText = postText.replace(/>/g, "&#62;");
			newPost.description = postText;
		}

		// push post to post list
		var postKey = postsRef.push(newPost);
		// get id of post
		var postId = postKey.key();


		// push post id back to post
		postsRef.child('/' + postId).update({postId: postId});
		// push post id to appropriate list
		listsRef.child('/' + listToAdd + '/posts').push(postId);



		$scope.closeBigModal();
		$('#addPostModal').modal('hide');

		// TODO: this is a hack -- only need to reload the lists (or posts in list)
		$scope.lists = [];
		$scope.getUserData($scope.activeUser.id);
	}








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