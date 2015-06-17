angular.module('pelicanApp')

.factory('listService', function ($q) {
	var service = {};


	service.getListData = function (listInfo) {

		var one = $q.defer();
		var two = $q.defer();
		var all = $q.all([one.promise, two.promise]);
		var listRef = new Firebase('https://pelican.firebaseio.com/lists/' + listInfo.listId);
		var postsRef = new Firebase('https://pelican.firebaseio.com/posts');

		var tempList = [];
		var tempPosts = [];

		listRef.once('value', function (snapshot) {
			var listData = snapshot.val();
			one.resolve(listData);
		})

		postsRef.orderByChild('listId').equalTo(listInfo.listId).once('value', function (response) {
			var postData = response.val();

			for (var key in postData) {
				tempPosts.unshift(postData[key]);
			}

			two.resolve(tempPosts)
		})

		return all;

	}


	service.removeList = function (listInfo) {
		var baseUrl = 'https://pelican.firebaseio.com/';

		var one = $q.defer();
		var two = $q.defer();
		var three = $q.defer();
		var all = $q.all([one.promise, two.promise, three.promise]);

		var listRef = new Firebase(baseUrl + 'lists/' + listInfo.listId);
		var userRef = new Firebase(baseUrl + 'users/' + listInfo.userId + '/lists');
		var postsRef = new Firebase(baseUrl + 'posts');

		// remove from /lists
		listRef.remove();
		one.resolve();

		// remove from /users/.../lists
		userRef.orderByValue().equalTo(listInfo.listId).once('value', function (snapshot) {
			var data = snapshot.val();
			for (var key in data) {
				var removeRef = new Firebase(baseUrl + 'users/' + listInfo.userId + '/lists/' + key);
				removeRef.remove();
				two.resolve();
			}
		});

		// remove from /posts
		postsRef.orderByChild('listId').equalTo(listInfo.listId).once('value', function (snapshot) {
			var data = snapshot.val();
			if (!data) return console.info('No posts associated with this list');

			var postsId = [];
			for (var key in data) {
				postsId.push(data[key].postId);
			}

			postsId.forEach(function (postId) {
				var removeRef = new Firebase(baseUrl + 'posts/' + postId);
				removeRef.remove();
				three.resolve();
			})
		})

		return all;

	}


	return service;
})