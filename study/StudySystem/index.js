/*
 *	Using node.js to load the testing and training data to the server
 *	in order to be able to perform a test of the editor's performance.
 */ var express = require('express');
	var fs = require('fs');
	var readline = require('readline');
	var app = express();
	var count=0, filename;

	global.counter = 0;
	global.lineNum = 0;

	global.trainingData = new Map();//Contains the training data.
	global.testingData = new Map();//Contains the testing data.
	global.answers = new Map();//Contains the testing data.

	app.use(express.static(__dirname+'/public/EditorCopy'));
	app.get('/', function (req, res) {
	  res.sendFile(__dirname +'/public/EditorCopy/studyIndex.html');
	});
	app.listen(8000, function () {
	  console.log('Example app listening on port 8000!');
	});


    var finished = false;
/*	Adding the information to a map with key = name of html file
 *	and value = all the html code. The timeout is to make them
 *	run asynchronous.
 */ readFile('TestInputFiles/smallTraining.text', global.trainingData);
    readFile('TestInputFiles/smallTesting.text', global.testingData);
    finished = readFile('TestInputFiles/smallAnswer.text', global.answers);
    if(finished)
		var editor = require(__dirname+'/public/EditorCopy/javascriptFiles/RunEditor');
	
	//Takes each line and adds it to the global map.
	function saveSets(set, line){
		if(line!="" && global.lineNum==0){
			filename = line;
			global.lineNum = -1
		}else if(line.includes("#########")){
			global.lineNum = 0;
			global.counter ++;
		}else if(line!=""){
			if(typeof(set.get(filename))=='undefined'){
				line  = line.replace(/\d+ .*: /g,"");
				set.set(filename, line);
			} else{ 
				line  = line.replace(/\d+ .*: /g,"");
				set.set(filename, set.get(filename)+ "\n"+line);
			}
			count++;
		}
		if(global.counter>10){
			global.counter = 0;
			return true;
		}
	}

	//Reads the file.
	function readFile(filename, data){
		var stop = false;
		fileList =  fs.readFileSync(filename).toString().split("\n");
		if(stop){
			stop = false;
			return;
		} else{
			for(var line of fileList){
				console.log(line);
				saveSets(data, line);
			}
		}
		return true;
	}