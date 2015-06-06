var app = angular.module('pelicanApp');

app.factory('homeFeedService', function ($q) {
	////////////////////////////////////////////////////////////
	var service = {};
	////////////////////////////////////////////////////////////

	var publicRef = new Firebase('https://pelican.firebaseio.com/posts');

	service.getPulicPosts = function () {
		var deferred = $q.defer();

		publicRef.limitToLast(10).once('value', function (data) {
			var publicData = data.val();
			var publicPosts = [];

			for (var key in publicData) {
				publicPosts.unshift(publicData[key])
			}

			deferred.resolve(publicPosts);
		});

		return deferred.promise;
	}

	var lazyCount = 1;

	service.getMorePosts = function () {
		var deferred = $q.defer();

		publicRef.limitToLast(lazyCount * 10).once('value', function (data) {

			var publicData = data.val();
			publicPosts = [];

			for (var key in publicData) {
				publicPosts.unshift(publicData[key])
			}

			lazyCount++;
			deferred.resolve(publicPosts);
		});

		return deferred.promise;
	}


	////////////////////////////////////////////////////////////
	return service;
	////////////////////////////////////////////////////////////
});