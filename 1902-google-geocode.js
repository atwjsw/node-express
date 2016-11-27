var geocode = require('./lib/geocode.js');

geocode("267 William Graham Dr., Aurora, ON, L4G0W4, Canada", function(result) {
	console.log("google returned");
	console.log(result);
});