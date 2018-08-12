var storage = {
    fragment: {}, // Incomplete code currently being written
    predictionCase: {}, // Tokenizer-determined prediction scenario
    trainingTable: [],	// AST Features for making DT
    sampleFeatures: {},	// Features to input into DT to get prediction
    sampleFeaturesExtra: [],    // For serial parent attribute-value pairs
    predictionSet: new Set(),	// Predictions from DT
    sampleFeaturesMap : {}, // Maps each prediction to its sample features
    aceEditor: {},

	ast: [],
    dt: {},

	topPred: "",
	badExamples: new Set(),
	examples: new Set(),
	highlights: [],
	dontUse: [], // List of entries/rules the user doesn't want to use
	alwaysTag: [], // Rules for predicting tags 
 	alwaysAttr: [], // Rules for predicting attributes 
	alwaysValue: [], // Rules for predicting values
	justTable: false
};

/*
Checks if a prediction is blacklisted based on the features of the sample
*/
function inBlackList(pred){
	let sample = Object.assign({}, storage.sampleFeatures);
	if (storage.predictionCase === PREDICTION_CASE.ATTRIBUTE){
		sample.attr = pred;
    } else if (storage.predictionCase === PREDICTION_CASE.VALUE){
        sample.val = pred;
    } else if (storage.predictionCase === PREDICTION_CASE.TAG){
        sample.tag = pred;
    }
	return contains(sample, storage.dontUse);
}

/*
This checks whether ID3 returned multiple predictions
(sorted by probability), and if so, pushes each one.
*/
function multiplePred(prediction, features){
	if (prediction.includes(" // ")) {
        let predictions = new Set(prediction.split(" // "));
        for (let pred of predictions) {
            if (pred !== '' && !inBlackList(pred)) {
                storage.predictionSet.add(pred);
                storage.sampleFeaturesMap[pred] = features;
            }
        }
        console.log("PREDICTION: " + Array.from(storage.predictionSet));
	} else if (!inBlackList(prediction)){
        storage.predictionSet.add(prediction);
        console.log("PREDICTION: " + prediction);
        storage.sampleFeaturesMap[prediction] = features;
	}
}

function insertDefaultCode() {
    const def = '<!DOCTYPE html>\n<html>\n\t<head></head>\n\t<body>\n\t\t\n\t</body>\n</html>';
    storage.aceEditor.setValue(def, -1);
    storage.aceEditor.gotoLine(5, 2);
    storage.aceEditor.focus();
}

/*manually ccompares 1st entry in training set and sample
Returns true if none of the features are the same
if 1 or more features are the same, it returns false
*/
function notSimilar(){
	let answer = true;
	let entry = storage.trainingTable[0];
	let sample = Object.assign({}, storage.sampleFeatures);
	let keys = Object.keys(sample);
	for (let key in keys){
		if (entry[keys[key]] == sample[keys[key]]){
			answer = false;
		}
    }
	return answer;
}

function storeDT(dt) {
    storage.dt[storage.predictionCase] = Object.assign({}, dt);
}

/**
 * Uses the Ace library {@link https://ace.c9.io/} to create a code editor and
 * calls functions to initialize the auto-complete features. Runs when the page
 * has loaded to initialize everything.
 */
$(document).ready(function() {

    storage.aceEditor = setupEditor();
    let outputFrame = $('#outputFrame');
    insertDefaultCode();
    let staticWordCompleter = setupCompleter();
    ace.require("ace/ext/language_tools").setCompleters([staticWordCompleter]);
    mainMenu();
	let prevKey = '';

	function setupEditor() {
		let aceEditor = ace.edit("editor");
		aceEditor.setTheme("ace/theme/monokai");
		aceEditor.getSession().setMode("ace/mode/html");
        aceEditor.$blockScrolling = Infinity;
		aceEditor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true,
		});
        // aceEditor.onPaste = function() { return "";};
        aceEditor.on('focus', function (event, editors) {
            $(this).keyup(function (e) {
                if (aceEditor.isFocused()) {
					// if (e.key === 'Control' && prevKey === 'Shift') aceEditor.onPaste = function(text, event) { this.commands.exec("paste", this, {text: text, event: event});};
                    handleKey(e.key, aceEditor, outputFrame);
                    if (((e.key.length === 1 && /[\w"'< ]/.test(e.key)) || e.key === ',' && prevKey === 'Shift' || e.key === 'Backspace') && storage.predictionCase !== PREDICTION_CASE.NONE) {
                        aceEditor.commands.byName.startAutocomplete.exec(aceEditor);
						if (aceEditor.completer.completions != null){
							storage.topPred = aceEditor.completer.completions.filtered[0].caption;
							let rule = getRule();
							findNodes(rule, storage.ast);
							highlightLine();
						} else{
							deleteHighlight();
						}
                    }
					prevKey = e.key;
                }
				currentPred();
				
            });
        })();
        return aceEditor;
    }

    function setupCompleter() {
        return {
            getCompletions: function (editor, session, pos, prefix, callback) {
                let rank = storage.predictionSet.size;
                callback(null, Array.from(storage.predictionSet).map(function (word) {
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
    }


});

function updateOutputFrame(outputFrame, value) {
    outputFrame.contents().find('body').html(value);
}

function handleKey(key, aceEditor, outputFrame) {

    if (['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Shift', 'CapsLock', 'Tab', 'Alt'].includes(key)) return;
    console.log("KEY: " + key);

    console.log("Tokenizing");
    let codeFile = new CodeFile(aceEditor.getValue(), aceEditor.getCursorPosition());
    codeFile.tokenize();
    console.log("PREDICTION CASE: " + storage.predictionCase);

    storage.fragment = {};
    storage.trainingTable = [];
    storage.sampleFeatures = {};
    storage.sampleFeaturesExtra = [];
    storage.predictionSet = new Set();
	//storage.topPred = '';

	console.log("Building AST");
    let syntaxTree = getAST(codeFile);
	storage.ast = syntaxTree;
	deleteHighlight();
    if (storage.predictionCase !== PREDICTION_CASE.NONE) {

        /*
            Make predictions using prioritized rules
         */
        console.log("~Priority Predictions~");
		
        console.log("Extracting Input Features");
        extractFeatures(syntaxTree, true);

        console.log("Extracting Priority Training Rules");
        if (storage.predictionCase === PREDICTION_CASE.VALUE){
            storage.trainingTable = storage.alwaysValue.slice();
        } else if (storage.predictionCase === PREDICTION_CASE.TAG){
            storage.trainingTable = storage.alwaysTag.slice();
        } else if (storage.predictionCase === PREDICTION_CASE.ATTRIBUTE){
            storage.trainingTable = storage.alwaysAttr.slice();
        }
	
		if (storage.trainingTable.length === 1 && notSimilar()){
            console.log("Single Rule Not Useable");
/*            prediction = "";
            multiplePred(prediction, storage.sampleFeatures);*/
		} else if (storage.trainingTable.length > 0 && !_.isEmpty(storage.sampleFeatures)) {
			console.log("Building DT");
			let decisionTree = getDT();
			storeDT(decisionTree);

			console.log("Making Prediction");
			let prediction = predicts(decisionTree, storage.sampleFeatures);
			multiplePred(prediction, storage.sampleFeatures);

            // If there's multiple parentAttr/Val pairs we have more features for prediction
            for (let sampleFeatures of storage.sampleFeaturesExtra) {
                let prediction = predicts(decisionTree, sampleFeatures);
                multiplePred(prediction, sampleFeatures);
            }
		}

		/*
		    Make predictions using regular rules
		 */
		console.log("~Standard Predictions~");

		console.log("Extracting Input/Training Features");
		storage.trainingTable = [];
		extractFeatures(syntaxTree, true);
			
		if (storage.trainingTable.length === 1 && notSimilar()){
            console.log("Single Rule Not Useable");
			/*prediction = "";
			multiplePred(prediction, storage.sampleFeatures);*/
		} else if (storage.trainingTable.length > 0 && !_.isEmpty(storage.sampleFeatures)) {

			console.log("Building DT");
			let decisionTree = getDT();
            storeDT(decisionTree);

			console.log("Making Prediction");
			let prediction = predicts(decisionTree, storage.sampleFeatures);
			multiplePred(prediction, storage.sampleFeatures);

			// If there's multiple parentAttr/Val pairs we have more features for prediction
            for (let sampleFeatures of storage.sampleFeaturesExtra) {
                let prediction = predicts(decisionTree, sampleFeatures);
                multiplePred(prediction, sampleFeatures);
            }
		}

		// TODO: Is this perhaps different from completers top?
		if (storage.predictionSet.size !== 0){
			storage.topPred = Array.from(storage.predictionSet)[0];
		}
    }
    currentPred();
    console.log('---------------------------');
    updateOutputFrame(outputFrame, aceEditor.getValue());
}
