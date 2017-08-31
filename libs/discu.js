/**
 * Created by lenovo on 2017/8/16.
 */
//讨论组相关信息
var request = require("request")
var cookie = require('cookie');
var co = require("co");
var Discu = {};
Discu.assessToken = null;
Discu.cookies = null;
Discu.application = null;

Discu.getList = co.wrap(function *(psessionid, vfwebqq, cookies) {
	return new Promise((resolve, reject) => {
		co(function *() {
			const listArr = yield getListImp(psessionid, vfwebqq, cookies);
			resolve(listArr);
		})
	})
});

const getListImp = co.wrap(function *(psessionid, vfwebqq, cookies) {
	return new Promise((resolve, reject) => {
		const time = new Date().getTime();
		const url = `http://s.web2.qq.com/api/get_discus_list?clientid=53999199&psessionid=${psessionid}&vfwebqq=${vfwebqq}&t=${time}`;
		console.log(url);
		request({
				url:url,
				method: "GET",
				headers: {
					'Accept':'*/*',
					'Accept-Language':'zh-CN,zh;q=0.8',
					'Content-Type':'utf-8',
					'referer': 'http://s.web2.qq.com/proxy.html?v=20130916001&callback=1&id=1',
					'cookie': cookies,
					'Host':'s.web2.qq.com',
					'Proxy-Connection':'keep-alive'
				}
			}, function (error, response, body) {
				console.log("-----------discusList---------");
				let json = JSON.parse(body.toString());
				console.log(JSON.stringify(json));
				if(Number.parseInt(json.retcode) === 0){
					const listArr = json.result.dnamelist;
					resolve(listArr);
				}
		});
	})
});

Discu.getListMember = co.wrap(function *(list, assessToken, cookies, application){
	return new Promise((resolve, reject) => {
		Discu.assessToken = Discu.assessToken || assessToken;
		Discu.cookies = Discu.cookies || cookies;
		Discu.application = Discu.application || application;
		co(function *() {
			for(var i in list){
				let did = list[i].did;
				yield getListMemberImp(did);
			}
			resolve();
		});
	});
});

const getListMemberImp = co.wrap(function *(did) {
	return new Promise((resolve, reject) => {
		const time = new Date().getTime();
		const url = `http://d1.web2.qq.com/channel/get_discu_info?did=${did}&vfwebqq=${Discu.assessToken.vfwebqq}&clientid=53999199&psessionid=${Discu.assessToken.psessionid}&t=${time}`;
		request({
			url:url,
			method: "GET",
			headers: {
				'Accept':'*/*',
				'Accept-Language':'zh-CN,zh;q=0.8',
				'Content-Type':'utf-8',
				'referer': 'http://d1.web2.qq.com/proxy.html?v=20151105001&callback=1&id=2',
				'cookie': Discu.cookies,
				'Host':'d1.web2.qq.com',
				'Proxy-Connection':'keep-alive'
			}
		}, function (error, response, body) {
			console.log("-----------discusMember---------");
			let json = JSON.parse(body.toString());
			console.log(JSON.stringify(json));
			if(Number.parseInt(json.retcode) === 0){
				let arr = json.result.mem_info;
				for(var i in arr){
					Discu.application.discuMember.set(arr[i].uin, arr[i].nick);
				}
				resolve();
			}else{
				console.log("discusMember 获取错误");
			}
		});
	});
});

module.exports = Discu;