/**
 *	Creates an array for the editor's auto-complete. The array contains all of
 *	the elements that the user has already written in attribute=value format.
 *	@returns {array} The list of all of the attribute=value pairs
 */
function attributeTokenization() {

	// TODO: Break up these nested conditionals and loops!
	if (typeof (document.elementTable) != "undefined") {
		document.list = [];
		if (document.elementTable.size > 0) {
			for (let element of document.elementTable.values()) {
				if (element[1] != "" && element[1][1] != "") {
					for (let attributes of element[1]) {
						for (let attribute of attributes[1]) {
							if (attribute[0] != "") {
								var values = attribute[0].split(" ");
								if (values.length > 1) // In case we have multiple values
									for (var value of values) {
										if (typeof (document.list[attributes[0] + ' = "' + value.trim() + '"']) == "undefined")
											document.list[attributes[0] + ' = "' + value.trim() + '"'] = attribute[1];
										else
											document.list[attributes[0] + ' = "' + value.trim() + '"'] =
												document.list[attributes[0] + ' = "' + value.trim() + '"'] + attribute[1];
									}

								if (typeof (document.list[attributes[0] + ' = "' + attribute[0].trim() + '"']) == "undefined")
									document.list[attributes[0] + ' = "' + attribute[0].trim() + '"'] = attribute[1];
								else
									document.list[attributes[0] + ' = "' + attribute[0].trim() + '"'] =
										document.list[attributes[0] + ' = "' + attribute[0].trim() + '"'] + attribute[1];
							}
						}
					}
				}
			}
		}
		document.allAutoCompleteList = [];
		for (var attr in document.list)
			document.allAutoCompleteList[attr] = " Freq: " + document.list[attr];
		console.log(document.allAutoCompleteList);
		elementTokenization();
	}
}