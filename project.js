const express = require('express');
const app = express();
const axios = require('axios');
const { registerPartial } = require('handlebars');

var fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.set('port', 2022);


//wikipedia web page scraper
const cheerio = require("cheerio");
var async = require('asyncawait/async');
var await = require('asyncawait/await');


//gets dictionary API key
function keyFetch(){
  try {
    //get key and block execution until key is returned.
    return fs.readFileSync('keys.txt', 'utf8');
  } catch(e) {
      console.log('Error:', e.stack);
  }
}

//create string request
function dictRequest(word){
  return "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" 
         + word 
         + "?key=" 
         + keyFetch();
}

function cryptoRequest(buyer){
  return "buyer=" 
         + buyer
         + "&jaq=0xc6EfbA1f45dD02294e4503F3dEFC6008cd7326dc";
}

//replaces all spaces in the string of the title with an underscore to create URL
function makeUnderscore(title){
  var splitString = title.split(' ')

  let index = 0
  var newString=''
  while(splitString[index] != null)
  {
    newString += splitString[index]
    //prevents putting underscore at end of string 
    if(splitString[index+1] != null)
      newString += '_'
    index++
  }
  return newString;
}

let axiosConfig = {
  headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "Access-Control-Allow-Origin": "*",
  }
};

//dictionary API call 
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

//gets summaries from wikipedia pages
app.get('/wikime', function(req,res){
	for (var title in req.query){
		var url = "https://en.wikipedia.org/wiki/" + makeUnderscore(title);
    axios.get(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      res.send ($('div.mw-parser-output > p').text());
    })
    .catch(error => {
      console.log(error);
    });
	}
});

//uses cryptocurrency to pay for tutoring
app.get('/crypto', function(req,res){
  for(var buyerSelect in req.query){
    axios.post(
      'http://ec2-52-78-121-194.ap-northeast-2.compute.amazonaws.com:31338/dApp/jaq',
      cryptoRequest(buyerSelect),
      axiosConfig
    ).then((response) => {
      res.send( response.data )
      })
      .catch((error) => {
        console.log(error);
      })
  }
});

//creating homepage
app.get('/', function(req,res){
	res.render('home');
});

//error page 
app.use(function(req,res){
  res.render('404');
});

//start server
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});