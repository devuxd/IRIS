tokenizdHTML {
	lines: [
		[{token}, {token}, {token}]
	]
}


tokenTypes = Object.freeze({
	"emptySpace": 0,
	"script": 1,
	"css" : 2,
	"elementStart": 11,
	"elementEnd": 12,
	"elementName": 13,
	"attributeName": 14,
	"attributeAssigner": 15, // the equal sign in an attribute
	"attributeValue": 16,
	"ampersandSymbol": 17 // special symbols in the form of &___;
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
		var lines = code.split("\n");
		var state = ;
		for (var i = 0; i < lines.length; i++) {
			if ()
		}
	}
}