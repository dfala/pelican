angular.module('pelicanApp')

.controller('HomeController',
  function ($scope, $timeout, homeFeedService, passedUserId, loadListData, loginService, userInfoService, contentService) {
	$scope.lists = [];
	$scope.activeUser;
	$scope.isHomePage = true;
	$scope.autoLoad = false;
	$scope.modalTitle = "Add details";
	$scope.bannerTitle = 'The Pelican Blog';

	$scope.passedUserId = passedUserId;

	// get the active user info
	var getUserData = function () {
		loginService.getUserData(passedUserId)
			.then(function (userData) {
				$scope.activeUser = userData;
				userInfoService.saveUser(userData);
			})
			.catch(function (err) {
				throw new Error(err);
			})
	}

	// load user lists
	var getListData = function () {
		loadListData.loadLists(passedUserId)
			.then(function (response) {
				$scope.lists = response;
				userInfoService.storeLists(response);
			})
	}

	if (passedUserId) {
		getListData();
		getUserData();
	}

	var getPublicPosts = function () {
		homeFeedService.getPulicPosts()
			.then(function (response) {
				$scope.publicPosts = response;
			})
	}
	getPublicPosts();

	$scope.getMorePosts = function () {
		$scope.autoLoad = true;

		homeFeedService.getMorePosts()
			.then(function (response) {
				$scope.publicPosts = response;
				$timeout(function () {
					$scope.autoLoad = false;
				}, 1000);
			})
	}


})