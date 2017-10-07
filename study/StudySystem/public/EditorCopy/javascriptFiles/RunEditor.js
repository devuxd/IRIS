 // var document = require('../../../index.js');
    var fs = require('fs');
    require('jsdom-global')();
    const jsdom = require("jsdom");
    console.log(global.trainingData);

    const { JSDOM } = jsdom;
    var htmlSource = fs.readFileSync(__dirname+"/../editor.html", "utf-8");

    const dom = JSDOM.fromFile(__dirname+"/../editor.html", { resources: "usable", runScripts: "dangerously",

  }).then(dom => {
      setTimeout(function(){ //To wait for all the script to finish loading.
          // console.log(dom.window.document.editorSelector);
          // console.log(dom.window.document.editor);
          for(var file of global.trainingData){
            dom.window.document.editor.session.setValue(file[1]);
            dom.window.document.editorSelector.keyup();
            console.log(dom.window.document.allAutoCompleteList);
          }
        }, 5000);
          
     });


  
