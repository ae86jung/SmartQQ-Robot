/**
 * Created by lenovo on 2017/8/18.
 */
const co = require("co");
const Answer = require('../answer');
var extend = {};

extend.getAnswer = co.wrap(function *(question) {
	return new Promise((resolve, reject) => {
		question = question.toString().trim();
		if(!question){
			resolve({});
		}
		const keys = Object.keys(Answer);
		var answer = "";
		var isExtend = false;
		for(var i in keys){
			if(keys[i].indexOf(question) > -1){
				isExtend = true;
				answer = Answer[keys[i]];
				break;
			}
		}
		resolve({answer, isExtend});
	})
})

module.exports = extend;