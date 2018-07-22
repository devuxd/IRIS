var storage = {
    fragment: {}, // Incomplete code currently being written
    predictionCase: {}, // Tokenizer-determined prediction scenario
    trainingTable: [],	// AST Features for making DT
    sampleFeatures: {},	// Features to input into DT to get prediction
    predictionSet: new Set(),	// Predictions from DT
};

/**
 * Uses the Ace library {@link https://ace.c9.io/} to create a code editor and
 * calls functions to initialize the auto-complete features. Runs when the page
 * has loaded to initialize everything.
 */
$(document).ready(function() {

    setupEditor();
    let staticWordCompleter = setupCompleter();
    ace.require("ace/ext/language_tools").setCompleters([staticWordCompleter]);
    let outputFrame = $('#outputFrame');

    function setupEditor() {
        let aceEditor = ace.edit("editor");
        aceEditor.setTheme("ace/theme/monokai");
        aceEditor.getSession().setMode("ace/mode/html");
        aceEditor.$blockScrolling = Infinity;
        aceEditor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });
        aceEditor.on('focus', function (event, editors) {
            $(this).keyup(function (e) {
                handleKey(e.key, aceEditor, outputFrame);
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
    storage.predictionSet = new Set();

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

            /*
                This checks whether ID3 returned multiple predictions
                (sorted by probability), and if so, adds each one.
             */
            if (prediction.includes(" // ")) {
                let predictions = new Set(prediction.split(" // "));
                for (let pred of predictions) storage.predictionSet.add(pred);
                console.log("PREDICTION: " + Array.from(storage.predictionSet));
            } else {
                storage.predictionSet.add(prediction);
                console.log("PREDICTION: " + prediction);
            }

        }
    }

    console.log('---------------------------');
    updateOutputFrame(outputFrame, aceEditor.getValue());
}