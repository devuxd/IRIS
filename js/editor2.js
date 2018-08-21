var storage = {

    // TODO needed?
    aceEditor: {},

/*    sampleFeatures: {},	// Features to input into DT to get prediction
    sampleFeaturesExtra: [],    // For serial parent attribute-value pairs
    dontUse: [], // List of entries/rules the user doesn't want to use
    alwaysTag: [], // Rules for predicting tags
    alwaysAttr: [], // Rules for predicting attributes
    alwaysValue: [], // Rules for predicting values
    topPred: "",*/

    fragment: {}, // Incomplete code currently being written
    predictionCase: {}, // Tokenizer-determined prediction scenario
    trainingTable: [],	// AST Features for making DT
    predictionSet: new Set(),	// Predictions from DT

    badExamples: new Set(),
    examples: new Set(),
    highlights: [],

    topRule: new Rule({}, null),
    inputForPrediction: {},
    inputs: [], // List of input objects
    ast: {},
    dt: {tag:{},attribute:{},value:{}},
    standard: {tag:[], attribute: [], value:[]},
    whitelist: {tag:[],attribute:[],value:[]},
    blacklist: {tag:[],attribute:[],value:[]},
   /* cache: {length, }*/

};

function updateOutputFrame(outputFrame, value) {
    outputFrame.contents().find('body').html(value);
}

/*
    @param {Array} whitelistRules - whitelisted rules for specific prediction case
 */
function predictFromWhitelist(whitelistRules) {

    console.log('~Whitelist Predictions~');

    // If a whitelist rule has the user inputs, store its prediction
    // TODO: This is blind to strength and biased to order
    for (const userInput of storage.inputs) {
        for (const whitelistRule of whitelistRules) {

            const predictions = [];
            const whitelistRuleInput = whitelistRule.getInputs();

            if (kvpEquals(whitelistRuleInput, userInput)) {
                const prediction = whitelistRule.getPrediction()[whitelistRule.getPredictionCase()];
                predictions.push(prediction);
            }

            const predictionString = predictions.join(" // ");
            addPredictions(predictionString, whitelistRuleInput); // TODO is this the right order?
        }
    }

}

function predictFromDT() {

    console.log("~Standard Predictions~");

    console.log("Building DT");
    const decisionTree = getDT(storage.trainingTable, storage.predictionCase);
    storeDT(decisionTree);

    for (const input of storage.inputs) {
        const predictionInfo = predicts(decisionTree, input);
        if (predictionInfo === null) continue;
        const predictionString = predictionInfo.prediction;
        const path = predictionInfo.path;
        addPredictions(predictionString, path);
    }

}

function addPredictions(predictionString, input){
	if (predictionString.includes(" // ")) {
        const predictions = new Set(predictionString.split(" // "));
        for (const prediction of predictions) {
            storage.predictionSet.add(prediction);
            if (storage.inputForPrediction[prediction] === undefined) {
                storage.inputForPrediction[prediction] = input;
            }
        }
        console.log("PREDICTION: " + Array.from(predictions));
	} else {
	    const prediction = predictionString;
        storage.predictionSet.add(prediction);
        if (storage.inputForPrediction[prediction] === undefined) {
            storage.inputForPrediction[prediction] = input;
        }
        console.log("PREDICTION: " + prediction);
	}
}

function insertDefaultCode(aceEditor) {
    const def = '<!DOCTYPE html>\n<html>\n\t<head></head>\n\t<body>\n\t\t\n\t</body>\n</html>';
    aceEditor.setValue(def, -1);
    aceEditor.gotoLine(5, 2);
    aceEditor.focus();
}

function storeDT(dt) {
    storage.dt[storage.predictionCase] = dt;
}

function storeAST(ast) {  // TODO is cloning necessary?
    storage.ast = Object.assign({}, ast);
}

/*
    What: Decides whether to show autocomplete menu based on latest 2 keystrokes
    How: Prediction case is not none AND one of the following // TODO ctrlspace works?
    1. Alphanumeric/underscore, quotes, bracket, or space character
    2. Comma after Shift (bracket)
    3. Backspace key
 */
function shouldTriggerAutocomplete(key, prevKey) {
    let shortcut = (key === 'Space' && prevKey === 'Control');
    let validKey = (key.length === 1 && /[\w"'< ]/.test(key));
    let bracket = (key === ',' && prevKey === 'Shift');
    let backspace = (key === 'Backspace');
    let predicting = storage.predictionCase !== PREDICTION_CASE.NONE;
    return predicting && (shortcut || validKey || bracket || backspace);
}

/*
    What: Decides whether to perform tokenization to determine prediction case
    How: Anything except an arrow key, shift, capslock, tab or alt.
 */
function shouldTriggerTokenization(key) {
    const noTrigger = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Shift', 'CapsLock', 'Tab', 'Alt'];
    return !(noTrigger.includes(key));
}

/**
 * Uses the Ace library {@link https://ace.c9.io/} to create a code editor and
 * calls functions to initialize the auto-complete features. Runs when the page
 * has loaded to initialize everything.
 */
$(document).ready(function() {

    let outputFrame = $('#outputFrame');
    storage.aceEditor = setupEditor();
    let staticWordCompleter = setupCompleter();
    ace.require("ace/ext/language_tools").setCompleters([staticWordCompleter]);
    mainMenu();

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
		insertDefaultCode(aceEditor);

        let prevKey = '';

        aceEditor.on('focus', function (event, editors) {
            $(this).keyup(function (e) {
                if (aceEditor.isFocused()) {
                    const key = e.key;
                    if (shouldTriggerTokenization(key)) {
                        handleKey(key, aceEditor, outputFrame);
                        console.log('---------------------------');
                    }
                    if (shouldTriggerAutocomplete(key, prevKey)) {
                        aceEditor.commands.byName.startAutocomplete.exec(aceEditor);
                        if (aceEditor.completer.completions !== null) {
                            const top = aceEditor.completer.completions.filtered[0].caption;
                            const prediction = {};
                            prediction[storage.predictionCase] = top;
                            storage.topRule.setPrediction(prediction);
                            storage.topRule.setInputs(storage.inputForPrediction[top]);
                        }
                    }
					prevKey = key;
                    currentPred();
                    updateOutputFrame(outputFrame, aceEditor.getValue());
                }
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

function handleKey(key, aceEditor) {

    console.log("KEY: " + key);

    console.log("Tokenizing");
    const codeFile = new CodeFile(aceEditor.getValue(), aceEditor.getCursorPosition());
    codeFile.tokenize();
    console.log("PREDICTION CASE: " + storage.predictionCase);

    storage.fragment = {};  // Resets fragment
    storage.trainingTable = []; // Resets training rules
    storage.inputs = [];    // Resets inputs
    storage.predictionSet = new Set();  // Resets
	storage.topRule = new Rule({}, null);

	//deleteHighlight();

    if (storage.predictionCase !== PREDICTION_CASE.NONE) {

        // TODO: Should this happen before the case evaluation?
        console.log("Building AST");
        const ast = getAST(codeFile, true);
        storeAST(ast);

        console.log("Extracting Inputs / Training Rules");
        extractFeatures(ast, true);

        if (_.isEmpty(storage.inputs)) return;

        let whitelistRules = storage.whitelist[storage.predictionCase];
        if (whitelistRules.length > 0) {
            predictFromWhitelist(whitelistRules);
        }

		if (storage.trainingTable.length > 0) {
            predictFromDT();
        }

    }
}
