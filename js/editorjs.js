// TODO: This is a really big function. Could possibly be refactored.

/**
 * Uses the Ace library {@link https://ace.c9.io/} to create a code editor and
 * calls functions to initialize the auto-complete features. Runs when the page
 * has loaded to initialize everything.
 */
$(document).ready(function() {
	// Using Ace to initialize an editor
	page.codeEditor = ace.edit("editor");
	page.codeEditor.setTheme("ace/theme/monokai");
	page.codeEditor.getSession().setMode("ace/mode/html");
	page.codeEditor.setOptions(
		{
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true
		});
	var langTools = ace.require("ace/ext/language_tools");

	// To have easy access to them in all .js files.
	// TODO: Clean this up
	document.elementTable = new Map();
	document.completeElementTable = new Map();
	document.allAutoCompleteList = [];

	// This shows the html body code in an iframe.
	// This saves the content of the html doc that is going to be created in an
	// iframe.
	var frame = $('#output'),
		contents = frame.contents();
	page.codePreviewFrame = $('#output');
	page.codePreviewContent
	page.codePreviewBody = page.codePreviewFrame.contents().find('body');

	// This updates the text editor content every time something is changed
	page.codeEditor.on('focus', function (event, editors) {
		$(this).keyup(function (e) {
			if (!(e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "ArrowLeft"
				|| e.key == "ArrowRight")) { // Don't do anything when pressing any arrow.

				// HERE WE CAN ADD DIFFERENT FUNCTIONS TO POPULATE THE AUTOPLETE LIST. //

				// associationRule(); // Working on this one.
				createTable();
				attributeTokenization();
				elementTokenization();
			}
		});
	})();

	// Custom autocomplete.
	var staticWordCompleter = {
		getCompletions: function (editor, session, pos, prefix, callback) {
			var attributeList = [];
			var i = 0;
			if (typeof (document.allAutoCompleteList) != "undefined") {
				for (var attString in document.allAutoCompleteList) {
					attributeList[i++] = attString + document.allAutoCompleteList[attString];
				}
			}
			// This does the auto-complete.
			callback(null, attributeList.map(function (word) {
				var listWord = word.replace(/ Freq: [0-9]/g, "");
				var freq = "";
				if (word.match(/Freq: [0-9]/g) != null)
					freq = word.match(/Freq: [0-9]/g).toString();
				word = listWord.replace(/</g, "");
				var wscore = parseInt(freq.match(/[0-9]/g));
				return {
					caption: listWord, // the words it shows
					value: word, // the words it writes if clicked
					score: wscore, // score to rank them according to freq
					meta: freq // the words frequency.
				};
			}));
		}
	}
	langTools.setCompleters([staticWordCompleter]);
});