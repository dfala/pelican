angular.module('pelicanApp')

.factory('loadListData', function ($q) {
	var service = {};

	var listsRef = new Firebase('https://pelican.firebaseio.com/lists');

	service.loadLists = function (userId) {
		var deferred = $q.defer();
		var tempList = [];

		listsRef.orderByChild('userId').equalTo(userId).once('value', function (response) {
			
			var listData = response.val();
			for (var key in listData) {
				tempList.unshift(listData[key]);
			}
			deferred.resolve(tempList);

		}, function (err) {
			
			throw new Error(err);
			deferred.reject(err);
			
		})

		return deferred.promise;
	}

	return service;
})