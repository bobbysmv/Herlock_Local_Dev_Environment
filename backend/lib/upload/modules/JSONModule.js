(function () {
	var moment = require('moment');


	var JSONModule = {};
	var config = require( __dirname + '/../../../config/config.js' );

	function data_format(version, isOpen, path, date) {
		return {
			version: version,
			is_open: isOpen,
			file_path: path,
			date: date
		}
	}

	JSONModule.createDefaultJSON = function () {
		var path = "https://s3-ap-northeast-1.amazonaws.com/" + config['bucket_name'] + '/' + config[config.env]['zip_key'] + '/zip1.zip';

		var data = {
			success: true,
			status: 200,
			data: [
				data_format( 1, 1, path, moment().format('YYYYMMDDHHmmss') )
			]
		};

		return JSON.stringify( data );
	};

	JSONModule.updateJSON = function (jsonString, version) {
		var obj     = JSON.parse( jsonString );
		var data    = obj.data;
		var path    = "https://s3-ap-northeast-1.amazonaws.com/" + config['bucket_name'] + '/' + config[config.env]['zip_key'] + '/zip' + version + '.zip';
		var addData = data_format( 1, 1, path, moment().format('YYYYMMDDHHmmss') );

		data.push( addData );

		return JSON.stringify( obj );
	};

	module.exports = JSONModule;
})();