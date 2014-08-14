
/*
 * GET home page.
 */

exports.index = function(req, res){
  
  var orionPath = req.protocol + "://" + req.host + ":8081/edit/edit.html"; 

  res.render('index', {
  	title: 'Herlock Local開発環境',
  	orion: orionPath
  });
};