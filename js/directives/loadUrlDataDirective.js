// angular.module('pelicanApp')

// .directive('loadUrlData', function ($sce) {
// 	return {
// 		link: function ($scope, elem, attrs) {

// 			/*
// 									 \	  /
// 									 \\	 //
// 									  \\//
// 									  /////
// 				                     ///+//
// 				                    ////////
// 				                    ///
// 			   \\  ////////:://:://::/
// 			    \\//////:://:://::///
// 				 \///:://:://:://::/
// 				    //:://::///:://
// 				  	//			 //
// 				  	//			 //
// 				  	--			 --
// 			*/

// 			var PAGE_TITLE = "Pelican News";


// 			// CLEAN APPENDED STUFF (?ref=facebook, etc.) OFF BASE URL
// 			var getBaseUrl = function() {
// 				return window.location.href.split('?')[0];
// 			}

// 			// CLEAR ID FROM URL
// 			$scope.clearUrl = function() {
// 				var url = getBaseUrl();
// 				window.history.pushState({}, PAGE_TITLE, url);
// 			}

// 			// ADD ID TO URL
// 			$scope.appendToUrl = function (append) {
// 				var url = getBaseUrl() + "/posts/" + append;
// 				window.history.pushState({}, PAGE_TITLE, url);
// 			}


// 			// GET ANY PARAMETER YOU WANT FROM THE URL
// 			function getParameterByName(name) {
// 			  var newId = location.search;
// 			  newId = newId.substring(4);

// 			  return newId;
// 			}

// 			// GET ID FROM THE URL

// 			// TODO: bring this back
// 			// var idToGet = getParameterByName('id');
// 			var idToGet;

// 			//////////////////////////////////////////////////////////////////////////////////
// 			//////////////////////////////////////////////////////////////////////////////////

// 			var searchForItemById = function (id) {
// 			    //look at each one until you find it.
			    
// 			    //go over each collection
// 			    for (var i = 0; i < $scope.collections.length; i++) {
// 			        //get the collection
// 			        var collection = $scope.collections[i];
// 			        //get the items out of the collection
// 			        var items = collection.items;
			        
// 			        //go over each item
// 			        for (var x = 0; x < items.length; x++) {
// 			            //get the item
// 			            var item = items[x];
			            
// 			            if (item.id == id) {
// 			                return item;
// 			            } else {
// 			                //keep going and look at the next one
// 			            }
// 			        }
// 			    }
			    
// 			    //if you make it to the end return null AKA not found
// 			    return null;
// 			};

// 			if (idToGet !== '') {
// 			    //search for the correct article to show.
// 			    var pathToPost = new Firebase('https://pelican.firebaseio.com/posts/' + idToGet);

// 				pathToPost.once('value', function (response) {
// 					var data = response.val();
// 					if (!data) return

// 					// console.log('data.link', data);

// 					$('#postModal').modal('show');
// 					$scope.postId = data.postId;
// 					$scope.activeTitle = data.title;
// 					if (data.link) { $scope.activeLink = data.link; }
// 					if (data.description) { $scope.activeDescription = data.description; }
// 					if (data.comments) {
// 						var comments = data.comments;
// 						var orderedComments = [];

// 						for (var key in comments) {
// 							orderedComments.unshift(comments[key]);
// 						}

// 						$scope.postComments = orderedComments;
// 					}

// 					$scope.$digest();
// 				})
// 			}
// 		}
// 	}
// })