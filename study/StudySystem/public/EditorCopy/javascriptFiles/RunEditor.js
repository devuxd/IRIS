/*
 * Using jsdom to parse and execute the code that runs the editor.
 * Using node.js to get the html file information that will be use
 * to test the editors performance.
*/
  const K = 20;
  var fs = require('fs');
  require('jsdom-global')();
  const jsdom = require("jsdom");
  var csvdata = require("csvdata");

  var attrOutput = [];
  var precisionMean = [];

  const { JSDOM } = jsdom;
  var htmlSource = fs.readFileSync(__dirname+"/../editor.html", "utf-8");
  const dom = JSDOM.fromFile(__dirname+"/../editor.html", { resources: "usable", runScripts: "dangerously",

  }).then(dom => {
    setTimeout(function(){ //Timeout to wait for all the script to finish loading.
      for(var fileTrain of global.trainingData){
        var fileTest = global.testingData.entries();
        var answer = global.answers.entries();
        testAttributes(fileTrain, fileTest.next().value, answer.next().value, dom); //To test the attributes.
      }

    //Writing answers to an csv file.
    csvdata.write('./AttrOutput.csv', attrOutput);
    console.log(attrOutput);
    }, 5000);  
  });


function testAttributes(fileTrain, fileTest, answers, dom){
  //Getting all training and testing data.
    var linesTraining = fileTrain[1];
    var linesTesting = fileTest[1].split("\n");
    var answerList = answers[1].split("\n");
    var fileName = fileTrain[0];//Getting filename
    var answerLine = 0;
    var answer = [];
    var editorAnswer = [];

    attrOutput.push([" "]);
    attrOutput.push([fileName]);
    for(var line of linesTesting){//Through each testline to get all different autocompletes.
      if(typeof(line)!="undefined"){

        //Imputing the training and testing set to the editor.
        dom.window.document.editor.session.setValue(linesTraining+"\n"+line);
        //Simulating a keyup on the editor to get autocompletes.
        dom.window.document.editorSelector.keyup();
        var rankedAutoComplete = dom.window.document.content;
        var outputtemp = "";

        answer.push(answerList[answerLine++]);

        if(!rankedAutoComplete){
          attrOutput.push([line+", None"]);
          continue;
        }
        for(var i in rankedAutoComplete){
          if(i > K) break;//only consider first 10 mathces.
            if(outputtemp==""){
               outputtemp+= line +": ,"+ rankedAutoComplete[i].value +" "
                                          + rankedAutoComplete[i].meta;
             } else {
                outputtemp+= ","+ rankedAutoComplete[i].value +" "
                                + rankedAutoComplete[i].meta;
            }
            editorAnswer.push(rankedAutoComplete[i].value);
        } 
        attrOutput.push([outputtemp]); 
      }
   }
   precisionRecall(answer, editorAnswer);
}

function precisionRecall(realValue, editorAnswer){
  var tempRecall = "", tempPrecision = "";
  var relevant = 0;

  var answer; 
  for(var values of realValue){
    for(var i=0; i<K; i++){
        answer = editorAnswer[i].replace(/.*= "/g, "");
        answer = answer.replace(/"/g,"");

        if(values.includes(answer)){
          relevant++;
        }
        if(tempRecall == "")
          tempRecall += relevant/K;
        else
          tempRecall += "," + (relevant/K);

        if(tempPrecision == "")
          tempPrecision +=  relevant/(i+1);
        else
          tempPrecision += "," + (relevant/(i+1));
    }
    attrOutput.push(["Precision:, "+values+","+tempPrecision]);
    attrOutput.push(["Recall:, "+values+","+tempRecall]);

    tempPrecision = [];
    tempRecall = [];
    relevant = 0;
  }
}
