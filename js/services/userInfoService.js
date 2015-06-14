angular.module('pelicanApp')

.factory('userInfoService', function () {
	var service = {};


	var user;

	service.saveUser = function (userData) {
		if (!user) {
			user = userData;
		}
	}

	service.storeLists = function (lists) {
		user.lists = lists;
	}

	service.serveUser = function () {
		if (user) {
			return {
				user: user,
				lists: user.lists
			}
		} else {
			return false;
		}
	}


	return service;
})