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
 * @param tokenType The type of the HTML token as defined by the tokenTypes
 *   enum.
 * @param tokenValue The plain text of the original token from the HTML. If a
 *   token is created to add extra information, it should have an empty string
 *   as its value.
 * @returns Initialized token object
 */
function token(tokenType, tokenValue) {
	this.type = tokenType;
	this.value = tokenValue;
}


/**
 * Creates a 'coeLine' object representing a line of code broken up into tokens.
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


function tokenizedHTML() {
	// Array of 'codeLine' objects
	this.lines = [];
}

tokenizedHTML.prototype.addLine = function() {
	this.lines.push(new codeLine());
}