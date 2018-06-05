/**
 * Adds to the editor's auto-complete list. Adds each tag with all of their
 * attributes separated. This goes through the document.completeElementTable and
 * collects each element and their frequency before adding them to the list.
 * @return {void}
 */
function elementTokenization() {
	if (typeof (document.completeElementTable) != "undefined") {
		for (let element of document.completeElementTable) {
			if (typeof (element) != "undefined" && typeof (element[0]) != "undefined" && element[0].attributes.length != 0) {
				if (element[0].attributes.length > 1) {
					var strAttr = "";
					for (var attribute = 0; attribute < element[0].attributes.length; attribute++) {
						document.allAutoCompleteList["<" + element[0].nodeName.toLowerCase() + " " +
							element[0].attributes[attribute].nodeName + ' = "' +
							element[0].attributes[attribute].nodeValue + '"'] =
							' Freq: ' + document.completeElementTable.get(element[0]);

						if (attribute == 0)
							strAttr += element[0].attributes[attribute].nodeName + ' = "' +
								element[0].attributes[attribute].nodeValue + '"' + "";
						else
							strAttr += " " + element[0].attributes[attribute].nodeName + ' = "' +
								element[0].attributes[attribute].nodeValue + '"' + "";
					}
					if (element[0].attributes.length > 1) {
						document.allAutoCompleteList["<" + element[0].nodeName.toLowerCase() + " " +
							strAttr] = ' Freq: ' + document.completeElementTable.get(element[0]);
					}
				} else
					document.allAutoCompleteList["<" + element[0].nodeName.toLowerCase()] = ' Freq: ' + document.completeElementTable.get(element[0]);
			}
		}
	}
}