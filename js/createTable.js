/*
 * THESE TWO FUNCTIONS CREATE TWO MAPS:
 *		1 DOCUMENT.ELEMENTTABLE:
 *			CONTAINS THE TAG NAME AS A KEY
 *			AND AN ARRAY AS A VALUE.
 *			THE ARRAY CONTAINS THE FREQUENCY OF
 *			THE ELEMENT AND ANOTHER
 *			MAP CONTAINING AN ALL OF 
 *			THE ATTRIBUTES OF THE ELEMENT.
 *			ALL THE ATTRIBUTES ARE THE KEY
 *			AND THE VALUE IS ANOTHER MAP WITH
 *			THE VALUES OF THE ATTRIBUTES.
 *			THE VALUES OF THE ATTRIBUTES ARE THE
 *			KEY OF THE MAP AND THE FREQUENCY
 *			OF THE VALUES ARE THE MAP VALUE.
 *			TAG->ARRAY(TAG FREQUENCY, MAP(ATTR NAME->MAP(VALUE->FREQUENCY))))
 *		2 DOCUMENT.COMPLETEELEMENTTABLE:
 *			CONTAINS A MAP WITH ALL ELEMENTS
 *			WITH THEIR ATTRIBUTES AS A KEY
 *			AND THEIR FREQUENCY AS A VALUE.
*/
function createTable() {
	// Getting the body of the programmers html code.
	page.codePreviewBody.html(page.codeEditor.getValue());
	var elements = page.codePreviewBody.find("*");
	var query, attrValName, attrName, tagName;
	// Once the user starts writing an element, this
	// starts collecting elements.
	if (typeof (elements) != "undefined" && elements.length > 0) {
		// To update the table on every keyup.
		document.elementTable = new Map();
		document.completeElementTable = new Map();
		document.allAutoCompleteList = [];
		for (let element of elements) {
			tagName = element.tagName
				.replace(/'/g, "\\'")
				.replace(/;/g,"\\;")
				.replace(/:/g,"\\:")
				.replace(/&/g,"\\&")
				.replace(/@/g,"\\@")
				.replace(/!/g,"\\!")
				.replace(/#/g,"\\#")
				.replace(/%/g,"\\%")
				.replace(/"/g,"\\\"")
				.replace(/\\/g,"\\")
				.replace(/>/g,"\\>")
				.replace(/</g,"\\<")
				.replace(/\$/g,"\\$")
				.replace(/\=/g,"\\=")
				.replace(/,/g,"\\,")
				.replace(/\*/g,"\\*");
			if (typeof (element) && element.attributes.length > 0) {
				for (var i = 0; i < element.attributes.length; i++) {
					var attr = element.attributes[i];
					if (element.attributes[0].nodeName != "<") {
						createElementTable(tagName, attr);
					}
					if (attr.nodeValue != "") {
						if (attr.nodeValue == "title")
							attrValName = attr.nodeName;
						else // In case it contains multiple classes or special char.
							attrValName = attr.nodeValue.replace(/\s+(?=[^\s+])/g, ".").replace(/'/g, "\\'");
						attrName = attr.nodeName.replace(/:/g, '\\\:'); // In case we get : special char.

						document.completeElementTable.set(
							$("iframe#output").contents().find(tagName.toLowerCase() + "[" + attrName + "='" + attrValName.replace(".", " ") + "']")[0],
							$("iframe#output").contents().find(tagName.toLowerCase() + "[" + attrName + "='" + attrValName.replace(".", " ") + "']").length);
					}
				}
			}
			else {
				createElementTable(tagName, "undefined");
				var allSameTag = document.completeElementTable.get($("iframe#output").contents().find(tagName.toLowerCase()))
				if(typeof(allSameTag)!="undefined"){
					for(let elem of allSameTag)
						if(typeof(elem[0].attributes)=="undefined"){
							var freq = document.completeElementTable.get(element)+1;
							document.completeElementTable.set(element, freq);
						}
				}
				else {
					document.completeElementTable.set(element, 1);
				}
			}
		}
	}
}

/**
*Build desicion tree model, and stores prediction for next element
* training: training set, array of the elements' features.
* 	->[{'tag':'div', 'attrKey':'class', 'parentTag':'div', 'parentAttr/Val':'class=home_banner', 'value':'sample_button'},...];
* samples: current element's features, used to predict the value of the class
*   ->{'tag':'h2', 'attrKey':'class', 'parentTag':'', 'parentAttr/Val':''};
*/
var features = ['tag', 'attrKey', 'parentTag', 'parentAttr/Val'];
var training = [];
var sample = {};
//TO DO: Create function that populates training set, and gets the current element from new tokenizer.

training = _(training);
function id3tree(){
	if (training.length != 0){
		document.tree = id3(training,'value',features);
	}
	if ( typeof (document.tree) != "undefined" && typeof (samples) != "undefined"){
		predictions = predict(document.tree, samples);
	}
}

/**
 * Organizes each element in a table format to keep track of the frequency of
 * each element and their attributes.
 * @returns {void}
 */
function createElementTable(tag, attribute) {
	if (typeof (document.elementTable.get(tag)) == "undefined") { // Adding the tag
		document.elementTable.set(tag, [1, ""]);
	}
	else if (typeof (document.elementTable.get(tag)) != "undefined" && attribute == "undefined") {
		document.elementTable.set(tag, [$("iframe#output").contents().find(tag.toLowerCase()).length, document.elementTable.get(tag)[1]]);
	}
	if (attribute != "undefined") {
		if (document.elementTable.get(tag)[1] == "") { // Adding first attribute/value
			var attrType = new Map();
			var valueFreq = new Map();
			attrType.set(attribute.nodeName, valueFreq.set(attribute.nodeValue, 1));
			document.elementTable.set(tag, [page.codePreviewBody.find(tag).length, attrType]);
		}
		else if (typeof (document.elementTable.get(tag)[1].get(attribute.nodeName)) == "undefined") { // Adding new attributes/values
			var valueFreq = new Map();
			valueFreq.set(attribute.nodeValue, 1)
			document.elementTable.get(tag)[1].set(attribute.nodeName, valueFreq);
		}
		else if (typeof (document.elementTable.get(tag)[1].get(attribute.nodeName).get(attribute.nodeValue)) == "undefined") { // Adding new values
			document.elementTable.get(tag)[1].get(attribute.nodeName).set(attribute.nodeValue, 1);
		}
		else if (typeof (document.elementTable.get(tag)[1].get(attribute.nodeName).get(attribute.nodeValue)) != "undefined") { // Changing the attribute/value freq
			var attCount = document.elementTable.get(tag)[1].get(attribute.nodeName).get(attribute.nodeValue) + 1;
			document.elementTable.get(tag)[1].get(attribute.nodeName).set(attribute.nodeValue, attCount);
		}
	}
}
