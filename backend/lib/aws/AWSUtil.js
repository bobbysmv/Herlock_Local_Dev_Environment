(function () {
	//'use strict';
	// var path = require('path');
	var AWS  = require('aws-sdk');
	AWS.config.loadFromPath( __dirname +  '/../../config/aws_config.json');
	// var S3  = require('./modules/S3Module.js');
	var S3  = require( __dirname + '/modules/S3Module.js');

	// s3以外にもあればkeyを増やして行くイメージ
	module.exports = {
		S3: S3.getInstance(AWS)
	};
})();