
var settings    = require('../settings.json');


exports.index = function(req, res){

    res.render( 'webpreview', { title: 'Preview' } );

};
