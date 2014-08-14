// var config = require('./config/config.js');
var config = require( __dirname + '/config/config.js');

// コマンドライン引数から環境をセット
/*
function setEnvFromArgument() {
	// 不要な引数を消す
	process.argv.splice(0,2);
	if ( process.argv.length > 0 && ( process.argv[0] === 'prod' || process.argv[0] === 'stg' ) ) {
		config.env = process.argv[0];
	} else if (process.argv.length === 0) {

	} else {
		throw new Error('invalid argument : "' + process.argv[0] + '". You can set "prod" or "stg"' );
	}
}

try{
	setEnvFromArgument();
} catch(e) {
	console.log(e);
	return;
}
*/

/**
 * [getEnvVersion description]
 * @param  {string} env stg or prod
 * @return {[type]}     [description]
 */
function getCurrentVersionWithEnv(env) {
	var fs = require('fs');
	var data = fs.readFileSync( __dirname + '/config/release_version.json');
	var version = JSON.parse( data.toString() )[config.env];

	return version;
}

function setCurrentVersionWithEnv(env, version) {
	var fs       = require('fs');
	// var filePath = './config/release_version.json';
	var filePath = __dirname + '/config/release_version.json';

	var data   = fs.readFileSync( filePath );
	var params = JSON.parse( data.toString() );
	params[config.env] = version;
	var newJson = JSON.stringify( params );
	// fs.writeFileSync('./config/release_version.json', newJson);
	fs.writeFileSync( __dirname + '/config/release_version.json', newJson);
};


/**
 * 処理が異なる最初の関数だけ引数でセットしてそれ以外は共通関数だからこの関数内でセットする
 * @param  {function} firstFunction [description]
 * @param  {number} version [description]
 * @return {[type]}               [description]
 */
function createWaterFallFunctions (firstFunction, version) {
	// var AWSUtil  = require('./lib/aws/AWSUtil.js');
	// var Uploader = require('./lib/upload/Uploader.js');
	var AWSUtil  = require( __dirname + '/lib/aws/AWSUtil.js');
	var Uploader = require( __dirname + '/lib/upload/Uploader.js');
	var fs       = require('fs');

	var jsonKey = config[config.env]['json_key'] + '/update.json';
	var zipKey  = config[config.env]['zip_key'] + '/zip' + version + '.zip';
	// var zipPath = './git_diff_archive/' + config.zip_name;
	var zipPath = __dirname + '/git_diff_archive/' + config.zip_name;

	var functions = [];
	functions.push( firstFunction );

	// 初回アップロード2回目アップロード　共通部分
	var commonFunctions = [
		// jsonアップロード -----------------------------
		function(jsonData, callback) {
			AWSUtil.S3.putObject(config.bucket_name, jsonKey, jsonData, 'application/json', function(data) {
				callback(!data);
			});
		},
		// zipデータ取得 ---------------------------------
		function(callback) {
			//TODO git 差分のみ取得

			var zipData = fs.readFileSync( zipPath );

			callback(!zipData, zipData)
		},
		// zipデータアップロード -----------------------------
		function(zipData, callback) {
			AWSUtil.S3.putObject(config.bucket_name, zipKey, zipData, 'application/zip', function(data) {
				callback(!data, callback);
			});
		}
	];

	return functions.concat( commonFunctions );
}


// 初回アップロード ---------------------------------------------------------
/**
 * 実際にはバケット作成とasync.waterFallの関数の配列の生成。アップロード処理はupload関数で行っている
 * @param  {number} version next release version
 * @return {[type]}         [description]
 */
function uploadFirst(version) {
	console.log("初回アップロード 開始 ----------------------------------------");
	// var AWSUtil  = require('./lib/aws/AWSUtil.js');
	// var Uploader = require('./lib/upload/Uploader.js');
	var AWSUtil  = require( __dirname + '/lib/aws/AWSUtil.js');
	var Uploader = require( __dirname + '/lib/upload/Uploader.js');

	AWSUtil.S3.createBucket(config.bucket_name, function (data) {

		var waterfallFunctions = createWaterFallFunctions( function( callback ){
			var jsonData = Uploader.createDefaultJSON();
			callback(null, jsonData);
	    }, version );

		upload(waterfallFunctions, version);
	});
}

// 2回目以降アップロード ----------------------------------------------
/**
 * 実際にはasync.waterFallの関数の配列の生成。アップロード処理はupload関数で行っている
 * @param  {number} version [description]
 * @return {[type]}         [description]
 */
function uploadSecond(version) {
	console.log("2回目以降アップロード 開始, version : " + version);
	// var AWSUtil  = require('./lib/aws/AWSUtil.js');
	// var Uploader = require('./lib/upload/Uploader.js');
	var AWSUtil  = require( __dirname + '/lib/aws/AWSUtil.js');
	var Uploader = require( __dirname + '/lib/upload/Uploader.js');

	var jsonKey = config[config.env]['json_key'] + '/update.json';

	var waterfallFunctions = createWaterFallFunctions( function( callback ){
		AWSUtil.S3.getObject( config.bucket_name, jsonKey, function (data) {
    		if (!data) {
    			callback(true);
    		}

    		var jsonData = Uploader.updateJSON(data.Body.toString(), version);
    	 	callback(null, jsonData)
    	});
    }, version );


	upload(waterfallFunctions, version);
}


function upload(waterfallFunctions, version) {
	var async  = require('async');

	async.waterfall( waterfallFunctions, function (err, result) {
		if(err) {
			// TODOアップロードした物を削除する機能実装
			throw err;
		}
		completedUpload(version);
		console.log("アップロード 終了----------------------------------------");
	});
}


function completedUpload(version) {
	setCurrentVersionWithEnv(config.env, version);

	var exec       = require('child_process').exec;
	var argString  = config.zip_name;
	var command    = __dirname + '/git_diff_archive/rm_zip.sh ' + argString;

	exec(command, {}, function (error, stdout, stderr) {

	});
}

// 実際の処理が始まるところ -------------------------------------------------------
// (function () {
// 	// 0なら初めてのアップロード, 1以上ならファイル更新
// 	var currentVersion = parseInt( getCurrentVersionWithEnv(config.env) );
// 	var nextVersion    = currentVersion + 1;

// 	var exec       = require('child_process').exec;

// 	// 実行ファイル(引数付き)のコマンド生成 ----------------------------------------
// 	var repository  = config.repository;
// 	var prefix      = config.unzip_prefix;
// 	var zipName     = config.zip_name;
// 	var nextTagName = config.env + '-v' + nextVersion;

// 	var command;
// 	var argString;

// 	if (currentVersion > 0) {
// 		var targetTagName = config.env + '-v' + currentVersion;
// 		argString = repository + ' ' + targetTagName + ' ' + nextTagName + ' ' + prefix + ' ' + zipName
// 	} else {
// 		argString = repository + ' ' + nextTagName + ' ' + prefix + ' ' + zipName
// 	}

// 	command = './git_diff_archive/git_flow.sh ' + argString;


// 	exec(command, {}, function (error, stdout, stderr) {
// 		if (error) {
// 			throw error
// 		}

// 		if (currentVersion > 0) {
// 			// 2回目以降のアップロード処理
// 			uploadSecond( nextVersion );
// 		} else {
// 			// 初回アップロード処理
// 			uploadFirst( nextVersion );
// 		}

// 	});

// })();

exports.run = function (env) {
	config.env = env;

	// 0なら初めてのアップロード, 1以上ならファイル更新
	var currentVersion = parseInt( getCurrentVersionWithEnv(config.env) );
	var nextVersion    = currentVersion + 1;

	var exec       = require('child_process').exec;

	// 実行ファイル(引数付き)のコマンド生成 ----------------------------------------
	var repository  = config.repository;
	var prefix      = config.unzip_prefix;
	var zipName     = config.zip_name;
	var nextTagName = config.env + '-v' + nextVersion;

	var command;
	var argString;

	if (currentVersion > 0) {
		var targetTagName = config.env + '-v' + currentVersion;
		argString = repository + ' ' + targetTagName + ' ' + nextTagName + ' ' + prefix + ' ' + zipName
	} else {
		argString = repository + ' ' + nextTagName + ' ' + prefix + ' ' + zipName
	}

	command = __dirname + '/git_diff_archive/git_flow.sh ' + argString;

	exec(command, {}, function (error, stdout, stderr) {

		if (error) {
			throw error
		}

		if (currentVersion > 0) {
			// 2回目以降のアップロード処理
			uploadSecond( nextVersion );
		} else {
			// 初回アップロード処理
			uploadFirst( nextVersion );
		}

	});

};