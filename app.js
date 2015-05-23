var express = require('express');
var app = express();

app.use(express.static(__dirname + '/'));

var portNum = 3000;
app.listen(portNum, function () {
	console.log('Now rendering you honors in port: ' + portNum)
});