/*
 * Using jsdom to parse and execute the code that runs the editor.
 * Using node.js to get the html file information that will be use
 * to test the editors performance.
*/
  var fs = require('fs');
  require('jsdom-global')();
  const jsdom = require("jsdom");
  var csvdata = require("csvdata");

  var attrOutput = [];
  var labels = "fileName";

  const { JSDOM } = jsdom;
  var htmlSource = fs.readFileSync(__dirname+"/../editor.html", "utf-8");
  const dom = JSDOM.fromFile(__dirname+"/../editor.html", { resources: "usable", runScripts: "dangerously",

  }).then(dom => {
    setTimeout(function(){ //Timeout to wait for all the script to finish loading.
      answers = global.answers.values();
      for(var fileTrain of global.trainingData){
        for(var fileTest of global.testingData){
          for(var answer of global.answers){
            testAttributes(fileTrain, fileTest, answer, dom); //To test the attributes.
          }
        }
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
    var fileName = linesTesting[0];//Getting filename
    var answerList = answers.split("\n");
    var answerLine = 0;
    var correct = 0.
    delete linesTesting[0];
    for(var line of linesTesting){//Through each testline to get all different autocompletes.
      if(typeof(line)!="undefined"){
        // line  = line.replace(/\d+ .*: /g,"");
        //Imputing the training and testing set to the editor.
        dom.window.document.editor.session.setValue(linesTraining+"\n"+line);
        //Simulating a keyup on the editor to get autocompletes.
        dom.window.document.editorSelector.keyup();
          var rankedAutoComplete = dom.window.document.content;
          var outputtemp = "";

        if(typeof(rankedAutoComplete[0])!="undefined" && rankedAutoComplete[0].caption.includes(answerList[answerLine++]))
          correct++;
        
        for(var i in rankedAutoComplete){
            if(outputtemp==""){
               outputtemp+= fileName +": "+ line +","+ rankedAutoComplete[i].value +" "
                                                     + rankedAutoComplete[i].meta;
             } else {
              outputtemp+= ","+rankedAutoComplete[i].value +" "
                              + rankedAutoComplete[i].meta;
            }
        } 
        attrOutput.push([outputtemp]); 
      }
   }
   attrOutput.push(["Accuracy: " + correct/linesTesting.length]);
}