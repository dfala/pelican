var app = angular.module('pelicanApp');

app.directive('superShare', function () {
	return {
		restrict: 'A',
		templateUrl: 'templates/supershare.html',
		link : function (scope, element, attrs) {

			$('#postModal').on('shown.bs.modal', function () {
				
				var url = window.location.href; // window.location.href

				  // URL CLEANSING ///////////////////////////////////////////////////////////////////////////////////////////////
				  var cleanURL = url.replace("www.", "")
				  var wwwURL = url.replace("://", "://www.")

				  // SHARE COUNTS ///////////////////////////////////////////////////////////////////////////////////////////////
				  var twitterCount = 0;
				  var fbCount = 0;
				  var fbComments = 0;
				  var liCount = 0;

				  // SUMMING VARIABLES ///////////////////////////////////////////////////////////////////////////////////////////////
				  var totalCount = 0;
				  var roundedCount = 0;

				  // COUNTER VARIABLES ///////////////////////////////////////////////////////////////////////////////////////////////
				  var countInterval = 50;
				  var distance = 15;


				  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				  // SET SHARE URLS ON SHARE BUTTONS
				  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

				  $('#fbURL').attr("href", "javascript:window.open('http%3A%2F%2Fwww.facebook.com%2Fshare.php?u=" + url + "', '_blank', 'width=400,height=500');void(0);")
				  $('#twitterURL').attr("href", "javascript:window.open('https://twitter.com/intent/tweet?text=&amp;url=" + url + "', '_blank', 'width=400,height=500');void(0);")
				  $('#liURL').attr("href", "javascript:window.open('https://www.linkedin.com/shareArticle?url=" + url + "', '_blank', 'width=400,height=500');void(0);")




				  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				  // UPDATE SHARECOUNT
				  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

				  var updateCount = function () {
				    totalCount = twitterCount + fbCount + fbComments + liCount;
				    animateCount();
				  }



				  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				  // ANIMATE SHARECOUNT
				  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

				  var animateCount = function () {
				    var number = 0;
				    if (totalCount < distance) {
				      number = 0;
				    } else if (totalCount > distance) {
				      number = totalCount - distance;
				    }
				    var countup2 = setInterval(function () {
				      $('#shareCount').text(number);
				      if (number >= totalCount) {
				        clearInterval(countup2);
				      }
				      number++;
				    }, countInterval);
				  };



				  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				  // GET & ADD SHARES
				  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

				  // GET TWITTER SHARES
				  var getTwitter = (function () {
				  	
				    jQuery.getJSON('https://cdn.api.twitter.com/1/urls/count.json?url='+ cleanURL + '&callback=?', function (data) {
				      if (data.count) {
				        twitterCount = twitterCount + data.count;
				      };
				    });

				    jQuery.getJSON('https://cdn.api.twitter.com/1/urls/count.json?url='+ wwwURL + '&callback=?', function (data) {
				      if (data.count) {
				        twitterCount = twitterCount + data.count;
				      };
				    });

				  })();


				  //GET FACEBOOK SHARES & COMMENTS
				  var getFacebook = (function () {
				    
				    jQuery.getJSON('https://graph.facebook.com/' + url, function (data) {
				      if (data.shares) {
				        fbCount = fbCount + data.shares;
				        updateCount();
				      }
				      if (data.comments) {
				        fbComments = fbCount + data.comments;
				        updateCount();
				      }
				    });

				  })();


				  //GET LINKEDIN SHARES
				  var getLinkedIn = (function () {

				    jQuery.getJSON('https://www.linkedin.com/countserv/count/share?url=' + url + '&callback=?', function (data) {
				      if (data.count) {
				        liCount = liCount + data.count;
				      }
				      updateCount();
				    });

				  })();

			});
		}
	}
})