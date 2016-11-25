var express = require('express');
var app = express();
// 引入fortune.js，
var fortune = require('./lib/fortune.js');
//引入cookie密钥
var credentials = require('./credentials.js');
//购物车校验中间件
var cartValidation = require('./lib/cartValidation.js');

//引入formidable，用于上传文件
var formidable = require('formidable');

//引入nodemailer，用于发送邮件
var nodemailer = require('nodemailer');

var mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password,
    }
});

// var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });

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

//创建了一个视图引擎
app.engine('handlebars', handlebars.engine);
//并对Express进行了配置，将其作为默认的视图引擎
app.set('view engine', 'handlebars');

//通过设置环境变量覆盖端口
app.set('port', process.env.PORT || 3000);

app.set('env', 'production');

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

//创建一个中间件给res.locals.partials 对象添加天气数据
app.use(function(req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = getWeatherData();
    next();
});

//引入中间件cookie-parser
app.use(require('cookie-parser')(credentials.cookieSecret));
//会话中间件
app.use(require('express-session')());

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

//返回newsletter表单
app.get('/newsletter', function(req, res) {
    // 我们会在后面学到CSRF……目前，只提供一个虚拟值
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

//处理提交的newsletter表单，303重定向到/thank-you
/*app.post('/process', function(req, res) {
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);
    res.redirect(303, '/thank-you');
});*/

//处理提交的newsletter表单
/*app.post('/newsletter', function(req, res) {
    var name = req.body.name || '',
        email = req.body.email || '';
    // 输入验证
    if (!email.match(VALID_EMAIL_REGEX)) {
        if (req.xhr) return res.json({ error: 'Invalid name email address.' });
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid.',
        };
        return res.redirect(303, '/newsletter/archive');
    }
    new NewsletterSignup({ name: name, email: email }).save(function(err) {
        if (err) {
            if (req.xhr) return res.json({ error: 'Database error.' });
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later.',
            }
            return res.redirect(303, '/newsletter/archive');
        }
        if (req.xhr) return res.json({ success: true });
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter.',
        };
        return res.redirect(303, '/newsletter/archive');
    });
});*/

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

app.get('/contest/vacation-photo', function(req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

app.get('/jq', function(req, res) {
    res.render('jquerytest', { layout: 'jquerylayout' });
});

//app.get 是我们添加路由的方法。以下匹配get方法的/路径请求
app.get('/', function(req, res) {
    res.render('home');
    //服务器设置cookie
    res.cookie('monster', 'nom nom');
    res.cookie('signed_monster', 'nom nom', { signed: true });
});

app.get('/about', function(req, res) {
    //获取cookie
    var monster = req.cookies.monster;
    console.log(monster);
    var signedMonster = req.signedCookies.signed_monster;
    console.log(signedMonster);
    //将随机获取的元素以对象形式返回, 并将测试脚本名称返回
    res.render('about', { fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js' });
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


app.listen(app.get('port'), function() {
    console.log('Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.');
});

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
