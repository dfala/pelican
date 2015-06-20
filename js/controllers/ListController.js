angular.module('pelicanApp')

.controller('ListController', function ($scope, passedListInfo, listService, userInfoService, $location) {
	// Check for user logged in
	$scope.activeUser = userInfoService.serveUser().user;
	// $scope.lists = userInfoService.serveUser().lists;
	
	// init
	$scope.list;

	var getListData = function () {
		listService.getListData(passedListInfo)
			.then(function (listData) {
				$scope.list = listData[0];
				$scope.list.posts = listData[1];
			})
			.catch(function (err) {
				throw new Error(err)
			})
	}
	getListData();

	$scope.deleteList = function () {
		// only if user is user
		listService.removeList(passedListInfo)
			.then(function (success) {
				closeListWindow();
			})
			.catch(function (err) {
				throw new Error(err);
			})
	}

	var closeListWindow = function () {
		// do magic to empty list and redirect to user list
		$location.path('/');
	}
})