var app = angular.module('pelicanApp');

app.factory('contentService', function ($q) {
	var service = {};
	////////////////////////////////////////////////////////////


	var listsRef = new Firebase('https://pelican.firebaseio.com/lists');
	var userRef;

	service.createList = function(listName, passedUserRef, id) {
		var deferred = $q.defer();

		userRef = passedUserRef;

		var newList = {
			listName: listName,
			userId: id,
			timestamp: Firebase.ServerValue.TIMESTAMP,
			posts: 'coming soon'
		}

		// var newListRef = firebase.child('users/' + $scope.activeUser.id + '/lists').push(newList);
		var newListRef = listsRef.push(newList);
		
		// get key of recent post
		listToAdd = newListRef.key();
		deferred.resolve(listToAdd);

		// add key to list object
		listsRef.child(listToAdd).update({listId: listToAdd});

		// add key to user lists
		userRef.child('lists').push(listToAdd);

		return deferred.promise;
	}




	////////////////////////////////////////////////////////////
	return service;
})