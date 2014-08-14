
var qrcode       = require('qrcode-npm');
var fs          = require('fs');
var settings    = require('../settings.json');
var express      = require('express');

exports.index = function(req, res){

    var workspace = this.locals.options.workspace || settings.projects_dir;

    var files = fs.readdirSync( workspace );

    var projects = {};
    for( var i in files ) {
        var fileName = files[i];
        var stat = fs.statSync( workspace + "/" + fileName );
        if( !stat.isDirectory() ) continue;
        if( settings.ignore_directories.indexOf(fileName) !== -1 ) continue;
        projects[ fileName ] = {
            urlscheme:"dev://load?url=" + req.protocol + "://" + req.host + ":" + 8080/*magic*/ + "/" + fileName+"/main.js",
            doc:"/doc?proj="+fileName,
            force:"/doc?proj="+fileName+"&force=true",
            preview:"/webpreview?proj="+fileName,
            url: req.protocol + "://" + req.host + ":" + 8080/*magic*/ + "/" + fileName+"/main.js"
        };
    }

    // QR
    var qr = qrcode.qrcode(4, 'M');
    qr.addData( req.protocol + "://" + req.host + ":" + 8080/*magic*/ + req.path );
    qr.make();

    res.render('list', {
        title: 'Projects',
        list: projects,
        qr: qr.createImgTag(6)
    });

};