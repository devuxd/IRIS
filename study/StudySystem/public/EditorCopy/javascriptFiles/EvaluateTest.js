module.exports = {
  eval: function eval(fileName){
  	var fs = require('fs');
    var d3 = require("d3");
    // const d3nLine = require('d3node-linechart');
    var $ = require('jquery');

	fileList =  fs.readFileSync(fileName).toString().split("\n");
	var precisions = new Map();
	var recall = new Map();
	var firstLine = false;
	var fileName;
	var precisionAvg = [];

	for(var line of fileList){
		var strLine = line.substring(line.indexOf(',')+1);
		strLine = strLine.substring(strLine.indexOf(',')+1);
		var input = line.split(",")[1];
		if(line==" "){
			firstLine = true;
			continue;
		} if(firstLine){
			fileName = line;
			firstLine = false;
			countRecall = 0, 
			countPrecision = 0;
			continue;
		}
		if(line.includes("Precision"))
			precisions.set(fileName + " " + input, strLine.split(",")); 
		else if(line.includes("Recall"))
			recall.set(fileName + " " + input, strLine.split(",")); 
		
	}
	var average = 0;
	for(var prec of precisions){
		average = 0;
		for(var vals of prec[1]){
			if(typeof(parseFloat(vals))=="number")
		 		average+=parseFloat(vals);
		}
		average /= 20;
		precisionAvg.push(average);
	}
	var y_ = [0.5,0.10,0.15,0.20,0.25,0.30,0.35,0.40,0.45,0.50,0.55,0.60,0.65,0.70,0.75,0.80,0.85,0.90,0.95,1];

  }
}