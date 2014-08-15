
/**
 * サンプルクラス
 * @constructor
 * 
 * コンストラクター
 * @param {String} value
 */
function Sample( value ){
	this._value = value;
};

Sample.prototype = {

    /**
     * ログ
     * @param {String} txt
     */
	log: function( txt ){ 
		console.log( this._value + " " + txt ); 
	}
};



var s = new Sample("test");
s.log("aaa");



