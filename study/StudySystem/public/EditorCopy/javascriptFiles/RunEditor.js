/*
 * Using jsdom to parse and execute the code that runs the editor.
 * Using node.js to get the html file information that will be use
 * to test the editors performance.
*/
module.exports = {
  runEditor: function runEditor(){
    var finished = false;
    const K = 20;
    var fs = require('fs');
    require('jsdom-global')();
    const jsdom = require("jsdom");
    var csvdata = require("csvdata");
    var metric = require(__dirname+"/PrecisionRecall");

    var attrOutput = [];
    var precisionMean = [];

    const { JSDOM } = jsdom;
    var htmlSource = fs.readFileSync(__dirname+"/../editor.html", "utf-8");

    try{
          const dom = JSDOM.fromFile(__dirname+"/../editor.html", { resources: "usable", runScripts: "dangerously",

          //This executes the editor.
          }).then(dom => {
            // setTimeout(function(){ //Timeout to wait for all the script to finish loading.
              setTimeout(() => { 
                            var fileTest = global.testingData.entries();
                            var answer = global.answers.entries();

                            console.time("Complete Process");//Takes about 1962818.904ms or 33 min to complete 50 html pages.
                            for(var fileTrain of global.trainingData){
                              console.time("Test Attr");
                              attrOutput = testAttributes(fileTrain, fileTest.next().value, answer.next().value, dom, attrOutput, K, metric); //To test onlty the attributes.
                              console.timeEnd("Test Attr");

                            }
                            console.timeEnd("Complete Process");

                            //Writing answers to an csv file.
                            console.log(attrOutput);
                            csvdata.write('./AttrOutput_51_100_3.csv', attrOutput);
                            finished = true;

              }, 5000);  
    }).catch(function(e) {
        console.log(e); // "oh, no!"
      });
    }catch(e){
      console.log(e);
    }
    return finished;
  }
}

/*
 * This function performs the attribute testing by comparing
 * the AttrTestingSet with the AttrAnswers file. 
 * Inputs are and individual html train file, test file,
 * answer file, and the DOM of the editor instance. 
*/
function testAttributes(fileTrain, fileTest, answers, dom, attrOutput, K, metric){
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

    console.log(fileName);
    for(var line of linesTesting){//Through each testline to get all different autocompletes.
      if(typeof(line)!="undefined" && line!="" && line!=fileName){

        //Imputing the training and testing set to the editor.
        dom.window.document.editor.session.setValue(linesTraining+"\n"+line);
        //Simulating a keyup on the editor to get autocompletes.
        dom.window.document.editorSelector.keyup();
        //Contains the words that will be shown by the autocomplete.
        var rankedAutoComplete = dom.window.document.content;
        var outputtemp = "";

        answer.push(answerList[answerLine]);

        if(!rankedAutoComplete){
          attrOutput.push([line+", None"]);
          continue;
        }
        //This reads through the top 10 first answers of the autocompletes.
        console.time("Finding Editors Answer");
        for(var i in rankedAutoComplete){
          if(i > K) break;//only consider first 10 matches.
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
        console.timeEnd("Finding Editors Answer");
      }answerLine++;
   }
   //To calculate precision and recall at K.
   console.time("Precision Recall");
   attrOutput = metric.precisionRecall(answer, editorAnswer, K, attrOutput);
   console.timeEnd("Precision Recall");
   return attrOutput;
}