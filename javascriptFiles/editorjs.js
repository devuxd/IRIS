
$(document).ready(function() {

  //Using ace to get the editor.	
  document.editor = ace.edit("editor");
  document.editor.setTheme("ace/theme/monokai");
  document.editor.getSession().setMode("ace/mode/html");
  document.editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
      });
  var langTools = ace.require("ace/ext/language_tools");

  //To have easiy access to them in all .js files.
  document.html; 
  document.elementTable = new Map(); 
  document.attributeFreq = [];
  document.elementFreq = [];

  //This shows the html body code on the iframe.
  //This saves the content of the html doc that is going to be created on an iframe. 
  var frame = $('#output'),
    contents = frame.contents(),
    styleTag = contents.find('head')
    .append('<style></style>')//For CSS code.
    .children('style');
    document.body_ = contents.find('body');

  //This outputs the text editor content everytime something is written.
  document.editor.on('focus', function(event, editors) {
	    $(this).keyup(function(e) {   
         if(!(e.key=="ArrowUp" || e.key=="ArrowDown"|| e.key=="ArrowLeft" 
            || e.key=="ArrowRight")){//Don't do anything when pressing any arrow.
            createTable();
            attributeTokenization();
        }
	    });
  })();

  //Custom autocomplete.
  var staticWordCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
      var attributeList = [];
      var i=0;
      for(var attString in document.attributeFreq){
         attributeList[i++]  = attString + document.attributeFreq[attString];
      }
       //This does the auto-complete.
      callback(null, attributeList.map(function(word) {
         var valueList;
          valueList= word.replace(/ Freq: [0-9]/g,"");
          return {
              caption: word,
              value: valueList,
              meta: "static"
          };
      }));
    }
  }
	langTools.setCompleters([staticWordCompleter]);
});