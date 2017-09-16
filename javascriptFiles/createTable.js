function createTable(){
	//Getting the body of the programmers html code.
    document.body_.html(document.editor.getValue());	
	var elements = document.body_.find("*");
	var query;
	//Once the user starts writing an element, this
	//starts collecting elements.
	if(typeof(elements)!="undefined" && elements.length>0){
		//To update the table on every keyup.
		document.elementTable = new Map();
		for(let element of elements){
			if(typeof(element) && element.attributes.length>0){
				for(let attr of element.attributes){
					createMap(element.tagName, attr);
				}
			}else
				createMap(element.tagName, "undefined");
		}
	}
}

//Organizes each element in a table format to keep
//track of the frequency of each element and thier attributes.
function createMap(tag, attribute){
	if(typeof(document.elementTable.get(tag))=="undefined"){//Adding the tag
		document.elementTable.set(tag,[1,""]);
	}
	else if(typeof(document.elementTable.get(tag))!="undefined" && attribute=="undefined"){
		var tagFreq = document.elementTable.get(tag)[0]+1;
		document.elementTable.set(tag,[tagFreq,""]);
	}
 	if(attribute!="undefined"){
		if(document.elementTable.get(tag)[1]==""){//Adding first attribute/value
			var attrType = new Map();
			var valueFreq = new Map();
			attrType.set(attribute.nodeName, valueFreq.set(attribute.nodeValue, 1));
			document.elementTable.set(tag,[document.body_.find(tag).length, attrType]);
		}
		else if(typeof(document.elementTable.get(tag)[1].get(attribute.nodeName))=="undefined"){//Adding new attributes/values
			var valueFreq = new Map();
			valueFreq.set(attribute.nodeValue,1)
			document.elementTable.get(tag)[1].set(attribute.nodeName, valueFreq);
		}
		else if(typeof(document.elementTable.get(tag)[1].get(attribute.nodeName).get(attribute.nodeValue))=="undefined"){//Adding new values
			document.elementTable.get(tag)[1].get(attribute.nodeName).set(attribute.nodeValue,1);
		}
		else if(typeof(document.elementTable.get(tag)[1].get(attribute.nodeName).get(attribute.nodeValue))!="undefined"){//Changing the attribute/value freq
			var attCount = document.elementTable.get(tag)[1].get(attribute.nodeName).get(attribute.nodeValue)+1;
			document.elementTable.get(tag)[1].get(attribute.nodeName).set(attribute.nodeValue, attCount);
		}
	}
	console.log(document.elementTable);
}
	
