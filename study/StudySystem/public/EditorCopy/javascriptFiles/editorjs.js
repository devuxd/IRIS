
$( document ).ready(function editorjs() {
  //Added for pilot test
  document.editorSelector = $("div#editor");
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

  //To have easy access to them in all .js files.
  document.html; 
  document.elementTable = new Map(); 
  document.completeElementTable = new Map();
  document.allAutoCompleteList = [];

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
            elementTokenization();

            document.editor.selection.moveCursorFileEnd();
            var Autocomplete = require("ace/autocomplete").Autocomplete;
            var util = require("ace/autocomplete/util");
            /*
              * Snippet taken from ext-language_tools.js from Ace library to create an instance
              * of the editors autocomplete and get the ranked version of the autocomplete list.
              * Ontly need this to run the study.
            */var hasCompleter = document.editor.completer && document.editor.completer.activated;
            if (e.key === "backspace") {
                if (hasCompleter && !util.getCompletionPrefix(document.editor))
                    document.editor.completer.detach();
            }
            else {
                var prefix = util.getCompletionPrefix(document.editor);
                if (prefix && !hasCompleter) {
                    if (!document.editor.completer) {
                        document.editor.completer = new Autocomplete();
                    }
                    document.editor.completer.autoInsert = false;
                    document.editor.completer.showPopup(document.editor);
                    if(document.content = document.editor.completer.completions!=null)
                      document.content = document.editor.completer.completions.filtered;//Getting the ranked list.
                }
            }
          }
	    });
  })();

  //Custom autocomplete.
  var staticWordCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
      var attributeList = [];
      var i=0;
      if(typeof( document.allAutoCompleteList)!="undefined"){
        for(var attString in document.allAutoCompleteList){
           attributeList[i++]  = attString + document.allAutoCompleteList[attString];
        }
      }
         //This does the auto-complete.
      callback(null, attributeList.map(function(word) {
         var listWord = word.replace(/ Freq: [0-9]/g,"");
         var freq = "";
         if(word.match(/Freq: [0-9]/g)!=null)
            freq = word.match(/Freq: [0-9]/g).toString();
          word = listWord.replace(/</g,"");
          var wscore = parseInt(freq.match(/[0-9]/g));

          return {
              caption: listWord,//the words it shows
              value: word,//the words it writes if clicked
              score: wscore,//score to rank them according to freq
              meta: freq//the words frequency.
             
          };
      }));
    }
  }
	langTools.setCompleters([staticWordCompleter]);
  });
