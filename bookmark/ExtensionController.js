angular.module('pelicanApp')

.controller('ExtensionController', function ($scope, $timeout, passedUserId, listsExtensionService) {
	// validating for user id	
	if (!passedUserId) return console.error('No user defined');
	
	var listToAdd; // completed later on
	var postsRef = new Firebase('https://pelican.firebaseio.com/posts/');
	var listsRef = new Firebase('https://pelican.firebaseio.com/lists/');
	$scope.successPost = false;

	// get lists
	$scope.lists = [];
	listsExtensionService.getInitialData(passedUserId.userId)
		.then(function (allData) {
			$scope.lists = allData[0];
			$scope.activeUser = allData[1];
		})
		.catch(function (err) {
			throw new Error(err);
		})


	var cleanUrl = function () {
		var url = window.location.href;
		url = url.slice(url.indexOf('?='));
		url = url.slice(2, url.length);
		url = url.replace(/%2F/g, "/");

		return url;
	}


	// get url to add to post
	var urlToAdd = cleanUrl();
	$scope.postLink = urlToAdd;


	// defining list id
	$scope.chooseList = function (list) {
		//define the chosen list
		listToAdd = list.listId;

		//change title content
		$scope.modalTitle = 'Adding to: ' + list.listName;

		//focus on title input field
		$timeout(function () {
			$('#add-title').focus();
		})
	}


	// creating the post
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




		// TODO need to get user info
		// TODO need to define all refs
		var newPost = {
			title: title,
			timestamp: Firebase.ServerValue.TIMESTAMP,
			posteeName: $scope.activeUser.name,
			posteeId: passedUserId.userId,
			posteePicUrl: $scope.activeUser.picUrl,
			listId: listToAdd
		}


		// adding link
		if (link) { newPost.link = link; }

		// adding description
		if (description) { newPost.description = description; }

		// push post to post list
		var postKey = postsRef.push(newPost);
		// get id of post
		var postId = postKey.key();


		// push post id back to post
		postsRef.child(postId).update({postId: postId});
		// push post id to appropriate list
		listsRef.child(listToAdd + '/posts').push(postId);

		closeWindow();
	}

	// success post & close popup window
	var closeWindow = function () {
		$scope.successPost = true;

		$timeout(function () {
			top.window.close();
		}, 800)
	}
})