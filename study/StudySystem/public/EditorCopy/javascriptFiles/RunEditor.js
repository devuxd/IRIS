 // var document = require('../../../index.js');
  var fs = require('fs');
  const jsdom = require("jsdom");
  console.log(global.trainingData);

  const { JSDOM } = jsdom;
  var htmlSource = fs.readFileSync(__dirname+"/../editor.html", "utf-8");

  const dom = JSDOM.fromFile(__dirname+"/../editor.html", { resources: "usable", runScripts: "dangerously" }).then(dom => {
 
    dom.window.document.querySelector("div#editor").session.setValue(global.trainingData);
    dom.window.document.querySelector("div#editor").session.$updateInternalDataOnChange;
    
    console.log(dom.serialize());
  });


  
