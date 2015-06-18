angular.module('pelicanApp')

.directive('uxUi', function ($sce, $timeout) {
	return {
		link: function ($scope, elem, attrs) {
			var firebase = new Firebase("https://pelican.firebaseio.com/");
			$scope.postComments = [];

			// Set value of page (home page vs. user page)
			$scope.homePage = function (value) {
				// animate to the top
				console.log('shouldn\' get hit')
				$('html, body').animate({scrollTop : 0},0);

				$scope.isHomePage = value;
				if (value === false && $scope.activeUser) {
					$scope.getUserData($scope.activeUser.id);
				} else {
					$scope.bannerTitle = "The Pelican Blog";
				}
				$scope.cleanSearchQuery();
			}


			// Set-content-on-post modal
			$scope.changeModal = function (post) {
				$scope.activePost = post;

				// $scope.activeTitle = post.title;
				// $scope.activeLink = post.link;
				// $scope.activeDescription = post.description;
				// $scope.posteePicUrl = post.posteePicUrl;
				// $scope.posteeName = post.posteeName;
				// $scope.listId = post.listId;
				// $scope.postId = post.postId;

				if (post.comments) {
					for (var key in post.comments) {
						$scope.postComments.unshift(post.comments[key]);
					}
				}

			}

			// Add-new-post modal
			$scope.openBigModal = function (optionalTitle) {
				// User clicked on the plus btn next to the title
				if (optionalTitle) return $scope.selectList(optionalTitle);

				$scope.chooseList = true;
				$scope.addPost = false;
			}

			// Cloding add-new-post modal
			$scope.closeBigModal = function () {
				// Reset the process
				listToAdd = '';
				$scope.addPost = false;
				$scope.editingPost = false;
				$scope.alertMessage = '';
				$scope.modalTitle = "Pick a list";
				$scope.postList = '';

				$scope.postTitle = '';
				$scope.postLink = '';
				$scope.addDescription = '';
				$scope.newComment = '';
				$('body').css('overflow', 'auto');
			}



			$timeout(function () {
				// when big modal closes
				$('#addPostModal').on('hidden.bs.modal', function () {
			    	$scope.closeBigModal();
				})

				// when post modal closes
				$('#postModal').on('hidden.bs.modal', function () {
			    	$scope.postComments = [];
			    	$scope.postTitle = '';
					$scope.postLink = '';
					$scope.addDescription = '';
					$scope.newComment = '';
					// $scope.clearUrl();
				})
			}, 150)



			// open edit post modal
			$scope.editPostModal = function(title, link, content) {
				// set modal
				$scope.modalTitle = 'Edit post';

				$scope.chooseList = false;
				$scope.addPost = true;
				$scope.editingPost = true;

				// set values
				$scope.postTitle = title;
				$scope.postLink = link;

				// focus on title
				$timeout(function () {
					$('#add-title').focus();
					$scope.addDescription = content;
				})
			}



			$scope.updatePostModal = function (deletePost) {
				var postRef = 'posts/' + $scope.activePost.postId;
				var postInListRef = new Firebase('https://pelican.firebaseio.com/lists/' + $scope.activePost.listId + '/posts');

				if (deletePost) {
					firebase.child(postRef).remove();

					//TODO: does this work?
					postInListRef.orderByValue().equalTo($scope.activePost.postId).once('value', function (snapshot) {
						var object = snapshot.val();

						for (var key in object) {
							postInListRef.child(key).remove();
						}

					});

					clearUpdate();
					return
				}

				var newDescription = $scope.addDescription;
				var newTimestamp = Firebase.ServerValue.TIMESTAMP;

				var updatedPost = {
					title: $scope.postTitle,
					timestamp: newTimestamp
				}

				// Validation
				if (!$scope.postTitle) { return $scope.displayAlert('Please add a title') }
				if (newDescription) { updatedPost.description = newDescription } else { updatedPost.description = null }
				
				if ($scope.postLink) {
					// valid link?
					if ($scope.postLink.indexOf('.') < 0) {
						return $scope.displayAlert('Please add a valid link');
					}

					// add http to link (if none)
					if ($scope.postLink && $scope.postLink.indexOf('http') < 0) {
						$scope.postLink = 'http://' + $scope.postLink;
					}

					updatedPost.link = $scope.postLink
				} else {
					updatedPost.link = null
				}

				firebase.child(postRef).update(updatedPost);
				clearUpdate();
			}



			var clearUpdate = function () {
				// Closing modals
				$('#addPostModal').modal('hide');
				$('#postModal').modal('hide');

				//TODO: this is a hack -- only need to get the thread
				$scope.lists = [];
				$scope.getUserData($scope.activeUser.id);
				$scope.closeBigModal();
			}


			// Add-new-post alert message
			$scope.displayAlert = function(message) {
				$scope.alertMessage = message;
			}


			// Highlighting text
			$scope.highlight = function(text, search) {
			    if (!search) {
			        return $sce.trustAsHtml(text);
			    }
			    return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlightedText">' + search + '</span>'));
			};

			$scope.cleanSearchQuery = function () {
				$scope.textSearch = '';
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

		}
	}
})