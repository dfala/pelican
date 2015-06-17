angular.module('pelicanApp')

.controller('HomeController', function ($scope, $timeout, homeFeedService, passedUserId, loadListData, loginService) {
	$scope.lists = [];
	$scope.activeUser;
	$scope.isHomePage = true;
	$scope.autoLoad = false;
	$scope.modalTitle = "Add details";
	$scope.bannerTitle = 'The Pelican Blog';

	// get the active user info
	var getUserData = function () {
		loginService.getUserData(passedUserId)
			.then(function (userData) {
				$scope.activeUser = userData;
				console.log($scope.activeUser);
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

	// TODO: this needs testing
	$scope.pinPublicPost = function (title, link, description) {
		//open modal
		$('#addPostModal').modal('show');

		//populate values
		$scope.postTitle = title;
		$scope.postLink = link;
		$scope.addDescription = description;

		//load modal data
		$scope.openBigModal();
	}



})