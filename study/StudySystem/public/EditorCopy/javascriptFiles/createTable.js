function createTable(){
	//Getting the body of the programmers html code.
    document.body_.html(document.editor.getValue());	
	var elements = document.body_.find("*");
	var query, attrValName, attrName;
	//Once the user starts writing an element, this
	//starts collecting elements.
	if(typeof(elements)!="undefined" && elements.length>0){
		//To update the table on every keyup.
		document.elementTable = new Map();
		document.completeElementTable = new Map();
		for(let element of elements){
			if(typeof(element) && element.attributes.length>0){
				// for(let attr of element.attributes){  			 Changed these lines here
				   for(var i=0; i<element.attributes.length; i++){// becauese jsdom does not 
				   		var attr = element.attributes[i];         // have an iterator for children.
						if(element.attributes[0].nodeName!="<"){
							//In case it contains special char.
							var tempTag = element.tagName.replace(/'/g,"\\'")
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

							createElementTable(tempTag, attr);
						}
						if(attr.nodeValue!=""){
							if(attr.nodeValue=="title")
								attrValName = attr.nodeName;
							else//In case it contains multiple classes or special char.
								attrValName = attr.nodeValue.replace(/\s+(?=[^\s+])/g,".")
															.replace(/'/g,"\\'")
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
															.replace(/\=/g,"\\=")
															.replace(/\$/g,"\\$")
															.replace(/,/g,"\\,")
															.replace(/\*/g,"\\*");
							attrName = attr.nodeName.replace(/:/g,'\\\:');//In case we get : special char.

							document.completeElementTable.set(
								$("iframe#output").contents().find(tempTag.toLowerCase()+"["+attrName+"='"+attrValName+"']")[0],
									$("iframe#output").contents().find(tempTag.toLowerCase()+"["+attrName+"='"+attrValName+"']").length);
						}
				}
			}else{
				createElementTable(element.tagName, "undefined");
				var allSameTag = document.completeElementTable.get($("iframe#output").contents().find(element.nodeName.toLowerCase()))
				if(typeof(allSameTag)!="undefined"){
					for(let elem of allSameTag)
						if(typeof(elem[0].attributes)=="undefined"){
							var freq = document.completeElementTable.get(element)+1;
							document.completeElementTable.set(element, freq);
						}
				}
				else
					document.completeElementTable.set(element, 1);
				
			}
		}
	}
}

//Organizes each element in a table format to keep
//track of the frequency of each element and thier attributes.
function createElementTable(tag, attribute){
	if(typeof(document.elementTable.get(tag))=="undefined"){//Adding the tag
		document.elementTable.set(tag,[1,""]);
	}
	else if(typeof(document.elementTable.get(tag))!="undefined" && attribute=="undefined"){
		document.elementTable.set(tag,[$("iframe#output").contents().find(tag.toLowerCase()).length,document.elementTable.get(tag)[1]]);
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
}