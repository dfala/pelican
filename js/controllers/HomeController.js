angular.module('pelicanApp')

.controller('HomeController', function ($scope, homeFeedService, passedUserId, loadListData, loginService) {
	$scope.lists = [];
	$scope.activeUser;
	$scope.autoLoad;
	$scope.modalTitle = "Add details";

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
				// console.log($scope.lists);
			})
	}



	if(passedUserId) {
		getListData();
		getUserData();
	}


	$scope.bannerTitle = 'The Pelican Blog';

	////////////////////////////////////////////////
	//////////////// HOME FEED DATA ////////////////
	////////////////////////////////////////////////

	var getPublicPosts = function () {
		homeFeedService.getPulicPosts()
			.then(function (response) {
				$scope.publicPosts = response;
			})
	}
	getPublicPosts();

	$scope.getMorePosts = function () {
		//turn on loading gif
		$scope.autoLoad = true;

		homeFeedService.getMorePosts()
			.then(function (response) {
				$scope.publicPosts = response;
				$scope.autoLoad = false;
			})
	}

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