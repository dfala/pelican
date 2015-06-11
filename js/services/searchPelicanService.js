angular.module('pelicanApp')

.factory('searchPelican', function () {
	var service = {};

	var postsRef = new Firebase('https://pelican.firebaseio.com/posts');
	var postsArray = [];

	// TODO: this whole code solution sucks:
	// firebase makes it really hard to query children's data

	service.loadAllData = function () {
		postsRef.once('value', function (snapshot) {
			var data = snapshot.val();
			for (var key in data) {
				postsArray.push(data[key]);
			}
		})
	}

	service.searchAPelican = function (query) {
		query = query.toLowerCase();
		var response = isInPost(query);

		return response;
	}



	var isInPost = function (query) {
		var results = [];
		postsArray.forEach(function (post, index, array) {
			var title = post.title.toLowerCase();
			if (post.description)
				var description = post.description.toLowerCase();

			if (title.indexOf(query) > -1) {
				results.push(post)
			} else if (post.description && description.indexOf(query) > -1) {
				results.push(post);
			}
		})

		return results;
	}

	return service;
})