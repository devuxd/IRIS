var express = require('express');
var fs = require('fs');
var readline = require('readline');
var app = express();
var $ = require('jquery');
global.trainingData = new Map();
global.testingData = new Map();

app.use(express.static(__dirname+'/public/EditorCopy'));

app.get('/', function (req, res) {
  res.sendFile(__dirname +'/public/EditorCopy/editor.html');
});

var rl = readline.createInterface({
      input : fs.createReadStream('mess.text'),
      output: process.stdout,
      terminal: false
});

var count=0, filename;
rl.on('line',function(line){
	saveSets(trainingData, line);
     // console.log(line); //or parse line
});


app.listen(8000, function () {
  console.log('Example app listening on port 8000!');
});

function saveSets(set, line){
	if(line!="" && count==0){
		filename = line;
		count++;
	}else if(line.includes("#########")){
		count=1;
	}else if(line!=""){
		if(typeof(set.get(filename,set.get(filename)))!='undefined')
			set.set(filename,set.get(filename)+"\n"+line);
		else 
			set.set(filename,line);
		count++;
	}
}

// exports.trainingData = global.trainingData;
// var m = require(__dirname+'/public/EditorCopy/javascriptFiles/editorjs');

