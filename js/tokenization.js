{
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
 * @param tokenType The type of the HTML token as defined by the tokenTypes enum
 * @param tokenValue The plain text of the original token from the HTML
 * @returns Initialized token object
 */
function token(tokenType, tokenValue) {
	this.type = tokenType;
	this.value = tokenValue;
}