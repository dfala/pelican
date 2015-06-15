angular.module('pelicanApp')

.factory('listsExtensionService', function ($q) {
	var service = {};

	var listsRef = new Firebase('https://pelican.firebaseio.com/lists');

	service.getInitialData = function (userId) {
		var userRef = new Firebase('https://pelican.firebaseio.com/users/' + userId);

		var one = $q.defer();
		var two = $q.defer();
		var all = $q.all([one.promise, two.promise]);

		//get list data
		listsRef.orderByChild('userId').equalTo(userId).once('value', function (snapshot) {
			var data = snapshot.val();

			// convert into array
			var lists = [];
			for (var key in data) {
				lists.push(data[key]);
			}

			one.resolve(lists);
		});

		//get user data
		userRef.once('value', function (snapshot) {
			two.resolve(snapshot.val());
		})

		return all;
	}

	service.storePost = function (data) {

	}

	return service;
})