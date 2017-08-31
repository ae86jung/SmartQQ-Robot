/**
 * Created by lenovo on 2017/8/16.
 */
var request = require("request")
var cookie = require('cookie');
var querystring = require('querystring');
var co = require("co");
var PU = {};
var body = "";

PU.get = function (ptwebqq, cookies) {
	return new Promise((resolve, reject) => {
		co(function *() {
			const {psessionid, uin} = yield PUImp(ptwebqq, cookies);
			resolve({psessionid, uin});
		})
	})
}

const PUImp = co.wrap(function *(ptwebqq, cookies) {
	return new Promise((resolve, reject) => {
		console.log(cookies);

		const options = "r="+JSON.stringify({
				"ptwebqq":ptwebqq || "",
				"clientid": 53999199,
				"psessionid": "",
				"status": "online"
			});
		console.log("..........options..........");
		console.log(options);
		const urlCode = encodeURI(options);
		console.log("..........urlCode..........");
		console.log(urlCode);
		request.post({
				url:'http://d1.web2.qq.com/channel/login2',
				form: urlCode,
				headers: {
					'Accept':'*/*',
 					'Accept-Language':'zh-CN,zh;q=0.8',
					'referer': 'http://d1.web2.qq.com/proxy.html?v=20151105001&callback=1&id=2',
					'cookie': cookies,
					'Host':'d1.web2.qq.com',
					'Origin':'http://d1.web2.qq.com',
					'Proxy-Connection':'keep-alive'
				}
			},
			function(err,httpResponse,body){
				let psessionid = '';
				let uin = '';
				console.log("-----------pessionid---------")
				let json = JSON.parse(body.toString());
				if(parseInt(json.retcode) === 0){
					psessionid = json.result.psessionid;
					uin = json.result.uin;
					resolve({psessionid, uin});
				}else{
					console.log('------获取psessionid和uin失败-------')
					console.log(body.toString())
				}
			})
	})
});


module.exports = PU;