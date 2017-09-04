# SmartQQ Robot
使用nodejs的express框架解析网页版QQ的登陆流程，实现网页版QQ信息获取与发送

# 获取流程
**1.获取网页QQ登陆的二维码：**
```javascript
https://ssl.ptlogin2.qq.com/ptqrshow?appid=501004106&e=2&l=M&s=3&d=72&v=4&t=0.657933852345947&daid=164
```
* 使用https模块读取该地址，下载图片到本地。在下载完成时，使用child_process模块开启线程打开图片，同时记录请求连接返回的cookies
```javascript
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
				//...省略...
			}, 1500);
		});
	});
})
	.end();
```
* 图片下载打开成功后，需要不断去轮询二维码的状态，轮询状态需要携带参数，`记得携带cookie，修改refer为https://xui.ptlogin2.qq.com/cgi-bin/xlogin?daid=164&target=self&style=40&mibao_css=m_webqq&appid=501004106&enable_qlogin=0&no_verifyimg=1&s_url=http%3A%2F%2Fw.qq.com%2Fproxy.html&f_url=loginerroralert&strong_login=1&login_state=10&t=20131024001`
```javascript
//查看二维码状态的url： https://ssl.ptlogin2.qq.com/ptqrlogin?u1=http%3A%2F%2Fw.qq.com%2Fproxy.html&ptqrtoken='这个是变量'&ptredirect=0&h=1&t=1&g=1&from_ui=1&ptlang=2052&action=0-0-1502764648924&js_ver=10227&js_type=1&login_sig=8XMAlaR-gznVLyggu6Rn7cFYTephrrEUh3lJ*E8ycUJqtpmqfYZ*fQ186QtIGBQF&pt_uistyle=40&aid=501004106&daid=164&mibao_css=m_webqq&
//其中 ptqrtoken是一个变量，是通过对cookies加密后得到的结果
//加密算法
function GetToken(t) {
	for (var e = 0,i = 0,n = t.length; n > i; ++i)
		e += (e << 5) + t.charCodeAt(i);
	return 2147483647 & e
}

const option={
	hostname:'ssl.ptlogin2.qq.com',
	path:`/ptqrlogin?u1=http%3A%2F%2Fw.qq.com%2Fproxy.html&ptqrtoken=${qstrtoken}&ptredirect=0&h=1&t=1&g=1&from_ui=1&ptlang=2052&action=0-0-1502764648924&js_ver=10227&js_type=1&login_sig=8XMAlaR-gznVLyggu6Rn7cFYTephrrEUh3lJ*E8ycUJqtpmqfYZ*fQ186QtIGBQF&pt_uistyle=40&aid=501004106&daid=164&mibao_css=m_webqq&`,
	headers:{
		'accept':'*/*',
		'accept-Encoding':'gzip, deflate', 
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
```
* 二维码可能返回的4种状态如下：
```javascript
	ptuiCB('66','0','','0','二维码未失效。(9位随机码)', '');
```
```javascript
	ptuiCB('65','0','','0','二维码已失效。(9位随机码)', '');
```
```javascript
	ptuiCB('67','0','','0','二维码认证中。(9位随机码)', '');
```
```javascript
	ptuiCB('0','0','返回的url地址','0','登录成功！', 'QQ昵称');
```
* 扫描成功后，服务器会返回一个url地址和用户昵称，把返回的url地址保存下载。当然，cookie也要保存下来，第一步终于完成了，然后进行第二步

**2.第二步 获取ptwebqq**
* 带上refer`http://s.web2.qq.com/proxy.html?v=20130916001&callback=1&id=1`和第一步获取的cookie去访问第一步获取到url地址
* 请求得到的状态是302，我们可以从返回的头部中获取到服务器返回的cookie，其中cookie中有ptwebqq这个参数（但我测试了几个账号，也没返回这个值，没返回没关系，置为空就行）
```javascript
Cookie:RK=; pgv_pvi=; tvfe_boss_uuid=; pac_uid=; eas_sid=; pgv_pvid=; o_cookie=; pgv_si=; p_uin=; p_skey=; pt4_token=; pt2gguin=; uin=; skey=; ptisp=; ptcz=
```
* 这里有个需要注意的地方，因为cookie中带有DOMAIN，PATH，EXPIRES等无用cookie，需要将其去除掉，然后拼接为cookie字符串
```javascript
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
```
* 记录ptwebqq和处理后的cookie，完成第二步，接下来是第三步了

**3.第三步 获取vfwebqq**
* 需要用到的参数：第二步处理后的cookie和ptwebqq
* 带上refer`http://s.web2.qq.com/proxy.html?v=20130916001&callback=1&id=1`和cookie 访问`http://s.web2.qq.com/api/getvfwebqq?ptwebqq=${ptwebqq}&clientid=53999199&psessionid=&t=0.1`
* 其中变量ptwebqq是第二步获取到的
```javascript
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
```
* 如果成功，返回一个json，如下
```javascript
{"retcode":0,"result":{"vfwebqq":"7a9d56e1ce7c1fd526d7b478cfc862ee50559999dfd4c525557673a0ad0021f773ae199e32b07522"}}
```
* 取出其中的vfwebqq，保存下来，第三步完成

**4.第四步 获取psessionid和uin（二次登陆）**

* 需要用到的参数：第二步获取到的`ptwebqq`、固定为53999199的`clientid`、置为空的`psessionid`、设置为"online"的`status`
* 注意这里的提交方式不是普通的get和post，需要用到表单post提交方式，携带上第二步保存的cookie
* 请求地址：`http://d1.web2.qq.com/channel/login2`， refer： `http://d1.web2.qq.com/proxy.html?v=20151105001&callback=1&id=2`
```javascript
const options = "r="+JSON.stringify({
		"ptwebqq":ptwebqq || "",
		"clientid": 53999199,
		"psessionid": "",
		"status": "online"
	});
const urlCode = encodeURI(options);
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
		//...省略处理过程...
	})
```
* 正确返回的结果如下：
```
{"result":{"cip":23600812,"f":0,"index":1075,"port":47450,"psessionid":"8368046764001d636f6e6e7365727665725f77656271714031302e3133332e34312e383400001ad00000066b026e040015808a206d0000000a406172314338344a69526d0000002859185d94e66218548d1ecb1a12513c86126b3afb97a3c2955b1070324790733ddb059ab166de6857","status":"online","uin":xxx,"user_state":0,"vfwebqq":"59185d94e66218548d1ecb1a12513c86126b3afb97a3c2955b1070324790733ddb059ab166de6857"},"retcode":0}
```
* 这里也返回一个`vfwebqq`，但是这个`vfwebqq`没用
* 处理json串取到pessionid和uin

**5.第五步 轮训收信息**
* 请求方式：Post
* url：http://d1.web2.qq.com/channel/poll2
* referer：http://d1.web2.qq.com/proxy.html?v=20151105001&callback=1&id=2
* 请求参数只有一个r，值是一个 JSON，内容为：
```
{
    "ptwebqq": ptwebqq,
    "clientid": 53999199,
    "psessionid": psessionid,
    "key": ""
}
```
* `ptwebqq`和`psessionid`都是登录后获得的参数。
* 请求成功后返回的内容为:
```
{
    "result": [
        {
            "poll_type": "message",
            "value": {
                "content": [
                    [
                        "font",
                        {
                            "color": "000000",
                            "name": "微软雅黑",
                            "size": 10,
                            "style": [
                                0,
                                0,
                                0
                            ]
                        }
                    ],
                    "好啊"
                ],
                "from_uin": 3785096088,
                "msg_id": 25477,
                "msg_type": 0,
                "time": 1450686775,
                "to_uin": 931996776
            }
        }
    ],
    "retcode": 0
}
```
* poll_type为message表示这是个好友消息。
  from_uin是用户的编号，可以用于发消息，但不是 qq号。
  to_uin是接受者的编号，同时也是 qq号。
  time为消息的发送时间，content [0]为字体，后面为消息的内容。其他字段暂时不知道有何意义。
* 如果为群消息，返回内容为：
```javacript
{
    "result": [
        {
            "poll_type": "group_message",
            "value": {
                "content": [
                    [
                        "font",
                        {
                            "color": "000000",
                            "name": "微软雅黑",
                            "size": 10,
                            "style": [
                                0,
                                0,
                                0
                            ]
                        }
                    ],
                    "好啊",
                ],
                "from_uin": 2323421101,
                "group_code": 2323421101,
                "msg_id": 50873,
                "msg_type": 0,
                "send_uin": 3680220215,
                "time": 1450687625,
                "to_uin": 931996776
            }
        }
    ],
    "retcode": 0
}
```
* 其中poll_type会变成group_message，group_code和from_uin都为群的编号，可以用于发群消息，但不是群号。send_uin为发信息的用户的编号。其他的字段和上面的相同。