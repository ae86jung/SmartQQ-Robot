/**
 * Created by lenovo on 2017/8/16.
 */
var request = require("request");
var cookie = require('cookie');
var querystring = require('querystring');
var extend = require('./extend');
var co = require("co");
const chatConfig = require('../config/chatConfig');
var Chat = {};
Chat.application = null;
Chat.ptwebqq = null;
Chat.cookies = null;
Chat.psessionid = null;

Chat.connect = function (ptwebqq, cookies, psessionid, application) {
	return new Promise((resolve, reject) => {
		Chat.application = Chat.application || application;
		Chat.ptwebqq = Chat.ptwebqq || ptwebqq;
		Chat.cookies = Chat.cookies || cookies;
		Chat.psessionid = Chat.psessionid || psessionid;
		time(connecting, 1000)();
	})
};

const connecting = function () {
	co(function *() {
		let {did, send_nick, content} = yield connectImp(Chat.ptwebqq, Chat.cookies, Chat.psessionid);
		// let {answer, isExtend} = yield extend.getAnswer(content);
		// if(isExtend && did){
		// 	console.log("4");
		// 	yield sendMessage(psessionid, did, send_nick, answer, cookies);
		// 	console.log("3");
		// }else{
		// 	if(did){
		// 		let answerFTL = yield getAnswer(content);
		// 		console.log("2");
		// 		yield sendMessage(psessionid, did, send_nick, answerFTL, cookies);
		// 		console.log("1");
		// 	}
		// }
		if(did){
			let answerFTL = yield getAnswer(content);
			yield sendMessage(Chat.psessionid, did, send_nick, answerFTL, Chat.cookies);
		}
	})
};

const time = function (f, time) {
	return function walk() {
		setTimeout(function () {
			f();
			walk();
		}, time);
	};
};

const connectImp = co.wrap(function *(ptwebqq, cookies, psessionid) {
	return new Promise((resolve, reject) => {
		const options = "r="+JSON.stringify({
				"ptwebqq": ptwebqq || "",
				"clientid": 53999199,
				"psessionid": psessionid,
				"key": ""
			});
		const urlCode = encodeURI(options);
		request.post({
				url:'http://d1.web2.qq.com/channel/poll2',
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
			function(err, httpResponse, body){
				if(err || !body || typeof(body)!="string"){
					resolve({});
					return;
				}
				let json = body && body.toString && JSON.parse(body);
				if(parseInt(json.retcode) === 0){
					// console.log(body);
					let chatArr = json.result;
					let arrLength = chatArr &&　chatArr.length;
					let listenArr = [];
					for(var i in chatConfig){
						if(chatConfig[i].length !== 0){
							listenArr.push(i);
						}
					}
					while (arrLength--){
						let poll_type = chatArr[arrLength].poll_type;
						if(listenArr.indexOf(poll_type) > -1){
							console.log(222222222222222222222);
							console.log(body);
							// chatConfig[poll_type].indexOf();
							// let text1 = chatArr[arrLength].value.content[1];
							// let text2 = chatArr[arrLength].value.content[2];
							// let send_uin = chatArr[arrLength].value.send_uin;
							// let did = chatArr[arrLength].value.did;
							// let send_nick = Chat.application.discuMember.get(send_uin);
							// console.log(text2);
							// if(text1 && typeof(text1)==='string' && text1.charAt && text1.charAt(0) === "@"){
							// 	let content = chatArr[arrLength].value.content[3] || "";
							// 	if(isCallMe(text1.substring(1))){
							// 		console.log(`有一个sb ${send_nick} @了你：${content}`);
							// 		resolve({did, send_nick, content});
							// 		return;
							// 	}else{
							// 		resolve({});
							// 		return;
							// 	}
							// }else if(text2 && text2.charAt(0) === "@"){
							// 	let content1 =  chatArr[arrLength].value.content[1] || "";
							// 	let content2 =  chatArr[arrLength].value.content[4] || "";
							// 	let content = content1 + content2;
							// 	if(isCallMe(text2.substring(1))){
							// 		console.log(`有一个sb ${send_nick} @了你：${content}`);
							// 		resolve({did, send_nick, content})
							// 		return;
							// 	}else{
							// 		resolve({});
							// 		return;
							// 	}
							// }else{
							// 	resolve({});
							// 	return;
							// }
						}else{
							resolve({});
							return;
						}
					}
				}else{
					console.log("----------获取聊天失败---------");
					console.log(json);
					resolve({});
				}
			})
	})
});


const getAnswer = co.wrap(function *(content) {
	return new Promise( (resolve, reject) => {
		request.post({
				url:'http://www.tuling123.com/openapi/api',
				form: {
					key:"1e11b38eb27b4929967f07f85bad8162",
					info: content
				},
			},
			function(err, httpResponse, body){
				if(err){
					resolve("请求失败，你的问题有毒");
					return;
				}
				console.log(body);
				console.log(3333333333333333);
				let resJson = JSON.parse(body);
				if(Number.parseInt(resJson.code) === 100000){
					let answer = resJson.text;
					resolve(answer);
				}else{
					resolve("请求失败，你的问题有毒");
				}
			})
	})
});


const sendMessage = co.wrap(function *(psessionid, did, send_nick, answer, cookies) {
	return new Promise( (resolve, reject) => {
		let options = {
			did: did,
			content: `[\"${send_nick}, ${answer}\",[\"font\",{\"name\":\"宋体\",\"size\":10,\"style\":[0,0,0],\"color\":\"000000\"}]]`,
			face: 543,
			clientid: 53999199,
			msg_id:	parseInt( Math.random()*900000000 + 10000000),
			psessionid: psessionid
		};
		const urlCode = "r=" + encodeURIComponent(JSON.stringify(options));
		console.log("----------urlCode--------------");
		console.log(urlCode);
		request.post({
				url:'http://d1.web2.qq.com/channel/send_discu_msg2',
				form: urlCode,
				headers: {
					'Accept':'*/*',
					'Accept-Language':'zh-CN,zh;q=0.8',
					'referer': 'http://d1.web2.qq.com/cfproxy.html?v=20151105001&callback=1',
					'Host':'d1.web2.qq.com',
					'Origin':'http://d1.web2.qq.com',
					'cookie': cookies,
					'Proxy-Connection':'keep-alive'
				}
			},
			function(err, httpResponse, body){
				console.log(body);
				resolve({});
			})
	})
});



const isCallMe = function(name){
	let map = Chat.application.discuMember;
	let isMe = false;
	for (let [key, value] of map) {
		if(value === name &&　key === Chat.application.uin){
			isMe = true;
			break;
		}
	}
	return isMe;
};

module.exports = Chat;