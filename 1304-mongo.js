var express = require('express');
var app = express();
var mongoose = require('mongoose');

var Vacation = require('./models/vacation.js');

var credentials = require('./credentials.js');

//获取数据库连接
/*var opts = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};*/

// mongoose.connect(credentials.mongo.development.connectionString, opts);
mongoose.connect(credentials.mongo.development.connectionString);

console.log('/vacations');
Vacation.find({ available: true }, function(err, vacations) {
   /* var context = {
        vacations: vacations.map(function(vacation) {
            return {
                sku: vacation.sku,
                name: vacation.name,
                description: vacation.description,
                price: vacation.getDisplayPrice(),
                inSeason: vacation.inSeason,
            };
        })
    };*/
    
    console.log(vacations[0].name);    
    //return context;
    //mongoose.close();
    //conn.close();
});

console.log('finished: ');
