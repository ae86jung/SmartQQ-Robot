/**
 * Created by lenovo on 2017/8/16.
 */
/**
 * @param _disculist 讨论组列表
 */
class Application {
	constructor(uin){
		this._disculist = [];
		this._discuMember = new Map();
		this._uin = uin || "";
	}
	get disculist(){
		return this._disculist;
	}
	set disculist(disculist){
		console.log(`讨论组列表发生改变:${this._disculist.toString()} => ${disculist.toString()}`)
		this._disculist = disculist;
	}
	get discuMember(){
		return this._discuMember;
	}
	get uin(){
		return this._uin;
	}
}

module.exports = Application;