var http = require('http');
var url = process.argv[2];
var ur2 = process.argv[2];
var ur3 = process.argv[2];


http.get(url, function(request) {
  //console.log("Got response: " + request.statusCode);
  var result = "";
  request.setEncoding("utf8");
  request.on("data", function(data){
  	result +=data;
  });
  request.on("end", function (){
  	console.log(result.length);
  	console.log(result);  })
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});