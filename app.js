// node
var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var tools = require('./server');


// Define the port to run on
app.set('port', 3000);
// Get static file
app.use(express.static(path.join(__dirname, 'public')));

// Listen for requests
var uri = null;
var server = app.listen(app.get('port'), function() {
	var port = server.address().port;
	console.log('Magic happens on port ' + port+  '\n' );
	Action();
});

//Get Values from Form
function Action(){
	app.post('/', upload.array(), function (req, res, next) {
  	//console.log(req.body);
		//res.json(req.body);

		exports.Uri= req.body.uri;
		exports.Tolerance = req.body.tolerance;

		// Call server.js
		deal = tools.scraping();
		console.log("Deal from app.js = "+deal);
		if (deal=="good")
			res.sendFile('public/good.html', {root: __dirname })
		else if (deal=="bad")
			res.sendFile('public/bad.html', {root: __dirname })
		else
			res.sendFile('public/error.html', {root: __dirname })

	});
};
