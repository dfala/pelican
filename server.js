var express = require('express');
var app = express();

app.use(express.static(__dirname + '/'));

// dealing with 404 errors
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/search', function (req, res) {
 res.redirect('/#/search');
})

app.get('/home', function (req, res) {
 res.redirect('/#/home');
})

app.get('/profile', function (req, res) {
 res.redirect('/#/profile');
})

app.get('/bookmark', function (req, res) {
 res.redirect('/#/bookmark');
})

app.use(function(req, res) {
 res.status(400);
 res.render(__dirname + '/templates/404', {title: '404: File not Found'});
});

// var portNum = 80;
var portNum = 3000;
app.listen(portNum, function () {
	console.log('Now rendering you honors in port: ' + portNum)
});
