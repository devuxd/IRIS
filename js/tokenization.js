tokenizdHTML {
	lines: [
		[{token}, {token}, {token}]
	]
}


tokenTypes = Object.freeze({
	"emptySpace": 0,
	"script": 1,
	"css" : 2,
	"elementStart": 11, // <
	"elementEnd": 12, // >
	"elementClose": 13, // /
	"elementName": 14, // The name of a tag
	"attributeName": 15,
	"attributeAssigner": 16, // the equal sign in an attribute
	"attributeValue": 17,
	"ampersandSymbol": 18 // special symbols in the form of &___;
});


/**
 * These states are intended to roughly (but not perfectly) match the states
 * defined by {@link https://www.w3.org/TR/2011/WD-html5-20110113/tokenization.html}
 */
tokenizerStates = Object.freeze({
	"data": 0,
	"characterReferenceInData": 1,
	"tagOpen": 2,
	"tagClose": 3,

});


/**
 * Creates a 'token' object which is structured as follows:
 *   token: { type: tokenTypes, value: string }
 * @param {tokenTypes} tokenType The type of the HTML token as defined by the
 *   tokenTypes enum.
 * @param {string} tokenValue The plain text of the original token from the
 *   HTML. If a token is created to add extra information, it should have an
 *   empty string as its value.
 * @returns Initialized token object
 */
function token(tokenType, tokenValue) {
	this.type = tokenType;
	this.value = tokenValue;
}


/**
 * Creates a 'codeLine' object representing a line of code broken up into tokens.
 */
function codeLine() {
	// Array of 'token' objects
	this.tokens = [];
}


/**
 * Adds a 'token' to the end of the line
 */
codeLine.prototype.addToken = function(token) {
	this.tokens.push(token);
};


function tokenizedFile() {
	// Array of 'codeLine' objects
	this.lines = [];
}


tokenizedFile.prototype.addLine = function() {
	this.lines.push(new codeLine());
}


/**
 * Reads code and populates the 'tokenizedFile' object with the tokenized form
 * of the file.
 * @param {string} code The content of the file as text
 * @param {string} language The language of the file (HTML, Javascript, etc.)
 * @returns {void}
 */
tokenizedFile.prototype.initialize = function(code, language) {
	if (language.toLowerCase() == "html") {
		var linesText = code.split("\n");
		var state = tokenizerStates.data;
		for (var lineIndex = 0; lineIndex < linesText.length; lineIndex++) {
			this.lines.addLine();
			// Used to keep track of tokens that are multiple characters long
			var currentToken = "";
			for (var letterIndex = 0; letterIndex < linesText[lineIndex].length; letterIndex++) {
				var currentChar = linesText[lineIndex].substring(letterIndex, 1);
				var currentLine = this.lines.length - 1;
				switch (state) {
					case tokenizerStates.data:
						if (currentChar == "&") {
							currentToken += "&";
							state = tokenizerStates.characterReferenceInData;

						}
						else if (currentChar == "<") {
							this.lines[currentLine].addToken(new token(tokenTypes.elementStart, "<"));
							state = tokenizerStates.tagOpen;
							currentToken = "";
						}
						break;
					case tokenizerStates.characterReferenceInData:
						// TODO: Finish this after finishing tags
						break;
					case tokenizerStates.tagOpen:
						if (currentChar == "/") {
							this.lines[currentLine].addToken(new token(tokenTypes.elementClose, "/"));
							state = tokenizerStates.elementName;
							currentToken = "";
						}
						break;
					case tokenizerStates.tagClose:

						break;
					case tokenizerStates.elementName:
							if (currentChar == ">") {
								this.lines[currentLine].addToken(new token(tokenTypes.elementClose));
								state = tokenizerStates.tagClose;
								currentToken = "";
							}
							// Alphanumeric
							else if (/^[a-z0-9]+$/i.test(currentChar)) {
								currentToken += currentChar;

							}
							if (currentChar != " ")
						break;
				}
			}
		}
	}
}