var storage = {
	fragment: {}, // Incomplete code currently being written
    predictionCase: {}, // Tokenizer-determined prediction scenario
    trainingTable: [],	// AST Features for making DT
	sampleFeatures: {},	// Features to input into DT to get prediction
    predictionList: [],	// Predictions from DT (currently just one)
};


/**
 * Uses the Ace library {@link https://ace.c9.io/} to create a code editor and
 * calls functions to initialize the auto-complete features. Runs when the page
 * has loaded to initialize everything.
 */
$(document).ready(function() {

	let aceEditor = setupEditor();

	function setupEditor() {
		let aceEditor = ace.edit("editor");
		aceEditor.setTheme("ace/theme/monokai");
		aceEditor.getSession().setMode("ace/mode/html");
		aceEditor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true
		});
        aceEditor.on('focus', function (event, editors) {
            $(this).keyup(function (e) {
                handleKey(e);
            });
        })();
        return aceEditor;
	}

	function updateOutputFrame() {
        $('#outputFrame').contents().find('body').html(aceEditor.getValue());
	}

	function handleKey(e) {

		if (e.key.includes('Arrow') || e.key === 'Shift') return;
		console.log("KEY: " + e.key);

		console.log("Tokenizing");
		let codeFile = new CodeFile(aceEditor.getValue(), aceEditor.getCursorPosition());
        codeFile.tokenize();
        console.log("PREDICTION CASE: " + storage.predictionCase);
		
        storage.fragment = {};
        storage.trainingTable = [];
        storage.sampleFeatures = {};
		storage.predictionList = [];

		if (storage.predictionCase !== PREDICTION_CASE.NONE) {

			console.log("Building AST");
			let syntaxTree = getAST(codeFile);

            console.log("Converting to Training Table");
			extractFeatures(syntaxTree);

			if (storage.trainingTable.length > 0 && !_.isEmpty(storage.sampleFeatures)) {

                console.log("Building DT");
                let decisionTree = getDT();

                console.log("Making Prediction");
                let prediction = predicts(decisionTree, storage.sampleFeatures);
                storage.predictionList.push(prediction);
                console.log("PREDICTION: " + prediction);

            }
		}

        console.log('---------------------------');
        updateOutputFrame();
	}

    let staticWordCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            callback(null, storage.predictionList.map(function (word) {
                return {
                    caption: word, // completion displayed
                    value: word, // completion performed
                    score: 0, // ordering
                    meta: storage.predictionCase // description displayed
                };
            }));
        }
    };

    let langTools = ace.require("ace/ext/language_tools");
    langTools.setCompleters([staticWordCompleter]);

});