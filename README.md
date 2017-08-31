# SmartQQ Robot
使用nodejs的express框架解析网页版QQ的登陆流程，实现网页版QQ信息获取与发送

# 获取流程
**1.获取网页QQ登陆的二维码：**
```javascript
https://ssl.ptlogin2.qq.com/ptqrshow?appid=501004106&e=2&l=M&s=3&d=72&v=4&t=0.657933852345947&daid=164
```
* 使用https模块读取该地址，下载图片到本地，同时记录请求连接返回的cookies
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
				getSatusInterval = setInterval( () => {
					qrcode.getQrcodeStatus(qstrtoken, cookies, resolve);
				}, 2000);
			}, 1500);
		});
	});
})
	.end();
```