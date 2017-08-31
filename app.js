var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var co = require('co');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

var qrcode = require('./libs/qrcode');
var Ptwebqq = require('./libs/ptwebqq');
var Vfwebqq = require('./libs/vfwebqq');
var PU = require('./libs/psessionidAndUin');
var AccessToken = require('./libs/accessToken');
var Application = require('./libs/application');
var Discu = require('./libs/discu');
var Chat = require('./libs/chat');
var accessToken = null, application = null;
// welcome
console.log(require('./libs/logo').string);


// ptwebqq：保存在 Cookie 中的鉴权信息
// vfwebqq：类似于 Token 的鉴权信息
// psessionid：类似于 SessionId 的鉴权信息
// clientid：设备 id，为固定值53999199
// uin：登录用户 id（其实就是当前登录的 QQ 号）
co(function *() {
    const {resUrl, cookies} = yield qrcode.start();
	const {ptwebqq, cookieStr} = yield Ptwebqq.get(resUrl, cookies);
    const vfwebqq = yield Vfwebqq.get(ptwebqq, cookieStr);
	const {psessionid, uin} = yield PU.get(ptwebqq, cookieStr);
	accessToken = new AccessToken(ptwebqq, vfwebqq, psessionid, null, uin);
	const discuList = yield Discu.getList(accessToken.psessionid, accessToken.vfwebqq, cookieStr)
	application = new Application(uin);
	yield Discu.getListMember(discuList, accessToken, cookieStr, application);
	Chat.connect(accessToken.ptwebqq, cookieStr, accessToken.psessionid, application);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
