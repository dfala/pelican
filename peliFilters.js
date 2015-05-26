var pelicanApp = angular.module('pelicanApp');

pelicanApp.filter('searchContent', function() {

	return function(input, searchQuery, optional2) {

		if (!searchQuery) return input;

		var output = [];
		searchQuery = searchQuery.toLowerCase();

		input.forEach(function (list) {
			var tempListName = list.listName.toLowerCase();

			// Search functionality for list titles
			if (tempListName.indexOf(searchQuery) > -1) {
				return output.push(list);


			} else {

				// TODO: THIS DOES NOT WORK YET
				// This is saving posts with the searchQuery on title
				// but not sure how to return it

				// var tempPost = [];
				// for (var key in list.posts) {

				// 	var tempPostName = list.posts[key].title.toLowerCase();	
					
				// 	if (tempPostName.indexOf(searchQuery) > -1) {
				// 		tempPost.push(list.posts[key]);
				// 	}

				// }
			}
		})

		return output;

	}
});


pelicanApp.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);