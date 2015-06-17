var app = angular.module('pelicanApp');

app.factory('cookiesService', function() {
	var service = {};

	// DEPRECATED (loading cookie on resolve ng-routes)
	service.getCookie = function () {
	    var cookie = document.cookie;
	    return cookie;
	}

	// DEPRECATED (loading cookie on resolve ng-routes)
	service.checkCookie = function () {
	    var userId = this.getCookie();
	    userId = userId.substring(3);

	    if (userId) {
	        return userId;
	    } else {
	    	return undefined;
	    }
	}

	// second param defines number of days until cookie expires
	service.setCookie = function (rawText, expDate) {
		var cookieValue = rawText;

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

	return service;
});