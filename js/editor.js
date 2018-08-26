var storage = {

    aceEditor: {},

    fragment: '', // Incomplete code developer is writing
    predictionCase: PREDICTION_CASE.NONE,
    predictionCaseInfo: PREDICTION_CASE.NONE,
    trainingTable: [],
    standard: {tag:[], attribute: [], value:[]},
    whitelist: {tag:[],attribute:[],value:[]},
    blacklist: {tag:[],attribute:[],value:[]},
    predictions: [],
    inputs: [],
    inputPerPrediction: {},
    topRule: new Rule(null, null),

    badExamples: new Set(),
    examples: new Set(),
    highlights: [],

    ast: {},
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

            if (kvpEquals(whitelistRuleInput, userInput, false)) {
                const prediction = whitelistRule.getPrediction()[whitelistRule.getPredictionCase()];
                predictions.push(prediction);
            }

            if (predictions.length > 0) {
                addPredictions(predictions, whitelistRuleInput, 'priority | ' + storage.predictionCase); // TODO is this the right order?
            }
        }
    }

}

function predictFromDT() {

    console.log("~Standard Predictions~");

    console.log("Building DT");
    const decisionTree = getDT(storage.trainingTable, storage.predictionCase);

    for (const input of storage.inputs) {
        const predictionInfo = predicts(decisionTree, input);
        if (predictionInfo === null) continue;
        const predictions = predictionInfo.prediction;
        const path = predictionInfo.path;
        addPredictions(predictions, path, storage.predictionCase);
    }
}

function addPredictions(predictions, input, meta){
    for (const prediction of predictions) {
        let predictionPerformed = prediction;
        if (storage.predictionCase === PREDICTION_CASE.VALUE) {
            predictionPerformed = storage.predictionCaseInfo.toString().replace('value',prediction);
        }
        storage.predictions.push({prediction:prediction, meta:meta, predictionPerformed:predictionPerformed});
        if (storage.inputPerPrediction[prediction] === undefined) {
            storage.inputPerPrediction[prediction] = input;
        }
    }
    console.log("PREDICTION: " + predictions);
}

function insertDefaultCode(aceEditor) {
    const def = '<!DOCTYPE html>\n<html>\n\t<head></head>\n\t<body>\n\t\t\n\t</body>\n</html>';
    aceEditor.setValue(def, -1);
    aceEditor.gotoLine(5, 2);
    aceEditor.focus();
}

function storeAST(ast) {  // TODO is cloning necessary?
    storage.ast = Object.assign({}, ast);
}

/*
    What: Decides whether to show autocomplete menu based on latest 2 keystrokes
    How: Prediction case is not none AND one of the following // TODO ctrlspace works? Also this is outdated
    1. Alphanumeric/underscore, quotes, bracket, or space character
    2. Comma after Shift (bracket)
    3. Backspace key
 */
function shouldTriggerAutocomplete(key, prevKey) {
    let shortcut = (key === 'Space' && prevKey === 'Control');
    let validKey = (key.length === 1 && /[\w"'<= ]/.test(key));
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
    loadElements();
    refreshUI(false);

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
                            storage.topRule.setInputs(storage.inputPerPrediction[top]);
                        }
                    }
					prevKey = key;
                    refreshUI(true);
                    updateOutputFrame(outputFrame, aceEditor.getValue());
                }
            });
        })();
        return aceEditor;
    }

    function setupCompleter() {
        return {
            getCompletions: function (editor, session, pos, prefix, callback) {
                callback(null, storage.predictions.map(function (predictionInfo) {
                    return {
                        caption: predictionInfo.prediction, // completion displayed
                        value: predictionInfo.predictionPerformed, // completion performed
                        meta: predictionInfo.meta // subtitle displayed
                        // score: 0, // ordering
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
    console.log("PREDICTION CASE: " + storage.predictionCase + (storage.predictionCase === PREDICTION_CASE.VALUE ? '; ' + storage.predictionCaseInfo : ''));

    storage.fragment = '';  // Resets fragment
    storage.trainingTable.length = 0; // Resets training rules
    storage.inputs.length = 0;    // Resets inputs
    storage.predictions.length = 0;  // Resets
    storage.inputPerPrediction = {};
	storage.topRule = new Rule(null, null);

	//deleteHighlight();

    if (storage.predictionCase !== PREDICTION_CASE.NONE) {

        // TODO: Should this happen before the case evaluation?
        console.log("Building AST");
        const ast = getAST(codeFile, true);
        storeAST(ast);

        console.log("Extracting Inputs / Training Rules");
        extractFeatures(ast, storage.predictionCase);

        if (storage.inputs.length === 0) return;

        let whitelistRules = storage.whitelist[storage.predictionCase];
        if (whitelistRules.length > 0) {
            predictFromWhitelist(whitelistRules);
        }

		if (storage.trainingTable.length > 0) {
            predictFromDT();
        }

    }
}
