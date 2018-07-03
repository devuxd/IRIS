var PREDICT = Object.freeze({
    "TAG": "tag",
    "ATTRIBUTE": "attribute",
    "VALUE_ASSIGN_SPACE": " = \"value\"",
    "VALUE_QUOTES_SPACE": " \"value\"",
    "VALUE_QUOTES": "\"value\"",
    "VALUE": "value",
    "NONE": "none",
});

var predict = PREDICT.NONE;

function codeFile() {}

codeFile.prototype.locateStarter = function(text) {
    this.starter = text.lastIndexOf("<"); // TODO : Make this more flexible?
};

codeFile.prototype.update = function(code) {
    this.code = code;
    this.position = page.codeEditor.getCursorPosition();
};

codeFile.prototype.analyze = function() {
    let text = this.code.split("\n")[this.position.row];

    let tokens = [];
    let i = 0;
    while (i < this.position.column) {
        let token = null;
        let s = text.substring(i, i+1);
        switch(s) {
            case " ":
                token = new Token(TYPE.SPACE);
                break;
            case "<":   // Open bracket --> predict tag
                token = new Token(TYPE.TAG_OPEN);
                predict = PREDICT.TAG;
                break;
            case ">":
                token = new Token(TYPE.TAG_CLOSE);
                predict = PREDICT.NONE;
                break;
            case "=":
                token = new Token(TYPE.ASSIGN);
                break;
            case "\"":
                token = new Token(TYPE.QUOTES);
                break;
            default:
                token = new Token(TYPE.TEXT);
        }
        addToken(tokens, token);
        i++;
    }
    if (tokens.length === 0) predict = PREDICT.NONE;   // No tokens --> predict nothing
    // NOTE: FOLLOWING CODE IS QUICK FIX FOR CONVENIENCE. CANNOT BE PERMANENT
    if (predict == PREDICT.VALUE_ASSIGN_SPACE || predict == PREDICT.VALUE_QUOTES ||
        predict == PREDICT.VALUE_QUOTES_SPACE) {
        predict = PREDICT.VALUE;
    }
    console.log("PREDICTING: " + predict);
    this.locateStarter(text);
};

function addToken(tokens, token) {
    let top = null;

    if (tokens.length >= 1) {
        top = tokens[tokens.length - 1];

        if (top.type == TYPE.SPACE && token.type == TYPE.SPACE) {   // Space + space --> space
            return;
        }
        if (top.type == TYPE.TEXT && token.type == TYPE.TEXT) { // Text + text --> text
            return;
        }

        if (predict == PREDICT.TAG) {   // Predicting tag
            if (token.type == TYPE.SPACE) { // Types space
                if (top.type == TYPE.TEXT) {    // Typed <tag --> predict attribute
                    top.type = TYPE.TAG;
                    predict = PREDICT.ATTRIBUTE;
                } else if (top.type == TYPE.TAG_OPEN) { // Typed < --> predict nothing
                    predict = PREDICT.NONE;
                }
            } else if (token.type == TYPE.TAG_CLOSE) {  // Types > --> predict none
                top.type = TYPE.TAG;
                predict = PREDICT.NONE;
            }
        }

        else if (predict == PREDICT.ATTRIBUTE) {    // Predicting attribute
            if (token.type == TYPE.SPACE) { // Types space --> predict = "value"
                top.type = TYPE.ATTRIBUTE;
                predict = PREDICT.VALUE_ASSIGN_SPACE;
            } else if (token.type == TYPE.ASSIGN) { // Types = --> predict "value"
                top.type = TYPE.ATTRIBUTE;
                predict = PREDICT.VALUE_QUOTES;
            }
        }

        else if (predict == PREDICT.VALUE_ASSIGN_SPACE) {   // Predicting = "value"
            if (token.type == TYPE.ASSIGN) {    // Types = --> predict "value"
                predict = PREDICT.VALUE_QUOTES_SPACE;
            }
        }

        else if (predict == PREDICT.VALUE_QUOTES_SPACE) {   // Predicting _"value"
            if (token.type == TYPE.SPACE) { // Types space --> predict "value"
                predict = PREDICT.VALUE_QUOTES;
            } else if (token.type == TYPE.QUOTES) { // Types " --> predict value
                predict = PREDICT.VALUE;
            }
        }

        else if (predict == PREDICT.VALUE_QUOTES) { // Predicting "value"
            if (token.type == TYPE.QUOTES) {    // Types " --> predict value
                predict = PREDICT.VALUE;
            }
        }

        else if (predict == PREDICT.VALUE) {    // Predicting value
            if (token.type == TYPE.SPACE) { // Types space
                if (top.type == TYPE.QUOTES) {  // ..after the end quote --> predict attribute
                    tokens[tokens.length - 2].type = TYPE.VALUE;
                    predict = PREDICT.ATTRIBUTE;
                } else if (top.type == TYPE.TEXT) { // ..after the value text --> predict nothing
                    predict = PREDICT.NONE;
                }
            } else if (token.type == TYPE.TAG_CLOSE) {  // Types > --> predict none
                tokens[tokens.length - 2].type = TYPE.VALUE;
                predict = PREDICT.NONE;
            }
        }
    }
    tokens.push(token);
}

let TYPE = Object.freeze({
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
