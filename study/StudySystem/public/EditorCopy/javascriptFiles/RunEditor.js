
/*
 * USING JSDOM TO PARSE AND EXECUTE THE CODE THAT RUNS THE EDITOR.
 * USING NODE.JS TO GET THE HTML FILE INFORMATION THAT WILL BE USE
 * TO TEST THE EDITORS PERFORMANCE.
*/
module.exports = {
  runEditor: function runEditor(outputFileName_csv){
    var finished = false;
    const K = 20;
    var fs = require('fs');
    require('jsdom-global')();
    const jsdom = require("jsdom");
    var csvdata = require("csvdata");
    var metric = require(__dirname+"/PrecisionRecall");
    var testAttr = require(__dirname+"/testAttributes");

    var attrOutput = [];
    var precisionMean = [];

    const { JSDOM } = jsdom;
    var htmlSource = fs.readFileSync(__dirname+"/../editor.html", "utf-8");

    try{
          const virtualConsole = new jsdom.VirtualConsole();
          virtualConsole.on("error", () => { return finished;});//GETTING ERROR AT THE END OF THE EXECUTION OF THE EDITOR.
                                                                //THE ERROR IS ON THE CODE THAT IS BEING PUT IN TO THE EDITOR.
                                                                //BUT THE CONSOLE IS NOT HANDLING THE ISSUE, SO NEED TO STOP
                                                                //THE EXECUTION MANUALLY WHEN THE EDITOR WRITES DATA TO THE 
                                                                //CSV FILE.
          const dom = JSDOM.fromFile(__dirname+"/../editor.html", {virtualConsole, resources: "usable", runScripts: "dangerously",

          //This executes the editor.
          }).then(dom => {
            // setTimeout(function(){ //Timeout to wait for all the script to finish loading.
              setTimeout(() => { 
                            var fileTest = global.testingData.entries();
                            var answer = global.answers.entries();

                            console.time("Complete Process");//Takes about 1962818.904ms or 33 min to complete 50 html pages.
                            for(var fileTrain of global.trainingData){

                              // CAN ADD DIFFERENT FUNCTIONS TO TEST THE EDITOR HERE //
                             
                              //To test only the attributes.
                              console.time("Test Attr");//To see how long this function takes.
                              attrOutput = testAttr.testAttributes(fileTrain, fileTest.next().value, 
                                                    answer.next().value, dom, attrOutput, K, metric); 
                              console.timeEnd("Test Attr");

                            }
                            console.timeEnd("Complete Process");

                            //Writing answers to an csv file.
                            console.log(attrOutput);
                            csvdata.write(outputFileName_csv, attrOutput);
                            finished = true;
              }, 5000);  
    }).catch(function(e) {
        console.log(e); 
      });
    }catch(e){
      console.log(e);
    }
    return finished;
  }
}
