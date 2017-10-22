/*
 * Using jsdom to parse and execute the code that runs the editor.
 * Using node.js to get the html file information that will be use
 * to test the editors performance.
*/
  var fs = require('fs');
  require('jsdom-global')();
  const jsdom = require("jsdom");
  var csvdata = require("csvdata");

  var output = [];

  const { JSDOM } = jsdom;
  var htmlSource = fs.readFileSync(__dirname+"/../editor.html", "utf-8");
  const dom = JSDOM.fromFile(__dirname+"/../editor.html", { resources: "usable", runScripts: "dangerously",

  }).then(dom => {
    setTimeout(function(){ //Timeout to wait for all the script to finish loading.
      for(var fileTrain of global.trainingData){
         for(var fileTest of global.testingData){
           var linesTraining = fileTest[1].split("\n");
            delete linesTraining[0];
            for(var line of linesTraining){
              if(typeof(line)!="undefined"){
                line  = line.replace(/\d .*: /g,"");
                dom.window.document.editor.session.setValue(fileTrain[1]);
              }
            }
            dom.window.document.editorSelector.keyup();
            var lines = fileTest[1].split("\n");
            var fileName = lines[0];
            delete lines[0];
            for(var line of lines){
              if(typeof(line)!="undefined"){
                line  = line.replace(/\d .*: /g,"");
                dom.window.document.editor.session.setValue(line);
                dom.window.document.editorSelector.keyup();
                var outputtemp = "";
                for(var word in dom.window.document.allAutoCompleteList){
                    if(outputtemp=="")
                       outputtemp+= fileName+","+word +" "+ dom.window.document.allAutoCompleteList[word];
                    else 
                      outputtemp+= ","+word +" "+ dom.window.document.allAutoCompleteList[word];
                }
               
                console.log(output);
              }
           }
            output.push([outputtemp]);
        }
      }
    csvdata.write('./study.csv', output);
    console.log(output);
    }, 5000);  
  });