/*// 1
console.log("HELLO WORLD");
*/

// 2
/*var result=0;
for (i=2;i<process.argv.length;i++){
	result +=Number(process.argv[i]);
}
console.log(result);*/

// 3
/*var fs = require('fs');
var filename = process.argv[2];

// synchronous
file = fs.readFileSync(filename);
contents = file.toString();

console.log(contents.split('\n').length - 1);

// asynchronous
file = fs.readFile(filename, function(err, data) {
  console.log(data.toString().split('\n').length - 1);
});
*/

// 4
function print(string path, string extension)
