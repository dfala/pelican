angular.module('pelicanApp')

.controller('listController', function ($scope, passedListInfo, listService) {
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