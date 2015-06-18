angular.module('pelicanApp')

.directive('modalsTemplate', function ($timeout, contentService, $location) {
	return {
		restrict: 'AE',
		templateUrl: 'templates/modals.html',
		link: function (scope, elem, attrs) {
			// firebase - post reference
			var postsRef = new Firebase('https://pelican.firebaseio.com/posts');
			var listsRef = new Firebase('https://pelican.firebaseio.com/lists');


			// User clicked on list to add post
			scope.selectList = function (list) {
				// this is a hack to trigger elastic directive on addDescription ng-model change
				var tempDescription = scope.addDescription;
				scope.addDescription = '';

				listToAdd = list;

				scope.chooseList = false;
				scope.addPost = true;
				scope.modalTitle = "Add details";
				
				$timeout(function () {
					$('#add-title').focus();
					scope.addDescription = tempDescription;
				})
			}



			// Creating a new list
			scope.createList = function(listName) {
				if (!scope.activeUser) return console.error('user not defined');
				// passedUserId defined on the parent controller
				var userRef = new Firebase('https://pelican.firebaseio.com/users/' + scope.passedUserId);

				contentService.createList(listName, userRef, scope.passedUserId)
					.then(function (listKey) {
						listToAdd = listKey;
					})
					/// get the key here and add to listToAdd

				scope.postList = '';
				scope.selectList(listToAdd);
			}

			// Create a new post
			scope.createPost = function () {
				var title = scope.postTitle;
				var link = scope.postLink;
				var description = scope.addDescription;

				// validation
				if (!listToAdd) return console.warn('listToAdd is not defined');
				if (!title) { return scope.displayAlert('Please add a title') }

				if (link) {
					// valid link?
					if (link.indexOf('.') < 0) {
						return scope.displayAlert('Please add a valid link');
					}

					// add http to link (if none)
					if (link && link.indexOf('http') < 0) {
						link = 'http://' + link;
					}
				}

				var newPost = {
					title: title,
					timestamp: Firebase.ServerValue.TIMESTAMP,
					posteeName: scope.activeUser.name,
					posteeId: scope.activeUser.id,
					posteePicUrl: scope.activeUser.picUrl,
					listId: listToAdd
				}


				// adding link
				if (link) { newPost.link = link }

				// adding description
				var postText = scope.addDescription;

				if (postText) {
					// encoding < and > for security purposes
					postText = postText.replace(/</g, "&#60;");
					postText = postText.replace(/>/g, "&#62;");
					newPost.description = postText;
				}

				// push post to post list
				var postKey = postsRef.push(newPost);
				// get id of post
				var postId = postKey.key();


				// push post id back to post
				postsRef.child('/' + postId).update({postId: postId});
				// push post id to appropriate list
				listsRef.child('/' + listToAdd + '/posts').push(postId);



				scope.closeBigModal();
				$('#addPostModal').modal('hide');

				// TODO: this is a hack -- only need to reload the lists (or posts in list)
				if (!scope.friendList && window.location.pathname !== '/home') {
					scope.lists = [];
					$location.path('/');
				} else {
					// TODO: tell the user the post was successful
				}
			}


			////////////////////////////////////////////////
			////////////////// COMMENTS ////////////////////
			////////////////////////////////////////////////


			scope.addComment = function (comment) {
				if (!comment || !scope.activePost.postId) return;

				var newComment = {
					content: comment,
					commenteeName: scope.activeUser.name,
					commenteeId: scope.activeUser.id,
					commenteePicUrl: scope.activeUser.picUrl,
					timestamp: Firebase.ServerValue.TIMESTAMP
				}

				var commentRef = new Firebase('https://pelican.firebaseio.com/posts/' + scope.activePost.postId + '/comments');
				
				// save comment
				var newRef = commentRef.push(newComment);
				newRef = newRef.key();

				// pushing id
				commentRef.child(newRef).update({commentId: newRef});
				newComment.commentId = newRef;
				
				// reflecting front-end changes
				newComment.timestamp = 'just now';
				scope.postComments.unshift(newComment);

				if (scope.isHomePage) {
					for (var m = 0; m < scope.publicPosts.length; m++) {
						if (scope.publicPosts[m].postId === scope.activePost.postId) {
							// we got our post!
							if (!scope.publicPosts[m].comments)
								scope.publicPosts[m].comments = {};

							scope.publicPosts[m].comments[newComment.commentId] = newComment;
							break;
						}
					}
				} else {
					for (var i = 0; i < scope.lists.length; i ++) {
						if (scope.lists[i].listId === scope.activePost.listId) {
							// we got our list!
							for (var m = 0; m < scope.lists[i].posts.length; m++) {
								if (scope.lists[i].posts[m].postId === scope.activePost.postId) {
									// we got our post!
									if (!scope.lists[i].posts[m].comments)
										scope.lists[i].posts[m].comments = {};

									scope.lists[i].posts[m].comments[newComment.commentId] = newComment;
									break;
								}
							}
						}
					}
				}


			}

			scope.removeComment = function (commentData) {
				// remove comment from Firebase
				var commentRef = new Firebase('https://pelican.firebaseio.com/posts/' + scope.activePost.postId + '/comments/' + commentData.commentId);
				commentRef.remove();

				// reflect front end changes
				scope.postComments = scope.postComments.filter(function (comment) {
					if (comment.commentId === commentData.commentId) {
						return false;
					} else {
						return true;
					}
				})

				// more permanent front end changes
				if (scope.isHomePage) {
					for (var m = 0; m < scope.publicPosts.length; m++) {
						if (scope.publicPosts[m].postId === scope.activePost.postId) {
							// we got our post!
							for (var key in scope.publicPosts[m].comments) {
								if (scope.publicPosts[m].comments[key].commentId === commentData.commentId) {
									// we got our comment!
									delete scope.publicPosts[m].comments[key];
								}
								break;
							}
							break;
						}
					}
				} else {
					for (var i = 0; i < scope.lists.length; i ++) {
						if (scope.lists[i].listId === scope.activePost.listId) {
							// we got our list!
							for (var m = 0; m < scope.lists[i].posts.length; m++) {
								if (scope.lists[i].posts[m].postId === scope.activePost.postId) {
									// we got our post!
									for (var key in scope.lists[i].posts[m].comments) {
										if (scope.lists[i].posts[m].comments[key].commentId === commentData.commentId) {
											// we got our comment!
											delete scope.lists[i].posts[m].comments[key];
										}
										break;
									}
									break;
								}
							}
						}
					}
				}


			}

		}
	}
})