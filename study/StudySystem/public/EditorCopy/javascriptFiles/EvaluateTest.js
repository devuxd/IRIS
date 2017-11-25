module.exports = {
  eval: function eval(fileName){
  	var fs = require('fs');

	fileList =  fs.readFileSync(fileName).toString().split("\n");
	var precisions = new Map();
	var recall = new Map();
	var firstLine = false;
	var fileName;
	var precisionAvg = {};
	var recallAvg = {};

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
	var averageprec = 0;
	var prevTitle  = precisions.keys().next().value.split(" ")[0];
	var titleCounter = 0;
	for(var prec of precisions){
		averageprec = 0;
		var title = prec[0].split(" ")[0];
		if(prevTitle==title)
			titleCounter++;
		else{
			if(typeof(precisionAvg[prevTitle])=="undefined")
				precisionAvg[prevTitle] = 0;
			else
				precisionAvg[prevTitle] = precisionAvg[prevTitle]/titleCounter;
			titleCounter = 1;
		}
		for(var vals of prec[1]){
			if(typeof(parseFloat(vals))=="number")
		 		averageprec+=parseFloat(vals);
		}
		averageprec /= 20;

		if(!isNaN(averageprec) && typeof(precisionAvg[title])=="undefined")
			precisionAvg[title] = averageprec;
		else if(!isNaN(averageprec))
			precisionAvg[title] = precisionAvg[title]+averageprec;
		prevTitle = title;
	}

	var averagerec = 0;
	prevTitle  = recall.keys().next().value.split(" ")[0];
	titleCounter = 0;
	for(var rec of recall){
		averagerec = 0;
		var title = rec[0].split(" ")[0];
		if(prevTitle==title)
			titleCounter++;
		else{
			if(typeof(recallAvg[prevTitle])=="undefined")
				recallAvg[prevTitle] = 0;
			else
				recallAvg[prevTitle] = recallAvg[prevTitle]/titleCounter;
			titleCounter = 1;
		}
		for(var vals of rec[1]){
			if(typeof(parseFloat(vals))=="number")
		 		averagerec+=parseFloat(vals);
		}
		averagerec /= 20;

		if(!isNaN(averagerec) && typeof(recallAvg[title])=="undefined")
			recallAvg[title] = averagerec;
		else if(!isNaN(averagerec))
			recallAvg[title] = recallAvg[title]+averagerec;
		prevTitle = title;
	}

	var xandy = [];
	for(var i in recallAvg){
		xandy.push({"x":precisionAvg[i], "y":recallAvg[i]});
	}
	var chartJsOptions = {
	  "type": "line",
	  "data": xandy,
	  "options": {
	      "scales": {
	          "yAxes": [{
	              "ticks": {
	                  "beginAtZero": true
	              }
	          }]
	      }
	  }
	}
  
	const ChartjsNode = require('chartjs-node');
	// 600x600 canvas size
	var chartNode = new ChartjsNode(600, 600);
	return chartNode.drawChart(chartJsOptions)
	.then(() => {
	    // chart is created

	    // get image as png buffer
	    return chartNode.getImageBuffer('image/png');
	})
	.then(buffer => {
	    Array.isArray(buffer) // => true
	    // as a stream
	    return chartNode.getImageStream('image/png');
	})
	.then(streamResult => {
	    // using the length property you can do things like
	    // directly upload the image to s3 by using the
	    // stream and length properties
	    streamResult.stream // => Stream object
	    streamResult.length // => Integer length of stream
	    // write to a file
	    return chartNode.writeImageToFile('image/png', './testimage.png');
	})
	.then(() => {
	    // chart is now written to the file path
	    // ./testimage.png
	});
  }

}