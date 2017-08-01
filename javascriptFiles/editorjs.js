
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
  document.currline;
  document.groupPaths = [];  
  document.lastline;
  document.lastelement;
  document.frequencyarray = [];

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

      var array = [];
      var totalFreq = 1;

      //This will allow the list created to be sorted 
      //according to thier frequency.
      var keys = Object.keys(document.frequencyarray);
      for(var entry=0; entry<keys.length; entry++){
          array[entry] =  {"key":keys[entry],"value": document.frequencyarray[keys[entry]].freq};
          totalFreq += array[entry].value;
       }

      //Sorts array.
      array.sort(function(a,b){
            return a.value < b.value;
      });

      //This is to get the string of the element that will be 
      //presented on the auto-complete.
      console.log(totalFreq);
      for(var entry=0; entry<array.length; entry++){
           keys[entry] = Object.values(array[entry])[0]+" - freq:"+Number(((array[entry].value/totalFreq)*100).toFixed(2))+"%";
      }
       
    	//This does the auto-complete.
        callback(null, keys.map(function(word) {
        	var removedSpaces = word.replace(/\n /g, "");
          removedSpaces = removedSpaces.replace("> <", "><");
          removedSpaces = removedSpaces.replace(/ *</g, "<");
          word = word.replace(/ - freq:\d*.*/g,"");
            return {
                caption: removedSpaces,
                value: word,
                meta: "static"
            };
        }));
	    }
	}
	langTools.setCompleters([staticWordCompleter]);
});