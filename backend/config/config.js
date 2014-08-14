(function () {
	var config = {
		app_name    : '',
		bucket_name : '',
		stg : {
			zip_key  : 'stg-zip',
			json_key : 'stg-json'
		},
		prod : {
			zip_key  : 'prod-zip',
			json_key : 'prod-json'
		},
		env          : 'stg', // デフォルトstg
		repository   : '',
		unzip_prefix : 'root', // file://assets/[unzip_prefix]
		zip_name     : 'zip.zip', //
	};

	module.exports = config;
})();
