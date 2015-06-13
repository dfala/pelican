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



	return service;
})