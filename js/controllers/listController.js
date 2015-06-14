angular.module('pelicanApp')

.controller('ListController', function ($scope, passedListInfo, listService, userInfoService) {
	// Check for user logged in
	$scope.activeUser = userInfoService.serveUser().user;
	$scope.lists = userInfoService.serveUser().lists;

	$scope.lists = [];

	var getListData = function () {
		listService.getListData(passedListInfo)
			.then(function (listData) {
				var list = listData[0];
				list.posts = listData[1];

				$scope.lists.push(list);
			})
			.catch(function (err) {
				throw new Error(err)
			})
	}
	getListData();
})