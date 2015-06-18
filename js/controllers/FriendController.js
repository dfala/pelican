angular.module('pelicanApp')

.controller('FriendController',
  function ($scope, passedUserId, cookiesService, loadListData, userInfoService, loginService) {
	

	$scope.activeUser;
	$scope.lists = [];
	$scope.modalTitle = "Pick a list";
	var userId = cookiesService.checkCookie();
	$scope.passedUserId = passedUserId.userId;


	var getUserData = function () {
		console.log(userId, 'userId');
		loginService.getUserData(userId)
			.then(function (userInfo) {
				$scope.activeUser = userInfo;
			})
			.catch(function (err) {
				throw new Error(err);
			})
	}

	var loadUserLists = function () {
		loadListData.loadLists(userId)
			.then(function (listData) {
				$scope.lists = listData;
			})
			.catch(function (err) {
				throw new Error(err);
			})
	}

	var loadAllUserData = function () {
		var userData = userInfoService.serveUser();

		// get user data
		if (Object.getOwnPropertyNames(userData.user).length > 0) {
			$scope.activeUser = userData.user;
		} else {
			getUserData();	
		}

		// get list data
		loadUserLists();
	}

	if (userId) {
		loadAllUserData()
	} else {
		// TODO: the user is not signed-up... deal with it
	}


	////////////////////////////////////////////////
	/////////////// SETING PROFILES ////////////////
	////////////////////////////////////////////////

	var seeProfile = function (posteeId, isUser) {
		if (!isUser)
			isUser = false;
		
		var posteeRef = new Firebase('https://pelican.firebaseio.com/users/' + posteeId);

		posteeRef.once('value', function (data) {
			// save user in service for later ref
			if (isUser)
				userInfoService.saveUser(data.val())

			$scope.cleanUserData(data.val(), isUser);
			$scope.isHomePage = false;
			// $scope.$digest();
		})
	}

	var checkForPassedUserId = function () {
		seeProfile(passedUserId.userId, passedUserId.isUser);
	}
	
	// detecting passed user id
	if (passedUserId) {
		userRef = new Firebase('https://pelican.firebaseio.com/users/' + passedUserId.userId);
		checkForPassedUserId();
	}
})