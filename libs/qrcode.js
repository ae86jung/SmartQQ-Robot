/*处理二维码和登录*/
var execFile = require("child_process").execFile;
var https = require("https")
var cookie = require('cookie');
var fs = require("fs");
var co = require("co");
var qrcode = {};
var getSatusInterval = null;


//开始生成和处理二维码
qrcode.start = co.wrap(function *() {
	return new Promise(function (resolve, reject) {
		https.get("https://ssl.ptlogin2.qq.com/ptqrshow?appid=501004106&e=2&l=M&s=3&d=72&v=4&t=0.657933852345947&daid=164", function(res){
			var imgData = "";

			res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


			res.on("data", function(chunk){
				imgData+=chunk;
			});

			res.on("end", function(){
				fs.writeFile("static/img/qr.png", imgData, "binary", function(err){
					if(err){
						console.log(err);
						console.log("down fail");
						reject("down fail");
						return;
					}
					console.log("down success");
					setTimeout( () => {
						execFile("node", ["./libs/open.js"], function (err) {
							console.log(err);
						});
						var cookies = res.headers['set-cookie'][0];
						var qrsig = cookie.parse(cookies).qrsig;
						console.log('qrsig: ' + qrsig);
						var qstrtoken = GetToken(qrsig);
						getSatusInterval = setInterval( () => {
							qrcode.getQrcodeStatus(qstrtoken, cookies, resolve);
						}, 2000);
					}, 1500);
				});
			});
		})
			.end();
	})
});

qrcode.getQrcodeStatus = function(qstrtoken, cookies, resolve){
	co(function* () {
		const resStr = yield getCodeFromNet(qstrtoken, cookies);
		const resUrl = handlerResStr(resStr).replace(/\'/g, '');
		if(resUrl){
			resolve({resUrl, cookies});
		}
	});
}

const getCodeFromNet = co.wrap(function *(qstrtoken, cookies) {
	return new Promise((resolve, reject) => {
		const option={
			hostname:'ssl.ptlogin2.qq.com',
			path:`/ptqrlogin?u1=http%3A%2F%2Fw.qq.com%2Fproxy.html&ptqrtoken=${qstrtoken}&ptredirect=0&h=1&t=1&g=1&from_ui=1&ptlang=2052&action=0-0-1502764648924&js_ver=10227&js_type=1&login_sig=8XMAlaR-gznVLyggu6Rn7cFYTephrrEUh3lJ*E8ycUJqtpmqfYZ*fQ186QtIGBQF&pt_uistyle=40&aid=501004106&daid=164&mibao_css=m_webqq&`,
			headers:{
				'accept':'*/*',
				'accept-Encoding':'gzip, deflate',  //这里设置返回的编码方式 设置其他的会是乱码
				'accept-Language':'zh-CN,zh;q=0.8',
				'connection':'keep-alive',
				'host':'ssl.ptlogin2.qq.com',
				'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.1.3228.1 Safari/537.36',
				'referer':'https://xui.ptlogin2.qq.com/cgi-bin/xlogin?daid=164&target=self&style=40&mibao_css=m_webqq&appid=501004106&enable_qlogin=0&no_verifyimg=1&s_url=http%3A%2F%2Fw.qq.com%2Fproxy.html&f_url=loginerroralert&strong_login=1&login_state=10&t=20131024001',
				'cookie': cookies
			}
		};
		https.get(option,  (res) => {
			res.on('data', (d) => {
				resolve(d.toString());
			})
		})
		.on('error', (e) => {
			console.error(e);
			reject('错误');
		});
	})
});

const handlerResStr = function (resStr) {
	if(resStr.indexOf("二维码未失效") > -1){
		console.log("正在等待扫描...");
		return ;
	}
	if(resStr.indexOf("二维码失效") > -1){
		console.log("二维码失效...");
		return ;
	}
	if(resStr.indexOf("二维码认证中") > -1){
		console.log("二维码认证中...");
		return ;
	}
	console.log(resStr);
	if(resStr.indexOf("登录成功") > -1){
		const resUrl = resStr.split(',')[2];
		const resNickname = resStr.split(',')[5].replace(');', '');
		console.log("登录成功："+ resNickname);
		if(getSatusInterval){
			clearInterval(getSatusInterval);
			getSatusInterval = null;
		}
		return resUrl;
	}
}

function GetToken(t) {
	for (var e = 0,i = 0,n = t.length; n > i; ++i)
		e += (e << 5) + t.charCodeAt(i);
	return 2147483647 & e
}

module.exports = qrcode;