var express = require('express');
var app = express();
var fs = require('fs');
var mongoose = require('mongoose');
// 引入fortune.js，
var fortune = require('./lib/fortune.js');
//引入cookie密钥
var credentials = require('./credentials.js');
//购物车校验中间件
var cartValidation = require('./lib/cartValidation.js');

var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo.connectionString });
//引入中间件cookie-parser
app.use(require('cookie-parser')(credentials.cookieSecret));
//会话中间件
app.use(require('express-session')({ store: sessionStore }));

//引入nodemailer，用于发送邮件
var nodemailer = require('nodemailer');

//数据库模型对象
var Vacation = require('./models/vacation.js');
var VacationInSeasonListener = require('./models/vacationInSeasonListener.js');

var mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password,
    }
});

// 设置handlebars 视图引擎
var handlebars = require('express3-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

// 设置handlebars 视图引擎
var handlebars = require('express3-handlebars').create({
    defaultLayout: 'main',    
    helpers: {
        //通过helpers支持section
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        //通过helpers支持静态资源路径映射
        static: function(name) {
            return require('./lib/static.js').map(name);
        }
    }
});


//创建了一个视图引擎
app.engine('handlebars', handlebars.engine);
//并对Express进行了配置，将其作为默认的视图引擎
app.set('view engine', 'handlebars');

//通过设置环境变量覆盖端口
app.set('port', process.env.PORT || 3000);

//app.set('env', 'production');

//中间件来检测查询字符串中的test=1；如果test=1 出现在任何页面的查询字符串中（并且不是运行在生产服务器上），
//属性res.locals.showTests 就会被设为true
app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

//把static 中间件加在所有路由之前
app.use(express.static(__dirname + '/public'));

//logging
switch (app.get('env')) {
    case 'development':
        // 紧凑的、彩色的开发日志
        console.log('development logger');
        app.use(require('morgan')('dev'));
        break;
    case 'production':
        // 模块'express-logger' 支持按日志循环
        console.log('production logger');
        app.use(require('express-logger')({
            path: __dirname + '/log/requests.log'
        }));
        break;
}

//获取数据库连接
var opts = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};
mongoose.connect(credentials.mongo.development.connectionString, opts);

app.use(function(req, res, next) {
    var cluster = require('cluster');
    if (cluster.isWorker) console.log('Worker %d received request',
        cluster.worker.id);
    next();
});

//创建一个中间件给res.locals.partials 对象添加天气数据
app.use(function(req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = getWeatherData();
    next();
});

app.use(function(req, res, next) {
    // 如果有即显消息，把它传到上下文中，然后清除它
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

//使用body-parser中间件处理表单
app.use(require('body-parser')());

//使用购物车中间件校验
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

require('./routes.js')(app);

//返回newsletter表单
app.get('/newsletter', function(req, res) {
    // 我们会在后面学到CSRF……目前，只提供一个虚拟值
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

//处理ajax和正常表单提交
app.post('/process', function(req, res) {
    if (req.xhr || req.accepts('json,html') === 'json') {
        // 如果发生错误，应该发送 { error: 'error description' }
        console.log('ajax');
        res.send({ success: true });
    } else {
        // 如果发生错误，应该重定向到错误页面
        console.log('form');
        res.redirect(303, '/thank-you');
    }
});

app.get('/jq', function(req, res) {
    res.render('jquerytest', { layout: 'jquerylayout' });
});

app.get('/tours/hood-river', function(req, res) {
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res) {
    res.render('tours/request-group-rate');
});

//客户端Handelbars模板演示代码
//通过JavaScript 来直接渲染，
app.get('/nursery-rhyme', function(req, res) {
    res.render('nursery-rhyme', { layout: 'jquerylayout' });
});

// 另一个通过AJAX 调用来渲染
app.get('/data/nursery-rhyme', function(req, res) {
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});

var Attraction = require('./models/attraction.js');
app.get('/api/attractions', function(req, res) {
    Attraction.find({ approved: true }, function(err, attractions) {
        if (err) return res.send(500, 'Error occurred: database error.');
        res.json(attractions.map(function(a) {
            return {
                name: a.name,
                id: a._id,
                description: a.description,
                location: a.location,
            };
        }));
    });
});

app.post('/api/attraction', function(req, res) {
    console.log('/api/attraction ' + req.body);
    var a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date(),
        },
        approved: false,
    });
    a.save(function(err, a) {
        if (err) return res.send(500, 'Error occurred: database error.');
        res.json({ id: a._id });
    });
});

app.get('/api/attraction/:id', function(req, res) {
    console.log('/api/attraction/:id ' + req.body);
    Attraction.findById(req.params.id, function(err, a) {
        if (err) return res.send(500, 'Error occurred: database error.');
        res.json({
            name: a.name,
            id: a._id,
            description: a.description,
            location: a.location,
        });
    });
});





// 404 catch-all 处理器（中间件）
app.use(function(req, res, next) {
    res.status(404);
    res.render('404');
});

// 500 错误处理器（中间件）
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});


/*app.listen(app.get('port'), function() {
    console.log('Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.');
});*/


function startServer() {
    //http.createServer(app).listen(app.get('port'), function() {
    app.listen(app.get('port'), function() {
        console.log('Express started in ' + app.get('env') +
            ' mode on http://localhost:' + app.get('port') +
            '; press Ctrl-C to terminate.');
    });
}

//添加集群支持
if (require.main === module) {
    // 应用程序直接运行；启动应用服务器
    startServer();
} else {
    // 应用程序作为一个模块通过"require" 引入: 导出函数
    // 创建服务器
    module.exports = startServer;
}


//创建一个方法来获取当前天气数据
function getWeatherData() {
    return {
        locations: [{
            name: 'Portland',
            forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
            iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
            weather: 'Overcast',
            temp: '54.1 F (12.3 C)',
        }, {
            name: 'Bend',
            forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
            iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
            weather: 'Partly Cloudy',
            temp: '55.0 F (12.8 C)',
        }, {
            name: 'Manzanita',
            forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
            iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
            weather: 'Light Rain',
            temp: '55.0 F (12.8 C)',
        }, ],
    };
}
