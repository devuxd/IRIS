var PREDICTION_CASE = Object.freeze({
    "TAG": "tag",
    "ATTRIBUTE": "attribute",
    "VALUE_ASSIGN_SPACE": " = \"value\"",
    "VALUE_QUOTES_SPACE": " \"value\"",
    "VALUE_QUOTES": "\"value\"",
    "VALUE": "value",
    "NONE": "none",
});

function CodeFile(code, position) {
    this.code = code;
    this.position = position;
    this.findStarter = function(text) {
        this.starter = text.lastIndexOf("<"); // TODO : Make this more flexible?
    }
}

CodeFile.prototype.tokenize = function() {
    let text = this.code.split("\n")[this.position.row];
    this.findStarter(text);
    let tokens = [];
    let i = 0;
    while (i < this.position.column) {
        let token = null;
        let s = text.substring(i, i+1);
        switch(s) {
            case " ":
                token = new Token(TOKEN_TYPE.SPACE);
                break;
            case "<":   // Open bracket --> predict tag
                token = new Token(TOKEN_TYPE.TAG_OPEN);
                storage.predictionCase = PREDICTION_CASE.TAG;
                break;
            case ">":   // Close bracket --> predict nothing
                token = new Token(TOKEN_TYPE.TAG_CLOSE);
                storage.predictionCase = PREDICTION_CASE.NONE;
                break;
            case "=":
                token = new Token(TOKEN_TYPE.ASSIGN);
                break;
            case "\"":
                token = new Token(TOKEN_TYPE.QUOTES);
                break;
            default:
                token = new Token(TOKEN_TYPE.TEXT);
        }
        addToken(tokens, token);
        i++;
    }
    if (tokens.length === 0) storage.predictionCase = PREDICTION_CASE.NONE;   // No tokens --> predict nothing

    // NOTE: FOLLOWING CODE IS QUICK FIX FOR CONVENIENCE. SHOULD NOT BE PERMANENT
    if (storage.predictionCase == PREDICTION_CASE.VALUE_ASSIGN_SPACE ||
        storage.predictionCase == PREDICTION_CASE.VALUE_QUOTES ||
        storage.predictionCase == PREDICTION_CASE.VALUE_QUOTES_SPACE) {

        storage.predictionCase = PREDICTION_CASE.VALUE;
    }
};

function addToken(tokens, token) {
    let top = null;

    if (tokens.length >= 1) {
        top = tokens[tokens.length - 1];

        if (top.type == TOKEN_TYPE.SPACE && token.type == TOKEN_TYPE.SPACE) {   // Space + space --> space
            return;
        }
        if (top.type == TOKEN_TYPE.TEXT && token.type == TOKEN_TYPE.TEXT) { // Text + text --> text
            return;
        }

        if (storage.predictionCase == PREDICTION_CASE.TAG) {   // Predicting tag
            if (token.type == TOKEN_TYPE.SPACE) { // Types space
                if (top.type == TOKEN_TYPE.TEXT) {    // Typed <tag --> predict attribute
                    top.type = TOKEN_TYPE.TAG;
                    storage.predictionCase = PREDICTION_CASE.ATTRIBUTE;
                } else if (top.type == TOKEN_TYPE.TAG_OPEN) { // Typed < --> predict nothing
                    storage.predictionCase = PREDICTION_CASE.NONE;
                }
            } /*            else if (token.type == TOKEN_TYPE.TAG_CLOSE) {  // Types > --> predict none
                top.type = TOKEN_TYPE.TAG;
                storage.predictionCase = PREDICTION_CASE.NONE;
            }*/
        }

        else if (storage.predictionCase == PREDICTION_CASE.ATTRIBUTE) {    // Predicting attribute
            if (token.type == TOKEN_TYPE.SPACE) { // Types space --> predict = "value"
                top.type = TOKEN_TYPE.ATTRIBUTE;
                storage.predictionCase = PREDICTION_CASE.VALUE_ASSIGN_SPACE;
            } else if (token.type == TOKEN_TYPE.ASSIGN) { // Types = --> predict "value"
                top.type = TOKEN_TYPE.ATTRIBUTE;
                storage.predictionCase = PREDICTION_CASE.VALUE_QUOTES;
            }
        }

        else if (storage.predictionCase == PREDICTION_CASE.VALUE_ASSIGN_SPACE) {   // Predicting = "value"
            if (token.type == TOKEN_TYPE.ASSIGN) {    // Types = --> predict "value"
                storage.predictionCase = PREDICTION_CASE.VALUE_QUOTES_SPACE;
            }
        }

        else if (storage.predictionCase == PREDICTION_CASE.VALUE_QUOTES_SPACE) {   // Predicting _"value"
            if (token.type == TOKEN_TYPE.SPACE) { // Types space --> predict "value"
                storage.predictionCase = PREDICTION_CASE.VALUE_QUOTES;
            } else if (token.type == TOKEN_TYPE.QUOTES) { // Types " --> predict value
                storage.predictionCase = PREDICTION_CASE.VALUE;
            }
        }

        else if (storage.predictionCase == PREDICTION_CASE.VALUE_QUOTES) { // Predicting "value"
            if (token.type == TOKEN_TYPE.QUOTES) {    // Types " --> predict value
                storage.predictionCase = PREDICTION_CASE.VALUE;
            }
        }

        else if (storage.predictionCase == PREDICTION_CASE.VALUE) {    // Predicting value
            if (token.type == TOKEN_TYPE.SPACE) { // Types space
                if (top.type == TOKEN_TYPE.QUOTES) {  // ..after the end quote --> predict attribute
                    tokens[tokens.length - 2].type = TOKEN_TYPE.VALUE;
                    storage.predictionCase = PREDICTION_CASE.ATTRIBUTE;
                } else if (top.type == TOKEN_TYPE.TEXT) { // ..after the value text --> predict nothing
                    storage.predictionCase = PREDICTION_CASE.NONE;
                }
            } /*else if (token.type == TOKEN_TYPE.TAG_CLOSE) {  // Types > --> predict none
                tokens[tokens.length - 2].type = TOKEN_TYPE.VALUE;
                storage.predictionCase = PREDICTION_CASE.NONE;
            }*/
        }
    }
    tokens.push(token);
}

let TOKEN_TYPE = Object.freeze({
    "TAG_OPEN": 0,
    "TAG": 1,
    "SPACE": 2,
    "ATTRIBUTE": 3,
    "ASSIGN": 4,
    "QUOTES": 5,
    "VALUE": 6,
    "TAG_CLOSE": 7,
    "TEXT": 8,
});

function Token(type) {
    this.type = type;
}

Token.prototype.toString = function() {
    return this.type;
};
