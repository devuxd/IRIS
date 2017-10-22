/*
 *	Using node.js to load the testing and training data to the server
 *	in order to be able to perform a test of the editor's performance.
 */
	var express = require('express');
	var fs = require('fs');
	var readline = require('readline');
	var app = express();
	var editor = require(__dirname+'/public/EditorCopy/javascriptFiles/RunEditor');
	var count=0, filename;

	global.trainingData = new Map();//Contains the training data.
	global.testingData = new Map();//Contains the testing data.

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
 */
	readFile('TestInputFiles/SmallTraining.text', global.trainingData);
	setTimeout(function() {
		readFile('TestInputFiles/SmallTesting.text', global.testingData);
	}, 1000);

	//Takes each line and adds it to the global map.
	function saveSets(set, line){
		if(line!="" && count==0){
			filename = line;
			count++;
		}else if(line.includes("#########")){
			count=0;
		}else if(line!=""){
			if(typeof(set.get(filename,set.get(filename)))!='undefined')
				set.set(filename,set.get(filename)+"\n"+line);
			else{ 
				line  = line.replace(/ .*: /g,"");
				set.set(filename,line);
			}
			count++;
		}
	}

	//Reads the file.
	function readFile(filename, data){
		var rl = readline.createInterface({
	      input : fs.createReadStream(filename),
	      output: process.stdout,
		      terminal: false
		});
		rl.on('line',function(line){
			saveSets(data, line);
		});
		
	}