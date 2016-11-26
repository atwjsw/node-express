var main = require('./handlers/main.js');
var vacations = require('./handlers/vacations.js');
var contest = require('./handlers/contest.js');

module.exports = function(app) {
    //主页相关路由
    app.get('/', main.home);
    app.get('/about', main.about);

    //vacations相关路由
    app.get('/vacations', vacations.vacations);    
    app.get('/set-currency/:currency', vacations.set_currency);
    app.get('/notify-me-when-in-season', vacations.get_notify_me_when_in_season); 
    app.post('/notify-me-when-in-season', vacations.post_notify_me_when_in_season); 

    //contest相关路由
    app.get('/contest/vacation-photo', contest.get_vacation_photo);
	app.post('/contest/vacation-photo/:year/:month', contest.post_vacation_photo);

	


};