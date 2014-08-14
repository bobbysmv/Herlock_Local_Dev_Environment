(function () {

	var fs  = require('fs');

	var S3 = function (AWS) {
		this._s3 = new AWS.S3();
	};

	S3.prototype.createBucket = function (bucket, callback) {
		var params = {
			Bucket: bucket,
			CreateBucketConfiguration: {
				LocationConstraint: 'ap-northeast-1',
			},
			ACL: 'bucket-owner-full-control'
		};

		this._s3.createBucket(params, function (err, data) {
			console.log('createBucket -------------------------------------------');

			if (err) {
				console.log(err);
				callback(null);
			} else {
				console.log(data);
				callback(data);
			}
		});
	};


	S3.prototype.getObject = function (bucket, key, callback) {
		var params = {
			Bucket: bucket,
			Key: key
		};

		this._s3.getObject(params, function (err, data) {
			console.log('getObject -------------------------------------------');

			if (err) {
				console.log(err);
				callback(null);
			} else {
				console.log(data);
				callback(data);
			}
		});
	};

	S3.prototype.listObjects = function (bucket, callback) {
		var params = {
			Bucket: bucket
		};

		this._s3.listObjects(params, function (err, data) {
			console.log('listObjects -------------------------------------------');

			if (err) {
				console.log(err);
				callback(null);
			} else {
				console.log(data);
				callback(data);
			}
		});
	};

	// S3.prototype.putObject = function (bucket, key, filePath, callback) {

	// 	var self;
	// 	function _putObject(bucket, key, body) {
	// 		var params = {
	// 			Bucket: bucket,
	// 			Key: key,
	// 			ACL: 'public-read',
	// 			ContentType: 'application/json',
	// 			Body: body // buffer
	// 		};

	// 		self._s3.putObject(params, function (err, data) {
	// 			console.log('putObject 2 -------------------------------------------');

	// 			if (err) {
	// 				console.log(err);
	// 				callback(null);
	// 			} else {
	// 				console.log(data);
	// 				callback(data);
	// 			}
	// 		});
	// 	}


	// 	fs.readFile(filePath, {}, function (err, data) {
	// 		console.log('putObject 1 -------------------------------------------');
	// 		if (err) {
	// 			callback(null);
	// 			return;
	// 		}
	// 		_putObject(bucket, key, data);
	// 	});
	// };

	S3.prototype.putObject = function (bucket, key, buffer, contentType, callback) {
		var params = {
			Bucket: bucket,
			Key: key,
			ACL: 'public-read',
			ContentType: contentType,
			Body: buffer // buffer
		};

		this._s3.putObject(params, function (err, data) {
			console.log('putObject -------------------------------------------');
			if (err) {
				console.log(err);
				callback(null);
			} else {
				console.log(data);
				callback(data);
			}
		});
	};



	// ---------------------------------------------------------------------
	var instance = null;

	module.exports = {
		getInstance: function (AWS) {
			if (!instance) {
				instance = new S3(AWS);
			}

			return instance;
		}
	};
})();