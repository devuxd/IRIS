/* THIS CREATES A LIST FOR THE EDITORS AUTO-COMPLETE.
 * THE LIST CONTAINS ALL ATTRIBUTE=VALUE OF ELEMENTS
 * THAT THE USER HAS ALREADY WRITTEN.
 */
function attributeTokenization() {
	if(typeof(document.elementTable)!= "undefined") {
		document.list = [];
		if (document.elementTable.size > 0) {
			for (let element of document.elementTable.values()) {
				if(element[1] != "" && element[1][1] != "") {
					for(let attributes of element[1]) {
						for(let attribute of attributes[1]) {
							if(attribute[0] != "") {
								var values = attribute[0].split(" ");
								if(values.length > 1)//In case we have multiple values
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