var app = angular.module('pelicanApp');

app.factory('cookiesService', function() {
	////////////////////////////////////////////////////////////
	var service = {};
	////////////////////////////////////////////////////////////


	service.getCookie = function () {
	    var cookie = document.cookie;
	    return cookie;
	}

	service.checkCookie = function () {
	    var userId = this.getCookie();
	    userId = userId.substring(3);

	    if (userId) {
	        return userId;
	    }
	}

	// second param defines number of days until cookie expires
	service.setCookie = function (cookieValue, expDate) {
	    var d = new Date();
	    d.setTime(d.getTime() + (expDate*24*60*60*1000));
	    var expires = "expires=" + d.toUTCString();

	    // create cookie
	    document.cookie = "id=" + cookieValue + "; path=/; " + expires;
	}

	service.deleteCookie = function (callback) {
		date = Date();
		document.cookie = 'id=; expires=' + date + ';';
		setTimeout(callback, 50);
	}

	////////////////////////////////////////////////////////////
	return service;
	////////////////////////////////////////////////////////////
});