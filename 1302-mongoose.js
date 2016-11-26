var express = require('express');
var app = express();
var mongoose = require('mongoose');
var credentials = require('./credentials.js');
var Vacation = require('./models/vacation.js');

/*var db = mongoose.connect("mongodb://127.0.0.1:27017/test");
db.connection.on("error", function(error) {
    console.log("数据库连接失败：" + error);
});
db.connection.on("open", function() {
    console.log("------数据库连接成功！------");
});
*/

//mongoose.connect("mongodb://localhost/meadowlark");
//mongoose.connect(credentials.mongo.development.connectionString);
//
var opts = {
    /*server: {
        socketOptions: { keepAlive: 1 }
    }*/
};
switch (app.get('env')) {
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}
Vacation.find({ available: true }, function(err, vacations) {
	if (err) {
		console.log('Error: ' + err);
	}
    console.log(vacations[0].name);
    /*vacations: vacations.map(function(vacation) {
        return {
            sku: vacation.sku,
            name: vacation.name,
            description: vacation.description,
            price: vacation.getDisplayPrice(),
            inSeason: vacation.inSeason,
        };
    })*/
    //return vacations;
});

mongoose.connection.on('error', function(err) {
	console.log(err);
});