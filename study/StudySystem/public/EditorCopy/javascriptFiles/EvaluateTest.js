/*
  THIS FUNCTION PERFORMS AN EVALUATION OF THE STUDY.
  IT COLLECTS ALL THE PRECISIONS AN RECALL AND 
  CALCULATES THE AVERAGE OF ALL OF THEM ACCORDING 
  TO THEIR HTML SOURCE FILE.
  IT THEN CREATE A GRAPH THAT ALLOWS VISUALIZATION
  OF THE RESULTED AVERAGES.
*/
module.exports = {
  eval: function eval(fileName, test_small, testingGraph){
  	var fs = require('fs');
  	var csvdata = require("csvdata");
  	var titles  = [];
  	var values = [];

	fileList =  fs.readFileSync(fileName).toString().split("\n");
	var precisions = new Map();
	var recall = new Map();
	var firstLine = false;
	var fileName;
	var precisionAvg = {};
	var recallAvg = {};

    //Adding precision and recall of each attribute tested to a map.
    //The map contains the file name and attribute as a key and all 
    //of thier precisions or recalls as a value.  
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

	//This performs the average calculation of precision.
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

	//This performs the average calculation of recall.
	var averagerec = 0;
	prevTitle  = recall.keys().next().value.split(" ")[0];
	titleCounter = 0;
	var counter = 1;
	titles+=prevTitle;
	for(var rec of recall){
		averagerec = 0;
		var title = rec[0].split(" ")[0];
		if(prevTitle==title)
			titleCounter++;
		else{
			counter++;
			titles+=","+title;
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

	//These creates the graph.

	var x1 = [];
	var x2 = [];
	var y = [];
	var ycounter = 0;
	for(var i in recallAvg){
		x1.push(precisionAvg[i]);
		x2.push(recallAvg[i]);
		if(counter==0)
			values+=Number(precisionAvg[i].toFixed(5))+" - "+Number(recallAvg[i].toFixed(5));
		else
			values+=","+Number(precisionAvg[i].toFixed(5))+" - "+Number(recallAvg[i].toFixed(5));
		ycounter+=0.01;
		y.push(ycounter);
	}
	var tocvs = [];
	tocvs.push([[titles]]);
	tocvs.push([[values]]);
	csvdata.write(test_small, tocvs);//This writes only the filename and preicision & recall.

	 var testPlugin = {
        beforeDraw: function (chartInstance) {
            var ctx = chartInstance.chart.ctx;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
            ctx.font = '10px Georgia';
            ctx.fillColor = 'black'
            return true;
        }
    };

	var chartJsOptions =
	{
		type: 'line',
	   	data: {
	   		labels: y,
      		datasets: [
      		{
		        label: "Precision",
		        data: x1,
		        borderColor : "red",
		        borderWidth : "3",
		        hoverBorderColor : "red",
	      	},
	      	{
	      		label: "Recall",
		        data: x2,
		        borderColor : "blue",
		        borderWidth : "3",
		        hoverBorderColor : "#blue",
	      	}
	      ]
	   	},
	   	options: {
		   	responsive: true,
		   	title: {
	            display: true,
	            text: 'Precision and Recall',
	            fontSize: 25
	        },
	        scales: {
		        xAxes: [{
		          ticks: {
                    fontColor: "black",
                    fontSize: 18,
                    stepSize: .05,
                    beginAtZero: true
                  }
		        }],
		        yAxes: [{
		          ticks: {
                    fontColor: "black",
                    fontSize: 18,
                    stepSize: .05,
                    beginAtZero: true
                  }
		        }]
		     }
	   },
	   plugins: [testPlugin]

	};

  
	const ChartjsNode = require('chartjs-node');
	var chartNode = new ChartjsNode(1400, 800);

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
	    return chartNode.writeImageToFile('image/png', testingGraph);
	})
	.then(() => {
	    // chart is now written to the file path
	    // ./testimage.png
	});
  }

}