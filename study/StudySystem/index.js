var express = require('express');
var fs = require('fs');
var readline = require('readline');
var app = express();
var editor = require(__dirname+'/public/EditorCopy/javascriptFiles/RunEditor');

global.trainingData = new Map();//Contains the training data.
global.testingData = new Map();//Contains the testing data.

app.use(express.static(__dirname+'/public/EditorCopy'));
app.get('/', function (req, res) {
  res.sendFile(__dirname +'/public/EditorCopy/studyIndex.html');
});

var rl = readline.createInterface({
      input : fs.createReadStream('TrainingSet.text'),
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
		count=0;
	}else if(line!=""){
		if(typeof(set.get(filename,set.get(filename)))!='undefined')
			set.set(filename,set.get(filename)+"\n"+line);
		else 
			set.set(filename,line);
		count++;
	}
}


