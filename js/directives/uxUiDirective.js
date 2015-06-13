angular.module('pelicanApp')

.directive('uxUi', function ($sce, $timeout) {
	return {
		link: function ($scope, elem, attrs) {
			var firebase = new Firebase("https://pelican.firebaseio.com/");
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
				$scope.activeTitle = post.title;
				$scope.activeLink = post.link;
				$scope.activeDescription = post.description;
				$scope.posteePicUrl = post.posteePicUrl;
				$scope.posteeName = post.posteeName;
				$scope.listId = post.listId;
				$scope.postId = post.postId;

				if (post.comments) {
					for (var key in post.comments) {
						$scope.postComments.unshift(post.comments[key]);
					}
				}

				// DEPRECATED
				// changeHash(post.postId);
				
				// $scope.appendToUrl(post.postId);
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
				console.log('closing');

				// Reset the process
				listToAdd = '';
				$scope.addPost = false;
				$scope.editingPost = false;
				$scope.alertMessage = '';
				$scope.modalTitle = "Pick a list";


				$scope.postTitle = '';
				$scope.postLink = '';
				$scope.addDescription = '';
				$scope.newComment = '';
				$('body').css('overflow', 'auto');
			}

			// TODO: this part is not working
			// on boostrap close modal trigger closeBigModal();
			$('#addPostModal').on('hidden.bs.modal', function () {
		    	$scope.closeBigModal();
			})

			// TODO: check if this part is working
			$('#postModal').on('hidden.bs.modal', function () {
		    	$scope.postComments = [];
		    	$scope.postTitle = '';
				$scope.postLink = '';
				$scope.addDescription = '';
				$scope.newComment = '';
				$scope.clearUrl();

			})



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
				var postRef = 'posts/' + $scope.postId;
				var postInListRef = new Firebase('https://pelican.firebaseio.com/lists/' + $scope.listId + '/posts');

				if (deletePost) {
					firebase.child(postRef).remove();

					//TODO: removing the post from lists/posts does not work
					postInListRef.orderByValue().equalTo($scope.postId).once('value', function (snapshot) {
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

		}
	}
})