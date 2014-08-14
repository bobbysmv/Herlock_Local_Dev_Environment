(function () {
	var Uploader   = {};
	// var JSONModule = require('./modules/JSONModule.js');
	// var ZipModule  = require('./modules/ZipModule.js');
	var JSONModule = require( __dirname + '/modules/JSONModule.js');
	var ZipModule  = require( __dirname + '/modules/ZipModule.js');

	Uploader.createDefaultJSON = function () {
		return JSONModule.createDefaultJSON();
	};

	Uploader.updateJSON = function (jsonString, version) {
		return JSONModule.updateJSON( jsonString, version );
	};


	module.exports = Uploader;
})();