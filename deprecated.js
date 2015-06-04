////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////  THIS CODE NEEDS MAJOR MASSIVE TESTING AND REFACTORING  ////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/*
						 \	  /
						 \\	 //
						  \\//
						  /////
	                     ///+//
	                    ////////
	                    ///
   \\  ////////:://:://::/
    \\//////:://:://::///
	 \///:://:://:://::/
	    //:://::///:://
	  	//			 //
	  	//			 //
	  	--			 --
*/

	var PAGE_TITLE = "Pelican News";


	// CLEAN APPENDED STUFF (?ref=facebook, etc.) OFF BASE URL
	var getBaseUrl = function() {
		return window.location.href.split('?')[0];
	}

	// CLEAR ID FROM URL
	var clearUrl = function() {
		var url = getBaseUrl();
		window.history.pushState({}, PAGE_TITLE, url);
	}

	// ADD ID TO URL
	var appendToUrl = function (append) {
		var url = getBaseUrl() + "?id=" + append;
		window.history.pushState({}, PAGE_TITLE, url);
	}

	// OPEN IFRAME
	$scope.iframeurl = function(id, url){
		$('#iframe').attr('src', url);
		appendToUrl(id);
	};

	// CLOSE IFRAME
	$('#myModal').on('hidden.bs.modal', function () {
		clearUrl();
	})

	// GET ANY PARAMETER YOU WANT FROM THE URL
	function getParameterByName(name) {
	  // name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	  // var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	  //     results = regex.exec(location.search);
	  // return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));

	  var newId = location.search;
	  newId = newId.substring(5);

	  return newId;
	}

	// GET ID FROM THE URL
	var idToGet = getParameterByName('id');

	// console.log(idToGet)

	///////////////////////////////////////////////////////////////////////////////////////////////////////


	//Programatically opening the modal (simulating the click);
	var openModal = function (id, url) {
	    $scope.iframeurl(id, url);
	    $('#myModal').modal('show');
	};

	var searchForItemById = function (id) {
	    //look at each one until you find it.
	    
	    //go over each collection
	    for (var i = 0; i < $scope.collections.length; i++) {
	        //get the collection
	        var collection = $scope.collections[i];
	        //get the items out of the collection
	        var items = collection.items;
	        
	        //go over each item
	        for (var x = 0; x < items.length; x++) {
	            //get the item
	            var item = items[x];
	            
	            if (item.id == id) {
	                return item;
	            } else {
	                //keep going and look at the next one
	            }
	        }
	    }
	    
	    //if you make it to the end return null AKA not found
	    return null;
	};

	var idToGet = getParameterByName('id');

	if (idToGet !== '') {
	    //search for the correct article to show.
	    
	    // var item = searchForItemById(id);

	    var pathToPost = new Firebase('https://pelican.firebaseio.com/posts/' + idToGet);
		// $scope.publicPosts = [];

		pathToPost.once('value', function (response) {
			var data = response.val();
			if (!data) return

			console.log('data.link', data);

			$('#postModal').modal('show');
			$scope.activeTitle = data.title;
			if (data.link) { $scope.activeLink = data.link; }
			if (data.description) { $scope.activeDescription = data.description; }

			$scope.$digest();
		})
	    
	    // if (item !== null) {
	    //     openModal(item.id, item.url);
	    // }
	}