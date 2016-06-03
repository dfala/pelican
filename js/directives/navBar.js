angular.module('pelicanApp')

.directive('navBar', function ($location, $timeout, loginService, cookiesService, userInfoService) {
	return {
		restrict: 'AE',
		templateUrl: 'templates/navBar.html',
		link: function (scope, elem, attrs) {
			// initial facebook request
			scope.login = function () {
				loginService.login()
					.then(function (authData) {
						checkUser(authData);
					})
			}

			// log user out
			scope.logOut = function () {
				cookiesService.deleteCookie(function () {
					console.info('logged out');
				})
				$timeout(function () {
					if(window.location.pathname === '/#/home') {
						location.reload();
					} else {
						$location.path('/#/home');
					}
				}, 50);
			}

			// checking if user exists
			var checkUser = function (data) {
				loginService.checkUser(data)
					.then(function (id) {
						scope.getUserData(id);
					}, function (id) {
						createNewUser(id);
					})
			}

			// getting data for logged-in user
			scope.getUserData = function (id) {
				userRef = new Firebase('https://pelican.firebaseio.com/users/' + id);

				loginService.getUserData(id)
					.then(function (response) {
						scope.cleanUserData(response, true);
						scope.isHomePage = false;
					})
			}

			// creating a new user
			var createNewUser = function (data) {
				var response = loginService.createNewUser(data);
				scope.activeUser = response;
				scope.getUserData(response.id);
			}

			// formatting the user's data
			scope.cleanUserData = function (userData, isUser) {
				if (!userData) return console.warn("No user data");

				if (isUser) {
					scope.isNotUserData = false;
					scope.lists = [];
					scope.posts = [];
					scope.activeUser = userData;

					// save user data on service to reference later
					userInfoService.saveUser(scope.activeUser);

				} else {
					scope.isNotUserData = true;
				}

				var firstName = userData.name.split(" ");
				scope.bannerTitle = firstName[0] + "'s Pelican";
				scope.friendList = [];


				if (userData.lists === 'lists') return userFirstLogin();

				loginService.cleanUserData(userData)
					.then(function (response) {
						scope.posts = response[1];
						combineData(response[0], isUser);
						window.scrollTo(0, 0);
					})
			}

			var combineData = function (passedList, isUser) {
				passedList.forEach(function (list, index) {
					list.posts = [];
					scope.posts.forEach(function (post, index) {
						if (post.listId === list.listId) {
							list.posts.push(post);
						}
					})
				})

				if (isUser) {
					userInfoService.storeLists(passedList);
					scope.lists = passedList;
					// $location.path('/');
				} else {
					scope.friendList = passedList;
				}
			}
		}
	}
})
