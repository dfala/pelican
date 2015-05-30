var pelicanApp = angular.module('pelicanApp',[]);

pelicanApp.controller('PelicanController', ['$scope', '$timeout', '$sce', 'cleanText', function($scope, $timeout, $sce, cleanText) {

	// INITIATING APP
	var firebase = new Firebase("https://pelican.firebaseio.com/");
	var allLists = firebase.child("list");


	// $scope.data = function() {
	// 	firebaseService.getData();
	// }

	$('#add-description').html('');
	$scope.bannerTitle = 'The Pelican Blog';
	$scope.activeTitle = "No title :(";
	$scope.activeLink;
	$scope.activeDescription;
	$scope.editingPost = false;
	$scope.posteePicUrl;
	$scope.posteeName;

	$scope.modalTitle = "Pick a list";
	$scope.isHomePage = true;
	var listToAdd;


	////////////////////////////////
	///////////////LOAD PUBLIC DATA
	////////////////////////////////

	var postsRef = new Firebase('https://pelican.firebaseio.com/publicPosts');
	$scope.publicPosts = [];

	var getPublicPosts = function () {
		// getting last 20 items in list (most recent 20)
		postsRef.limitToLast(20).on('value', function (data) {
			var publicData = data.val();

			$scope.publicPosts = [];

			for (var key in publicData) {
				$scope.publicPosts.unshift(publicData[key])
			}

			// trigger an angular digest cycle
			// $scope.$digest();
		});
	}

	getPublicPosts();



	$scope.pinPublicPost = function (title, link, description) {
		$('#addPostModal').modal('show');
		//populate values
		$scope.postTitle = title;
		$scope.postLink = link;
		$scope.addDescription = description;

		$scope.openBigModal();
	}














	////////////////////////////////
	///////////////LOGIN PURPOSES
	////////////////////////////////


	var usersRef = new Firebase('https://pelican.firebaseio.com/users');
	var userRef; // complete once a login happens
	$scope.activeUser;
	$scope.lists = [];
	$scope.friendList = [];



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

	// log user out
	$scope.logOut = function () {
		date = Date();
		document.cookie = 'id=; expires=' + date + ';';
		$timeout(function () {
			location.reload();
		}, 50);
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

			for (key in userData.lists) console.log(key);

			cleanUserData(userData, true);

			// second argument defines number of days until cookie expires
			setCookie($scope.activeUser.id, 1);

			$scope.isHomePage = false;
			
			// trigger an angular digest cycle
			$scope.$digest();
		});
	}

	var cleanUserData = function (userData, isUser) {
		if (isUser) {
			$scope.isNotUserData = false;
			$scope.lists = [];
			$scope.activeUser = {
				id: userData.id,
				name: userData.name,
				picUrl: userData.picUrl
			}
		} else {
			$scope.isNotUserData = true;
		}

		var firstName = userData.name.split(" ");
		$scope.friendList = [];
		$scope.bannerTitle = firstName[0] + "'s Pelican";


		if (userData.lists === 'lists') return userFirstLogin();

		for (var key in userData.lists) {
			var tempList = userData.lists[key];
			tempList.listId = key;
			if (isUser) { $scope.lists.unshift(tempList); }
			if (!isUser) { $scope.friendList.unshift(tempList); }
		}

		window.scrollTo(0, 0);
	}

	var userFirstLogin = function () {
		console.log('no lists under this user')
		$scope.$digest();
	}


















	///////////////////
	// SETTING COOKIES
	///////////////////

	var getCookie = function () {
	    var cookie = document.cookie;
	    return cookie;
	}

	var checkCookie = function () {
	    var userId = getCookie();
	    userId = userId.substring(3);

	    if (userId) {
	        getUserData(userId);
	    }
	}

	checkCookie();

	// second param defines number of days until cookie expires
	var setCookie = function (cookieValue, expDate) {
	    var d = new Date();
	    d.setTime(d.getTime() + (expDate*24*60*60*1000));
	    var expires = "expires=" + d.toUTCString();

	    // create cookie
	    document.cookie = "id=" + cookieValue + "; path=/; " + expires;
	}















	/////////////////////////////
	// MODIFYING LISTS AND POSTS
	////////////////////////////

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
	$scope.createPost = function (title, link) {
		if (!listToAdd) return;

		// validation
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
			timestamp: Date()
		}

		// adding link
		if (link) { newPost.link = link }

		// adding description
		var postText = $scope.addDescription;
		// var postText = cleanText.cleanThoughts();

		if (postText) {
			newPost.description = postText;
		}

		// Push data to respective user list
		userRef.child('/lists/' + listToAdd + '/posts').push(newPost);
		

		newPost.posteeName = $scope.activeUser.name;
		newPost.posteeId = $scope.activeUser.id;
		newPost.posteePicUrl = $scope.activeUser.picUrl;


		// Push data to public posts
		postsRef.push(newPost);



		$scope.closeBigModal();
		$('#addPostModal').modal('hide');

		// TODO: this is a hack -- only need to reload the lists (or posts in list)
		$scope.lists = [];
		getUserData($scope.activeUser.id);
	}







	///////////////////
	// SEEING PROFILES
	///////////////////

	$scope.seeProfile = function (posteeId) {
		var posteeRef = new Firebase('https://pelican.firebaseio.com/users/' + posteeId);

		posteeRef.once('value', function (data) {
			cleanUserData(data.val(), false);
			$scope.isHomePage = false;
			$scope.$digest();
		})
	}





	///////////////////
	// FRONT END UX/UI
	///////////////////


	// Set value of page (home page vs. user page)
	$scope.homePage = function (value) {
		$scope.isHomePage = value;
		if (value === false) {
			getUserData($scope.activeUser.id);
		} else {
			$scope.bannerTitle = "The Pelican Blog";
		}
	}


	// Set-content-on-post modal
	$scope.changeModal = function (title, link, description, posteeUrl, posteeName, listId, postId) {
		$scope.activeTitle = title;
		$scope.activeLink = link;
		$scope.activeDescription = description;
		$scope.posteePicUrl = posteeUrl;
		$scope.posteeName = posteeName;
		$scope.listId = listId;
		$scope.postId = postId;
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
	}

	// on boostrap close modal trigger closeBigModal();
	$('#addPostModal').on('hidden.bs.modal', function () {
    	$scope.closeBigModal();
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
		var postRef = 'users/' + $scope.activeUser.id + '/lists/' + $scope.listId + '/posts/' + $scope.postId;
		if (deletePost) {
			firebase.child(postRef).remove();
			clearUpdate();
			return
		}

		var newDescription = $scope.addDescription;
		var newTimestamp = Date();

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
///////////  THIS CODE NEEDS MAJOR MASSIVE TESTGIN AND REFACTORING  ////////////
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

	// OPEN IFRAME
	$scope.iframeurl = function(id, url){
		$('#iframe').attr('src', url);
		appendToUrl(id);
	};

	// CLOSE IFRAME
	$('#myModal').on('hidden.bs.modal', function () {
		clearUrl();
	})

	// GET ANY PARAMETER YOU WANT FROM THE URL
	function getParameterByName(name) {
	  // name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	  // var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	  //     results = regex.exec(location.search);
	  // return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));

	  var newId = location.search;
	  newId = newId.substring(5);

	  return newId;
	}

	// GET ID FROM THE URL
	var idToGet = getParameterByName('id');

	console.log(idToGet)

	///////////////////////////////////////////////////////////////////////////////////////////////////////


	//Programatically opening the modal (simulating the click);
	var openModal = function (id, url) {
	    $scope.iframeurl(id, url);
	    $('#myModal').modal('show');
	};

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

	var idToGet = getParameterByName('id');

	if (idToGet !== '') {
	    //search for the correct article to show.
	    
	    // var item = searchForItemById(id);

	    var pathToPost = new Firebase('https://pelican.firebaseio.com/publicPosts/' + idToGet);
		// $scope.publicPosts = [];

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
	    
	    // if (item !== null) {
	    //     openModal(item.id, item.url);
	    // }
	}













}]);