var http = require('http');
var url = process.argv[2];

http.get(url, function(request) {
  //console.log("Got response: " + request.statusCode);
  request.setEncoding("utf8");
  request.on("data", function(data){
  	console.log(data);
  })
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});