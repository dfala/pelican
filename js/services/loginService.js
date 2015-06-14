var app = angular.module('pelicanApp');

app.factory('loginService', function ($q, cookiesService) {
	var service = {};
	////////////////////////////////////////////////////////////

	var appRef = new Firebase("https://pelican.firebaseio.com/");
	var usersRef = new Firebase('https://pelican.firebaseio.com/users');
	var userRef; // to be defined later on
	var listsRef = new Firebase('https://pelican.firebaseio.com/lists');
	var postsRef = new Firebase('https://pelican.firebaseio.com/posts');

	service.login = function () {
		var deferred = $q.defer();

		appRef.authWithOAuthPopup("facebook", function(error, authData) {
			if (error) {
				console.error("Login Failed!", error);
				deferred.reject(error);
			} else {
				deferred.resolve(authData);
			}
		},{
			scope: 'email,user_likes'
		});

		return deferred.promise;
	}


	service.checkUser = function (data) {
		var deferred = $q.defer();
		var id = cleanTheId(data.uid);
		
		usersRef.once('value', function (snapshot) {
			if (snapshot.hasChild(id)) {
				deferred.resolve(id);
			} else {
				deferred.reject(data); // user does not exists yet
			}
		})
		return deferred.promise;
	}


	service.createNewUser = function (data) {
		var id = cleanTheId(data.uid);

		var user = {
			id: id,
			name: data.facebook.displayName,
			email: data.facebook.email,
			picUrl: data.facebook.cachedUserProfile.picture.data.url,
			timestamp: Firebase.ServerValue.TIMESTAMP,
			lists: 'lists'
		}

		appRef.child('users/' + id).set(user);

		var user = {
			id: id,
			name: data.facebook.displayName
		}
		
		return user;
	}

	var cleanTheId = function (rawId) {
		id = rawId.slice(rawId.indexOf('facebook:') + 9);
		return id;
	}


	service.getUserData = function (id) {
		var deferred = $q.defer();
		userRef = new Firebase('https://pelican.firebaseio.com/users/' + id);

		userRef.once('value', function (data) {
			cookiesService.setCookie(id, 1);
			deferred.resolve(data.val());
		});

		return deferred.promise;
	}

	

	service.cleanUserData = function (userData) {
		var one = $q.defer();
		var two = $q.defer();
		var all = $q.all([one.promise, two.promise]);

		var tempList = [];
		var tempPosts = [];

		listsRef.orderByChild('userId').equalTo(userData.id).once('value', function (response) {
			var listData = response.val();
			for (var key in listData) {
				tempList.unshift(listData[key]);
			}

			one.resolve(tempList);
		})


		postsRef.orderByChild('posteeId').equalTo(userData.id).once('value', function (response) {
			var postData = response.val();

			for (var key in postData) {
				tempPosts.unshift(postData[key]);
			}

			two.resolve(tempPosts)
		})

		return all;
	}

	////////////////////////////////////////////////////////////
	return service;
});