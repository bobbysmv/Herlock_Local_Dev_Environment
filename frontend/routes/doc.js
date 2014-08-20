
var fs = require('fs');
//var ncp = require('ncp').ncp;
//var gm = require("gm");
var child_process = require("child_process");
var settings    = require('../settings.json');


exports.index = function(req, res){

    var workspace = this.locals.options.workspace || settings.projects_dir;


    var proj = req.param("proj",null);
    if( proj === null )
        throw "プロジェクトを指定してください。?proj=プロジェクトname";

    if( !fs.existsSync( workspace + "/" + proj ) )
        throw "存在するプロジェクトを指定してください。?proj=プロジェクトname";

    if( !fs.existsSync( __dirname + "/../public/docs" ) )
        fs.mkdirSync( __dirname + "/../public/docs" );

    var force = req.param("force",false);
    if( !force && fs.existsSync( __dirname+"/../public/docs/"+proj ) )
        return res.redirect( "/docs/"+proj );

    var target = workspace + "/" + proj;
    var out = __dirname + "/../public/docs/" + proj;


    new Chain( function(next){

        if( force && fs.existsSync(out) ) {
            child_process.exec("rm -rf "+out, function( err, stdout ){
                if(err) throw err;
                next();
            });
        } else {
            next();
        }
    }).next( function(){

        gen( target, out, function( result, err ){
            if(!result) {
                console.log("Error ", err);
//                throw "失敗しました。" + err;
                return res.send( "<h1>Document生成に失敗しました。</h1><a href=\"\">retry</a><pre>"+ (""+err).replace("\n","<br>") + "</pre>" );
            }
            return res.redirect( "/docs/"+proj );
        });

    } ).exec();
};

function gen(target, out, callback) {

    function gendoc( target, out ) {

        //
        var title = (function(){ return this[ this.length-1 ]; }).call(target.split("/"));
        var command = "jsduck " + target + " -o " + out + " --exclude "+target+"/test --title=" + title;
        console.log( command );
        child_process.exec( command, { maxBuffer: 1024 * 1024 }, function( err ){
            if(err !== null) {
                return callback( false, err );
            }

            console.log( "success" );
            callback( true );
        });

    }




    if( !target ) return console.log( "doc化したいファイル,ディレクトリを指定してください。" );
    if( !out ) return console.log( "出力先ディレクトリを指定してください。" );


    if( !fs.existsSync(out) ) {
        fs.mkdirSync(out);
    }


    var errorMessage = "";

    new util.Chain( function( next ){
        child_process.exec("which ruby", function( err, stdout ){
            if(stdout === "") errorMessage += "rubyが必要です\n" ;
            next();
        });
    } ).next( function( next ){
        child_process.exec("which gem", function( err, stdout ){
            if(stdout === "") errorMessage += "gemが必要です\n" ;
            next();
        });
    } ).next( function( next ){
        child_process.exec("which jsduck", function( err, stdout ){
            if(stdout === "") errorMessage += "jsduckが必要です\n" ;
            next();
        });
    } ).next( function( next ){
        if(!errorMessage==="") return console.log(errorMessage);
        gendoc( target, out );
    } ).exec();


}

var util = {};

var Chain = function( func ){
    this._func = func;
    this._next = function(){};
};
Chain.prototype = {
    exec:function(){
        this._func( (function(){ this._next(); }).bind(this) );
    },
    next: function( func ){
        var chain = new Chain( func );
        this._next = function(){ chain.exec(); };
        return this;
    }
};
util.Chain = Chain;
