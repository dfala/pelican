var app = angular.module('pelicanApp',[]);

app.controller('mainController', ['$scope', '$timeout', '$sce', 'cookiesService', 'homeFeedService', 'loginService', 'contentService', function($scope, $timeout, $sce, cookiesService, homeFeedService, loginService, contentService) {


	////////////////////////////////////////////////
	//////////////// INITIATING APP ////////////////
	////////////////////////////////////////////////

	var firebase = new Firebase("https://pelican.firebaseio.com/");
	var allLists = firebase.child("list");

	$('#add-description').html('');
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

	// DEPRECATED
	var publicRef = new Firebase('https://pelican.firebaseio.com/posts');
	$scope.publicPosts = [];






	////////////////////////////////////////////////
	//////////////// HOME FEED DATA ////////////////
	////////////////////////////////////////////////

	var getPublicPosts = function () {
		homeFeedService.getPulicPosts()
			.then(function (response) {
				$scope.publicPosts = response;
			})
	}
	getPublicPosts();

	$scope.getMorePosts = function () {
		if (!$scope.isHomePage) return;
		//turn on loading gif
		$scope.autoLoad = true;

		homeFeedService.getMorePosts()
			.then(function (response) {
				$scope.publicPosts = response;
				$scope.autoLoad = false;
			})
	}

	$scope.pinPublicPost = function (title, link, description) {
		//open modal
		$('#addPostModal').modal('show');

		//populate values
		$scope.postTitle = title;
		$scope.postLink = link;
		$scope.addDescription = description;

		//load modal data
		$scope.openBigModal();
	}








	////////////////////////////////////////////////
	//////////////// LOGIN PURPOSES ////////////////
	////////////////////////////////////////////////


	var usersRef = new Firebase('https://pelican.firebaseio.com/users');
	var userRef; // complete once a login happens
	$scope.activeUser;
	$scope.lists = [];
	$scope.posts = [];
	$scope.friendList = [];




	// initial facebook request
	$scope.login = function () {
		loginService.login()
			.then(function (authData) {
				checkUser(authData);
			})
	}

	// log user out
	$scope.logOut = function () {
		cookiesService.deleteCookie(function () {
			location.reload();
		})
	}

	// checking if user exists
	var checkUser = function (data) {
		loginService.checkUser(data)
			.then(function (id) {
				getUserData(id);
			}, function (data) {
				createNewUser(data);
			})
	}

	// creating a new user
	var createNewUser = function (data) {
		var response = loginService.createNewUser(data);
		$scope.activeUser = response;
		getUserData(response.id);
	}

	// getting data for logged-in user
	var getUserData = function (id) {
		userRef = new Firebase('https://pelican.firebaseio.com/users/' + id);

		loginService.getUserData(id)
			.then(function (response) {
				cleanUserData(response, true);
				$scope.isHomePage = false;
			})
	}

	var cleanUserData = function (userData, isUser) {
		if (isUser) {
			$scope.isNotUserData = false;
			$scope.lists = [];
			$scope.posts = [];
			$scope.activeUser = {
				id: userData.id,
				name: userData.name,
				picUrl: userData.picUrl
			}
		} else {
			$scope.isNotUserData = true;
		}

		var firstName = userData.name.split(" ");
		$scope.bannerTitle = firstName[0] + "'s Pelican";
		$scope.friendList = [];


		if (userData.lists === 'lists') return userFirstLogin();


		loginService.cleanUserData(userData)
			.then(function (response) {
				$scope.posts = response[1];
				combineData(response[0], isUser)
				window.scrollTo(0, 0);
			})
	}


	var combineData = function (passedList, isUser) {
		passedList.forEach(function (list, index) {
			list.posts = [];
			$scope.posts.forEach(function (post, index) {
				if (post.listId === list.listId) {
					list.posts.push(post);
				}
			})
		})

		if (isUser) {
			$scope.lists = passedList;
		} else {
			$scope.friendList = passedList;
		}
	}


	var userFirstLogin = function () {
		console.log('no lists under this user')
		$scope.$digest();
	}



	//MAKING COOKIES WORK!
	var checkForCookies = function () {
		var cookieUserId = cookiesService.checkCookie();
		if(cookieUserId) {
			getUserData(cookieUserId);
		}
	}

	checkForCookies();







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

		$('#add-list').val('');
		$scope.selectList(listToAdd);
	}



	// Create a new post
	$scope.createPost = function () {
		var title = $scope.postTitle;
		var link = $scope.postLink;
		var description = $scope.addDescription;

		// validation
		if (!listToAdd) return console.log('listToAdd is not defined');
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
		getUserData($scope.activeUser.id);
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
		newComment.timestamp = 'just now';
		$scope.postComments.unshift(newComment);
	}








	////////////////////////////////////////////////
	/////////////// SETING PROFILES ////////////////
	////////////////////////////////////////////////

	$scope.seeProfile = function (posteeId) {
		var posteeRef = new Firebase('https://pelican.firebaseio.com/users/' + posteeId);

		posteeRef.once('value', function (data) {
			cleanUserData(data.val(), false);
			$scope.isHomePage = false;
			$scope.$digest();
		})
	}













	////////////////////////////////////////////////
	////////////////////////////////////////////////
	////// MOVE EVERYTHING BELOW TO DIRECTIVE //////
	////////////////////////////////////////////////
	////////////////////////////////////////////////



















	////////////////////////////////////////////////
	//////////////// UX/UI PURPOSES ////////////////
	////////////////////////////////////////////////


	// Set value of page (home page vs. user page)
	$scope.homePage = function (value) {
		// animate to the top
		$('html, body').animate({scrollTop : 0},0);

		$scope.isHomePage = value;
		if (value === false) {
			getUserData($scope.activeUser.id);
		} else {
			$scope.bannerTitle = "The Pelican Blog";
		}
	}


	// Set-content-on-post modal
	$scope.changeModal = function (post) {
		$scope.activeTitle = post.title;
		$scope.activeLink = post.link;
		$scope.activeDescription = post.description;
		$scope.posteePicUrl = post.posteePicUrl;
		$scope.posteeName = post.posteeName;
		$scope.listId = post.listId;
		$scope.postId = post.postId;

		if (post.comments) {
			for (var key in post.comments) {
				$scope.postComments.unshift(post.comments[key]);
			}
		}

		// DEPRECATED
		// changeHash(post.postId);
		appendToUrl(post.postId);
	}

	// Add-new-post modal
	$scope.openBigModal = function (optionalTitle) {
		$('body').css('overflow', 'hidden');

		// User clicked on the plus btn next to the title
		if (optionalTitle) return $scope.selectList(optionalTitle);

		$scope.chooseList = true;
		$scope.addPost = false;
	}

	// Cloding add-new-post modal
	$scope.closeBigModal = function () {
		$('body').css('overflow', 'auto');

		// Reset the process
		listToAdd = '';
		$scope.addPost = false;
		$scope.editingPost = false;
		$scope.alertMessage = '';
		$scope.modalTitle = "Pick a list";


		$scope.postTitle = '';
		$scope.postLink = '';
		$scope.addDescription = '';
		$scope.newComment = '';
	}

	// on boostrap close modal trigger closeBigModal();
	$('#addPostModal').on('hidden.bs.modal', function () {
    	$scope.closeBigModal();
	})

	$('#postModal').on('hidden.bs.modal', function () {
    	$scope.postComments = [];
    	$scope.postTitle = '';
		$scope.postLink = '';
		$scope.addDescription = '';
		$scope.newComment = '';
		clearUrl();

	})



	// open edit post modal
	$scope.editPostModal = function(title, link, content) {
		// set modal
		$scope.modalTitle = 'Edit post';

		$scope.chooseList = false;
		$scope.addPost = true;
		$scope.editingPost = true;

		// set values
		$scope.postTitle = title;
		$scope.postLink = link;

		// focus on title
		$timeout(function () {
			$('#add-title').focus();
			$scope.addDescription = content;
		})
	}




	$scope.updatePostModal = function (deletePost) {
		var postRef = 'posts/' + $scope.postId;
		var postInListRef = new Firebase('https://pelican.firebaseio.com/lists/' + $scope.listId + '/posts');

		if (deletePost) {
			firebase.child(postRef).remove();

			//TODO: removing the post from lists/posts does not work
			postInListRef.orderByValue().equalTo($scope.postId).once('value', function (snapshot) {
				var object = snapshot.val();

				for (var key in object) {
					postInListRef.child(key).remove();
				}

			});

			clearUpdate();
			return
		}

		var newDescription = $scope.addDescription;
		var newTimestamp = Firebase.ServerValue.TIMESTAMP;

		var updatedPost = {
			title: $scope.postTitle,
			timestamp: newTimestamp
		}

		// Validation
		if (!$scope.postTitle) { return $scope.displayAlert('Please add a title') }
		if (newDescription) { updatedPost.description = newDescription } else { updatedPost.description = null }
		
		if ($scope.postLink) {
			// valid link?
			if ($scope.postLink.indexOf('.') < 0) {
				return $scope.displayAlert('Please add a valid link');
			}

			// add http to link (if none)
			if ($scope.postLink && $scope.postLink.indexOf('http') < 0) {
				$scope.postLink = 'http://' + $scope.postLink;
			}

			updatedPost.link = $scope.postLink
		} else {
			updatedPost.link = null
		}

		firebase.child(postRef).update(updatedPost);

		clearUpdate();
	}




	var clearUpdate = function () {
		// Closing modals
		$('#addPostModal').modal('hide');
		$('#postModal').modal('hide');

		//TODO: this is a hack -- only need to get the thread
		$scope.lists = [];
		getUserData($scope.activeUser.id);
		$scope.closeBigModal();
	}


	// Add-new-post alert message
	$scope.displayAlert = function(message) {
		$scope.alertMessage = message;
	}


	// Highlighting text
	$scope.highlight = function(text, search) {
	    if (!search) {
	        return $sce.trustAsHtml(text);
	    }
	    return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlightedText">' + search + '</span>'));
	};

	$scope.cleanSearchQuery = function () {
		$scope.textSearch = '';
	}




	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	///////////  THIS CODE NEEDS MAJOR MASSIVE TESTING AND REFACTORING  ////////////
	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////

	/*
							 \	  /
							 \\	 //
							  \\//
							  /////
		                     ///+//
		                    ////////
		                    ///
	   \\  ////////:://:://::/
	    \\//////:://:://::///
		 \///:://:://:://::/
		    //:://::///:://
		  	//			 //
		  	//			 //
		  	--			 --
	*/

	var PAGE_TITLE = "Pelican News";


	// CLEAN APPENDED STUFF (?ref=facebook, etc.) OFF BASE URL
	var getBaseUrl = function() {
		return window.location.href.split('?')[0];
	}

	// CLEAR ID FROM URL
	var clearUrl = function() {
		var url = getBaseUrl();
		window.history.pushState({}, PAGE_TITLE, url);
	}

	// ADD ID TO URL
	var appendToUrl = function (append) {
		var url = getBaseUrl() + "?id=" + append;
		window.history.pushState({}, PAGE_TITLE, url);
	}


	// GET ANY PARAMETER YOU WANT FROM THE URL
	function getParameterByName(name) {
	  var newId = location.search;
	  newId = newId.substring(4);

	  return newId;
	}

	// GET ID FROM THE URL
	var idToGet = getParameterByName('id');

	//////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////

	var searchForItemById = function (id) {
	    //look at each one until you find it.
	    
	    //go over each collection
	    for (var i = 0; i < $scope.collections.length; i++) {
	        //get the collection
	        var collection = $scope.collections[i];
	        //get the items out of the collection
	        var items = collection.items;
	        
	        //go over each item
	        for (var x = 0; x < items.length; x++) {
	            //get the item
	            var item = items[x];
	            
	            if (item.id == id) {
	                return item;
	            } else {
	                //keep going and look at the next one
	            }
	        }
	    }
	    
	    //if you make it to the end return null AKA not found
	    return null;
	};

	if (idToGet !== '') {
	    //search for the correct article to show.
	    var pathToPost = new Firebase('https://pelican.firebaseio.com/posts/' + idToGet);

		pathToPost.once('value', function (response) {
			var data = response.val();
			if (!data) return

			console.log('data.link', data);

			$('#postModal').modal('show');
			$scope.activeTitle = data.title;
			if (data.link) { $scope.activeLink = data.link; }
			if (data.description) { $scope.activeDescription = data.description; }

			$scope.$digest();
		})
	}



}]);