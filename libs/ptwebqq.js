/**
 * Created by lenovo on 2017/8/15.
 */
var http = require("http")
var cookie = require('cookie');
var fs = require("fs");
var co = require("co");
var Ptwebqq = {};

Ptwebqq.get = co.wrap(function *(url, cookies) {
	return new Promise((resolve, reject) => {
		co(function *() {
			const ptwebqq = yield getImp(url, cookies);
			resolve(ptwebqq);
		});
	})
});

const getImp = co.wrap(function *(url, cookies) {
	return new Promise((resolve, reject) => {
		url = url.replace("http://ptlogin2.web2.qq.com", "");
		console.log(url);
		const options = {
			hostname: 'ptlogin2.web2.qq.com',
			path: url,
			method: 'GET',
			headers: {
				'referer':'http://s.web2.qq.com/proxy.html?v=20130916001&callback=1&id=1',
				'cookies': cookies
			}
		};
		http.request(options, (res) => {
			console.log('STATUS:'+res.statusCode);
			console.log('HEADERS:'+JSON.stringify(res.headers));
			var cookies = res.headers['set-cookie'];
			if(cookies){
				var cookieJson =  cookie.parse(cookies.toString());
				const ptwebqq = cookieJson.ptwebqq || '';
				console.log("--------------------完美分界线+------------")
				var cookieStr = handleCookie(cookieJson);
				console.log("--------------------完美分界线+------------")
				console.log(cookieStr);
				resolve({ptwebqq,  cookieStr});
			}

		}).on('error', (e) => {
			console.error(e);
			reject('错误');
		}).end();
	})
});

const handleCookie = function (cookieJson) {
	let keys = Object.keys(cookieJson);
	var str = "";
	for(var i in keys){
		if(keys[i] == "EXPIRES" || keys[i] == "PATH" ||keys[i] == "DOMAIN"){
			continue;
		}
		str = str + keys[i].replace(",", "") + "=" + cookieJson[keys[i]] + ";";
	}
	return str;
}

module.exports = Ptwebqq;
