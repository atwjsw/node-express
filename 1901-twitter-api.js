var https = require('https');
var credentials = require('./credentials.js');

var twitter = require('./lib/twitter')({
    consumerKey: credentials.twitter.consumerKey,
    consumerSecret: credentials.twitter.consumerSecret,
});

twitter.search('#trump', 10, function(result) {
    // 推文会在result.statuses 中
    console.log("twitter returned");
    console.log(result.statuses);
});
