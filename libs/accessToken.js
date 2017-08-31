/**
 * Created by lenovo on 2017/8/15.
 */
// ptwebqq：保存在 Cookie 中的鉴权信息
// vfwebqq：类似于 Token 的鉴权信息
// psessionid：类似于 SessionId 的鉴权信息
// clientid：设备 id，为固定值53999199
// uin：登录用户 id（其实就是当前登录的 QQ 号）
class AccessToken{
	constructor(ptwebqq, vfwebqq, psessionid, clientid, uin){
		this._ptwebqq = ptwebqq || "";
		this._vfwebqq = vfwebqq || "";
		this._psessionid = psessionid || "";
		this._clientid = clientid || "53999199";
		this._uin = uin || "2332608748";
	};
	get ptwebqq(){
		return this._ptwebqq;
	};
	set ptwebqq(ptwebqq){
		console.log(`ptwebqq值发生变化${this._ptwebqq} => ${ptwebqq}`);
		this._ptwebqq = ptwebqq;
	};
	get vfwebqq(){
		return this._vfwebqq;
	};
	set vfwebqq(vfwebqq){
		console.log(`vfwebqq值发生变化${this._vfwebqq} => ${vfwebqq}`);
		this._vfwebqq = vfwebqq;
	};
	get psessionid(){
		return this._psessionid;
	};
	set psessionid(psessionid){
		console.log(`psessionid 值发生变化${this._psessionid} => ${psessionid}`);
		this._psessionid = psessionid;
	};
	get clientid(){
		return this._clientid;
	};
	set clientid(clientid){
		console.log(`clientid 值发生变化${this._clientid} => ${clientid}`);
		this._clientid = clientid;
	};
	get uin(){
		return this._clientid;
	};
	set uin(uin){
		console.log(`uin 值发生变化${this._uin} => ${uin}`);
		this._uin = uin;
	};
}

module.exports = AccessToken;