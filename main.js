
var options = { workspace: process.argv[2] || "./projects", port: process.argv[3] || 8080 };

// management_tool
var managementTool = require('./frontend/app.js');
managementTool( options );

// orion
var connect = require('connect');
var orion = require('orion');
var util = require('util');
var path = require('path');
var socketio = require('socket.io');
var orionOptions = { workspaceDir: path.resolve(__dirname, options.workspace), maxAge:0 };

console.log(util.format('Using workspace: %s', orionOptions.workspaceDir));
console.log(util.format('Listening on port %d...', options.port+1));

// create web server
var orionMiddleware = orion(orionOptions);
var appContext = orionMiddleware.appContext;
var server = connect()
	.use(orionMiddleware)
	.listen( options.port+1 );
