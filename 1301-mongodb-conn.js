var express = require('express');
var app = express();
var mongoose = require('mongoose');
var credentials = require('./credentials.js');
var Vacation = require('./models/vacation.js');

/*var opts = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};

switch (app.get('env')) {
    case 'development':
        var conn = mongoose.connect(credentials.mongo.development.connectionString, opts);
        console.log("dev: " + conn);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        console.log("prod: " + conn);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}*/
mongoose.connect(credentials.mongo.development.connectionString);
Vacation.find(function(err, vacations) {
    if(err) {
        console.log('Error ' + err);
        return;
    }
    if (vacations.length) {
        console.log('data exists');
        return;
    }
    new Vacation({
        name: 'Hood River Day Trip',
        slug: 'hood-river-day-trip',
        category: 'Day Trip',
        sku: 'HR199',
        description: 'Spend a day sailing on the Columbia and ' +
            'enjoying craft beers in Hood River!',
        priceInCents: 9995,
        tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
        inSeason: true,
        maximumGuests: 16,
        available: true,
        packagesSold: 0,
    }).save();
    new Vacation({
        name: 'Oregon Coast Getaway',
        slug: 'oregon-coast-getaway',
        category: 'Weekend Getaway',
        sku: 'OC39',
        description: 'Enjoy the ocean air and quaint coastal towns!',
        priceInCents: 269995,
        tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
        inSeason: false,
        maximumGuests: 8,
        available: true,
        packagesSold: 0,
    }).save();
    new Vacation({
        name: 'Rock Climbing in Bend',
        slug: 'rock-climbing-in-bend',
        category: 'Adventure',
        sku: 'B99',
        description: 'Experience the thrill of climbing in the high desert.',
        priceInCents: 289995,
        tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
        inSeason: true,
        requiresWaiver: true,
        maximumGuests: 4,
        available: false,
        packagesSold: 0,
        notes: 'The tour guide is currently recovering from a skiing accident.',
    }).save();
});
