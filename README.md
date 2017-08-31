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