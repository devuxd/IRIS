/*
 *	Using node.js to load the testing and training data to the server
 *	in order to be able to perform a test of the editor's performance.
 */ var express = require('express');
	var fs = require('fs');
	var readline = require('readline');
	var app = express();
	var count=0, filename;
	var run = require(__dirname+'/public/EditorCopy/javascriptFiles/RunEditor');
	var evaluate = require(__dirname+'/public/EditorCopy/javascriptFiles/EvaluateTest');


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


/*	Adding the information to a map with key = name of html file
 *	and value = all the html code. The timeout is to make them
 *	run asynchronous.
 */ var finished = false, finishedTest = false;
 	readFile('TestInputFiles/TrainingSet.text', global.trainingData);
    readFile('TestInputFiles/AttrTestingSet.text', global.testingData);
    finished = readFile('TestInputFiles/AttrAnswers.text', global.answers);
 //    if(finished)
	// 	finishedTest = run.runEditor();
	// if(finishedTest)//Need to run it separetly
		evaluate.eval(__dirname +"/AttrOutput_51_100_3.csv");


	//Reads the file.
	function readFile(filename, data){
		var counter = 0;
		fileList =  fs.readFileSync(filename).toString().split("\n");
		for(var line of fileList){
			if(line.includes("#########")){
				counter++;
			} if(counter>=0 && counter<=50){//To only test a range of doc.
				saveSets(data, line);
			} 
			else{//Need this to read starting at 0;
				global.lineNum = 0;
				break;
			}
		}
		return true;
	}


	//Takes each line and adds it to the global map.
	function saveSets(set, line){
		if(line!="" && global.lineNum==0){
			filename = line;
			global.lineNum = -1
		}else if(line.includes("#########")){
			global.lineNum = 0;
		}else if(line!=""){
			if(typeof(set.get(filename))=='undefined'){
				line  = line.replace(/\d+ .*: /g,"");
				set.set(filename, line);
			} else{ 
				line  = line.replace(/\d+ .*: /g,"");
				set.set(filename, set.get(filename)+ "\n"+line);
			}
			count++;
		} else{
			var val  = set.get(filename);
			if(typeof(set.get(filename))=="undefined")
				val = "";

			set.set(filename, val + "\n"+line);
		}
	}