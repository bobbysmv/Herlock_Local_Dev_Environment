/**
 * Module dependencies.
 */
var express      = require('express');
var routes       = require('./routes');
var upload       = require('./routes/upload');
var user         = require('./routes/user');
var http         = require('http');
var path         = require('path');
var backend_main = require('../backend/main.js');

function start( options ){
	options = options || {};

	console.log('backend_main :' + backend_main);
	
	var app = express();
	app.locals.options = options;

	// settings
	var settings    = require('./settings.json');
	// projects
	app.use( express.static( options.workspace || path.join( __dirname, settings.default_workspace ) ) );

	// all environments
	app.set('port', options.port || 8080);
	app.set('views', path.join( __dirname, 'views'));
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}

	// routing
	app.get('/', routes.index.bind(app) );
	app.get('/upload/:env', function (req, res) {
		var env = req.params.env;
		backend_main.run(env);

		upload.index(req, res);
	});
	app.get('/users', user.list.bind(app) );

	//  bobby
	app.get('/list', require('./routes/list').index.bind(app) );
	app.get('/doc', require('./routes/doc').index.bind(app) );
	app.get('/webpreview', require('./routes/webpreview').index.bind(app) );


	// http server
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});

}

module.exports = start;
