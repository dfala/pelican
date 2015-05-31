angular.module('pelicanApp')
.service('cookies', function() {


	///////////////////
	// SETTING COOKIES
	///////////////////

	this.getCookie = function () {
	    var cookie = document.cookie;
	    return cookie;
	}

	this.checkCookie = function () {
	    var userId = this.getCookie();
	    userId = userId.substring(3);

	    if (userId) {
	        return userId;
	    }
	}

	// second param defines number of days until cookie expires
	this.setCookie = function (cookieValue, expDate) {
	    var d = new Date();
	    d.setTime(d.getTime() + (expDate*24*60*60*1000));
	    var expires = "expires=" + d.toUTCString();

	    // create cookie
	    document.cookie = "id=" + cookieValue + "; path=/; " + expires;
	}

	this.deleteCookie = function (callback) {
		date = Date();
		document.cookie = 'id=; expires=' + date + ';';
		setTimeout(callback, 50);
	}

})




