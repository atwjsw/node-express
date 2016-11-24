var express = require('express');
var app = express();
// 引入fortune.js，
var fortune = require('./lib/fortune.js');

// 设置handlebars 视图引擎
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });

//创建了一个视图引擎
app.engine('handlebars', handlebars.engine);
//并对Express进行了配置，将其作为默认的视图引擎
app.set('view engine', 'handlebars');

//通过设置环境变量覆盖端口
app.set('port', process.env.PORT || 3000);

//把static 中间件加在所有路由之前
app.use(express.static(__dirname + '/public'));

//app.get 是我们添加路由的方法。以下匹配get方法的/路径请求
app.get('/', function(req, res) {
    res.render('home');
});

app.get('/about', function(req, res) {    
    //将随机获取的元素以对象形式返回
    res.render('about', { fortune: fortune.getFortune() });
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
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});

var fortunes = [
    "Conquer your fears or they will conquer you.",
    "Rivers need springs.",
    "Do not fear what you don't know.",
    "You will have a pleasant surprise.",
    "Whenever possible, keep it simple.",
];
