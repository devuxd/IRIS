/*
 *	USING NODE.JS TO LOAD THE TESTING AND TRAINING DATA TO THE SERVER
 *	IN ORDER TO BE ABLE TO PERFORM A TEST OF THE EDITOR'S PERFORMANCE.
 */
 var express = require('express');
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


/*	
 *  ADDING THE INFORMATION TO A MAP WITH KEY = NAME OF HTML FILE
 *	AND VALUE = ALL THE HTML CODE. THE TIMEOUT IS TO MAKE THEM
 *	RUN ASYNCHRONOUS.
 // */
   var finished = false, finishedTest = false;
   var start = 0, end = 0;//Make it easier to test different ranges
 	readFile('TestInputFiles/TrainingSet.text', global.trainingData, start, end);
    readFile('TestInputFiles/AttrTestingSet.text', global.testingData, start, end);
    finished = readFile('TestInputFiles/AttrAnswers.text', global.answers, start, end);
    if(finished)
    	//The parameter is the name of the csv output file.
		finishedTest = run.runEditor("test.csv");
	if(finishedTest)//MIGHT NEED TO RUN THIS SEPARATLY BECAUSE IF THE HANDLING ERROR ISSUE ON RunEditor.
		//The parameter are:
		//	 the name of the file that we want to test,
		//	 the name of the file that will only contain the precision and recall.
		//   the name of the output graph.
		evaluate.eval("test.csv", "test_small.csv", "testingGraph.png");


	//Reads the file.
	function readFile(filename, data, start, end){
		var counter = 0;
		fileList =  fs.readFileSync(filename).toString().split("\n");
		for(var line of fileList){
			if(line.includes("#########")){
				counter++;
			} if(counter>=start && counter<=end){//To only test a range of doc.
				saveSets(data, line);
			} 
			else if(end!=100){
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