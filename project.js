const express = require('express');
const app = express();
const axios = require('axios');
const { registerPartial } = require('handlebars');

var fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.set('port', 2022);

//dictionary.com API key
function keyFetch(){
  try {
    //get key and block execution until key is returned.
    return fs.readFileSync('keys.txt', 'utf8');
  } catch(e) {
      console.log('Error:', e.stack);
  }
}

app.get('/', function(req,res){
	res.render('home');
});

app.get('/dictionary', function(req,res){
	for (var p in req.query){
		axios.get(dictRequest(p))
    .then(response => {
      res.send(response.data[0].shortdef);
    })
    .catch(error => {
      console.log(error);
    });
	}
});

//create string request
function dictRequest(word){
  return "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" 
         + word 
         + "?key=" 
         + keyFetch();
}

app.use(function(req,res){
  res.render('404');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});



