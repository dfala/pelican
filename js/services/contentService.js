var app = angular.module('pelicanApp');

app.factory('contentService', function () {
	var service = {};
	////////////////////////////////////////////////////////////


	var listsRef = new Firebase('https://pelican.firebaseio.com/lists');
	var userRef;

	service.createList = function(listName, passedUserRef, id) {
		userRef = passedUserRef;

		var newList = {
			listName: listName,
			userId: id,
			timestamp: Firebase.ServerValue.TIMESTAMP,
			posts: 'coming soon'
		}

		// var newPostRef = firebase.child('users/' + $scope.activeUser.id + '/lists').push(newList);
		var newPostRef = listsRef.push(newList);
		
		// get key of recent post
		listToAdd = newPostRef.key();

		// add key to list object
		listsRef.child(listToAdd).update({listId: listToAdd});

		// add key to user lists
		userRef.child('lists').push(listToAdd);
	}




	////////////////////////////////////////////////////////////
	return service;
})