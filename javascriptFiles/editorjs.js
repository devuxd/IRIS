
$(document).ready(function() {

  //Using ace to get the editor.	
  document.editor = ace.edit("editor");
  document.editor.setTheme("ace/theme/monokai");
  document.editor.getSession().setMode("ace/mode/html");
  document.editor.setOptions({enableBasicAutocompletion: true});
  document.langTools = ace.require("ace/ext/language_tools");
  document.html; 
  document.currline;
  document.groupPaths = [];  
  document.lastline;
  document.lastelement;
  document.frequencyarray = [];
  document.newArray= [];
  document.isGroupTag = false;


  //This shows the html body code on the iframe.
  //This saves the content of the html doc that is going to be created on an iframe. 
  var frame = $('#output'),
    contents = frame.contents(),
    styleTag = contents.find('head')
    .append('<style></style>')//For CSS code.
    .children('style');
    document.body_ = contents.find('body');

  //This outputs the text editor content everytime something is written.
  var timer;
  document.editor.on('focus', function(event, editors) {
	    $(this).keyup(function() {   
		    	 attributeTokenization();	
           groupTokenization(); 
	    });
  })();

	//Custom autocomplete.
	var staticWordCompleter = {//Custom autocoplete.
    getCompletions: function(editor, session, pos, prefix, callback) {
    	document.frequencyarray.sort('value');
    	var sortedarray = Object.keys(document.frequencyarray);
        callback(null, sortedarray.map(function(word) {
        	var removedSpaces = word.replace(/\n /g, "");
            return {
                caption: removedSpaces,
                value: word,
                meta: "static"
            };
        }));

	    }
	}
	document.langTools.setCompleters([staticWordCompleter]);
});