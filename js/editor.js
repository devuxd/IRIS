var storage = {
	fragment: {}, // Incomplete code currently being written
    predictionCase: {}, // Tokenizer-determined prediction scenario
    trainingTable: [],	// AST Features for making DT
	sampleFeatures: {},	// Features to input into DT to get prediction
    predictionList: [],	// Predictions from DT (currently just one)
	
	dontUse: [], // List of entries/rules the user doesn't want to use
	blackList: [],
	alwaysTag: [], // Rules for predicting tags 
 	alwaysAttr: [], // Rules for predicting attributes 
	alwaysValue: [], // Rules for predicting values
	justTable: false
};

/**
*create ace Editor
*/
function setupEditor() {
	let aceEditor = ace.edit("editor");
	aceEditor.setTheme("ace/theme/monokai");
	aceEditor.getSession().setMode("ace/mode/html");
	aceEditor.setOptions({
		enableBasicAutocompletion: true,
		enableSnippets: true,
		enableLiveAutocompletion: true
	});
	return aceEditor;
}

/*
This checks whether ID3 returned multiple predictions
(sorted by probability), and if so, pushes each one.
*/
function multiplePred(prediction){
	if (prediction.includes(" // ")) {
		let predictions = prediction.split(" // ");
		for (let pred of predictions) {
			if (!storage.predictionList.includes(pred)) {
				storage.predictionList.push(pred);
				console.log("PREDICTION: " + pred);
			}
		}
	} else {
		storage.predictionList.push(prediction);

		console.log("PREDICTION: " + prediction);
	}
}

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
	
	mainMenu();
	
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
			console.log(storage.dontUse);
			
			console.log("Building AST");
			let syntaxTree = getAST(codeFile);
			console.log("Converting to Training Table");
			extractFeatures(syntaxTree);
			
			let firstPred = false;
			// Try to make a prediction based on the rules set by the user first
			if (storage.predictionCase == PREDICTION_CASE.VALUE){
				storage.trainingTable = storage.alwaysValue.slice();
			} else if (storage.predictionCase == PREDICTION_CASE.TAG){
				storage.trainingTable = storage.alwaysTag.slice();
			} else if (storage.predictionCase == PREDICTION_CASE.ATTRIBUTE){
				storage.trainingTable = storage.alwaysAttr.slice();
			}
			
			if (storage.trainingTable.length > 0 && !_.isEmpty(storage.sampleFeatures)) {
				
                console.log("Building DT");
                let decisionTree = getDT();
                console.log("Making Prediction");
				console.log(storage.sampleFeatures);
				
                let prediction = predicts(decisionTree, storage.sampleFeatures);
				console.log(prediction);
				if (prediction != ""){ //prediction possible
					console.log("here");
					firstPred = true;
					multiplePred(prediction);
				}
				
			}
			if (firstPred === false){ // Try to make prediction now with the existing document
				storage.trainingTable = [];
				extractFeatures(syntaxTree);
				
				
				console.log(storage.trainingTable);
				console.log(storage.sampleFeatures);
				if (storage.trainingTable.length > 0 && !_.isEmpty(storage.sampleFeatures)) {
					
					console.log("Building DT");
					let decisionTree = getDT();

					console.log("Making Prediction");
					console.log(storage.sampleFeatures);
					let prediction = predicts(decisionTree, storage.sampleFeatures);
					multiplePred(prediction);

				}
			}
		}
		currentPred();
        console.log('---------------------------');
        updateOutputFrame();
	}

    let staticWordCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
        	let rank = storage.predictionList.length;
            callback(null, storage.predictionList.map(function (word) {
            	rank--;
                return {
                    caption: word, // completion displayed
                    value: word, // completion performed
                    score: rank, // ordering
                    meta: storage.predictionCase // description displayed
                };
            }));
        }
    };

    let langTools = ace.require("ace/ext/language_tools");
    langTools.setCompleters([staticWordCompleter]);

});
