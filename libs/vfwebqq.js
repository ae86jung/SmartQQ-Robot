/**
 * Created by lenovo on 2017/8/15.
 */
var http = require("http")
var cookie = require('cookie');
var fs = require("fs");
var co = require("co");
var Vfwebqq = {};

Vfwebqq.get = co.wrap(function *(ptwebqq, cookies) {
	return new Promise( (resolve, reject) => {
		co(function *() {
			const vfwebqq = yield getImp(ptwebqq, cookies);
			resolve(vfwebqq);
		});
	});
});

const getImp = co.wrap(function *(ptwebqq, cookies) {
	return new Promise((resolve, reject) => {
		var time = new Date().getTime();
		var url = `/api/getvfwebqq?ptwebqq=${ptwebqq}&clientid=53999199&psessionid=&t=0.1`;
		console.log(url);
		const options = {
			hostname: 's.web2.qq.com',
			path: url,
			method: 'GET',
			headers: {
				'content-type': 'application/json;charset=utf-8',
				'referer':'http://s.web2.qq.com/proxy.html?v=20130916001&callback=1&id=1',
				'cookie': cookies
			}
		};
		http.request(options, (res) => {
			console.log('STATUS:'+res.statusCode);
			console.log('HEADERS:'+JSON.stringify(res.headers));
			res.on('data', (d) => {
				console.log("----------vfwebqq-----------");
				const resJson = JSON.parse(d.toString());
				console.log(resJson);
				var vfwebqq = '';
				if(parseInt(resJson.retcode) === 0){
					vfwebqq = resJson.result.vfwebqq;
				}
				resolve(vfwebqq)

			})

		}).on('error', (e) => {
			console.error(e);
			reject('错误');
		}).end();
	})
})


module.exports = Vfwebqq;