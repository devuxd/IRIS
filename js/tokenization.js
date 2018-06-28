tokenTypes = Object.freeze({
	"emptySpace": 0,
	"elementStart": 11, // <
	"elementEnd": 12, // >
	"elementCloseSlash": 13, // /
	"elementName": 14, // The name of a tag
	"attributeName": 15,
	"attributeAssigner": 16, // the equal sign in an attribute
	"attributeValue": 17,
	"ampersandSymbol": 18, // special symbols in the form of &___;
	"textNode": 19
});


/**
 * These states are intended to roughly (but not perfectly) match the states
 * defined by {@link https://www.w3.org/TR/2011/WD-html5-20110113/tokenization.html}
 */
tokenizerStates = Object.freeze({
	"data": 0,
	"tagOpen": 1,
	"tagClose": 2,
	"tagTerminate": 3,
	"elementName": 4,
	"spaceAfterElementName": 5,
	"attributeName": 6,
	"attributeValue": 7,
	"text": 8
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
	console.log("About to tokenize");
	if (language.toLowerCase() == "html") {
		var linesText = code.split("\n");
		var state = tokenizerStates.data;
		var currentTagName = "";
		var isCurrentTagClosing = false;
		var nonHTMLScope = false; // Used if we're inside a <script> or <style>
		for (var lineIndex = 0; lineIndex < linesText.length; lineIndex++) {
			console.log(state);
			this.addLine();
			// Used to keep track of tokens that are multiple characters long
			var currentToken = "";
			for (var letterIndex = 0; letterIndex < linesText[lineIndex].length; letterIndex++) {
				var currentChar = linesText[lineIndex].substring(letterIndex, letterIndex + 1);
				var nextChar = linesText[lineIndex].substring(letterIndex + 1, letterIndex + 2);
				var previousChar = linesText[lineIndex].substring(letterIndex - 1, letterIndex);
				var prevpreviousChar = linesText[lineIndex].substring(letterIndex - 2, letterIndex - 1);
				var currentLine = this.lines.length - 1;
				// This handles most cases. But it will break if the user types
				// a '/' more than 3 times in a row. Need a more complex method
				// to determine this
				var isCurrentCharEscaped = (previousChar == "\\" && prevpreviousChar != "\\");
				switch (state) {

					case tokenizerStates.data:
						if (currentChar == "<" && !isCurrentCharEscaped) {
							if (currentToken.length > 0) {
								this.lines[currentLine].addToken(new token(tokenTypes.textNode, currentToken));
								currentToken = "";
							}
							this.lines[currentLine].addToken(new token(tokenTypes.elementStart, "<"));
							state = tokenizerStates.tagOpen;
							currentToken = "";
						}
						else {
							currentToken += currentChar;
						}
						break;

					case tokenizerStates.tagOpen:
						if (currentChar == "/") {
							this.lines[currentLine].addToken(new token(tokenTypes.elementCloseSlash, "/"));
							state = tokenizerStates.elementName;
							currentToken = "";
						}
						else {
							currentToken = currentChar;
							state = tokenizerStates.elementName;
						}
						break;

					case tokenizerStates.tagClose:
						this.lines[currentLine].addToken(new token(tokenTypes.elementEnd, ">"));
						currentToken = "";
						// TODO
						state = tokenizerStates.data;
						break;

					case tokenizerStates.elementName:
						// Alphanumeric
						if (/^[a-z0-9]+$/i.test(currentChar)) {
							currentToken += currentChar;

						}
						else if (currentChar == ">") {
							if (currentToken.length > 0) {
								this.lines[currentLine].addToken(new token(tokenTypes.elementName, currentToken));
								currentTagName = currentToken;
							}
							this.lines[currentLine].addToken(new token(tokenTypes.elementEnd, ">"));
							state = tokenizerStates.data;
							currentToken = "";
						}
						else if (currentChar == " ") {
							if (currentToken.length > 0) {
								this.lines[currentLine].addToken(new token(tokenTypes.elementName, currentToken));
								currentTagName = currentToken;
								currentToken = "";
								state = tokenizerStates.spaceAfterElementName;
							}
						}
						// Gracefully switch states if a new tag is suddenly started
						else if (currentChar == "<" && !isCurrentCharEscaped) {
							if (currentToken.length > 0) {
								this.lines[currentLine].addToken(new token(tokenTypes.elementName, currentToken));
								currentTagName = currentToken;
							}
							this.lines[currentLine].addToken(new token(tokenTypes.elementStart, "<"));
							currentToken = "";
						}
						break;

					case tokenizerStates.spaceAfterElementName:
						// Alphanumeric
						if (/^[a-z0-9]+$/i.test(currentChar)) {
							currentToken += currentChar;
							state = tokenizerStates.attributeName;
						}
						break;

					case tokenizerStates.text:

						break;

					case tokenizerStates.attributeName:
						// Alphanumeric
						if (/^[a-z0-9:\-]+$/i.test(currentChar)) {
							currentToken += currentChar;
						}
						else {
							this.lines[currentLine].addToken(new token(tokenTypes.attributeName, currentToken));
							currentToken = "";
							if (currentChar == " ") {
								state = tokenizerStates.spaceAfterElementName;
								currentToken = " ";
							}
							else if (currentChar == "/") {
								state = tokenizerStates.tagClose;
								currentToken = "/";
							}
							else if (currentChar == ">") {
								this.lines[currentLine].addToken(new token(tokenTypes.elementClose, ">"));
								state = tokenizerStates.data;
								currentToken = "";
							}
							else if (currentChar == "=") {
								this.lines[currentLine].addToken(new token(tokenTypes.attributeAssigner, "="));
								state = tokenizerStates.attributeValue;
								nestedScope = false;
								currentToken = "";
							}
						}
						break;
					case tokenizerStates.attributeValue:
						// If the first quote of the attribute name is not already
						// detected
						if (!nestedScope) {
							if (currentChar == " ")
								currentToken += " ";
							else if (currentChar == "\"") {
								if (currentToken.length != 0) {
									this.lines[currentLine].addToken(new token(tokenTypes.emptySpace, currentToken));
									nestedScope = true;
									currentToken = "";
								}
							}
							else if (currentChar == "/") {
								state = tokenizerStates.tagClose;
								currentToken = "/";
							}
							else if (currentChar == ">") {
								this.lines[currentLine].addToken(new token(tokenTypes.elementClose, ">"));
								state = tokenizerStates.data;
								currentToken = "";
							}
							else {
								currentToken = currentChar;
								state = tokenizerStates.attributeName;
							}
						}
						// The first quote already appeared
						else {
							if (currentChar == "\"") {
								if (previousChar != "\\" || (previousChar == "\\" && prevpreviousChar == "\\")) {
									nestedScope = false;
									currentToken += currentChar;
									this.lines[currentLine].addToken(new token(tokenTypes.attributeValue, currentToken));
									state = tokenizerStates.spaceAfterElementName;
								}
							}
							else {
								currentToken += currentChar;
							}
						}
						break;
				}
			}
		}
	}
}

tokenizedFile.prototype.getString = function() {
	var stringForm = "";
	for (var i = 0; i < this.lines.length; i++) {
		for (var j = 0; j < this.lines[i].tokens.length; j++) {
			stringForm += "[" + this.lines[i].tokens[j].type + ":" + this.lines[i].tokens[j].value + "] ";
		}
		stringForm += "\n";
	}
	return stringForm;
}

/**
 * Returns the token right before where the cursor is. Use the 'getCursorPosition'
 * function built in to the Ace editor to get these values.
 * @param {Integer} row The line number of the cursor.
 * @param {Integer} column The column of the cursor measured by characters from
 * 	the left edge of the editor.
 * @returns {token} The token that is relevant to providing the current context.
 * 	Returns null if the token can't be found for any reason.
 */
tokenizedFile.prototype.getActiveTokenAt(row, column) {
	var curLine = this.lines[row]; // The current line of cursor
	var index = 0;
	for (var i = 0; i < line.length; i++) {
		// If the cursor is between two tokens, return the token before
		if (index + curLine.tokens[i].value.length == column) {
			return curLine.tokens[i];
		}
		// If the cursor is inside a token
		else if (index + curLine.tokens[i].value.length > column) {
			// If the token isnt the zero-th one
			if (i > 0) {
				// Return the token right before
				return curLine.tokens[i - 1];
			}
			// If the row isn't the zero-th one
			else if (row > 0) {
				// Return the last token of the previous line
				return this.lines[row - 1]
					.tokens[this.lines[row - 1].tokens.length - 1];
			}
		}
		index += curLine[i].value.length;
	}
	return null;
}