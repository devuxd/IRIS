
function attributeTokenization(){
	//This creates a list for the editors auto-complete.
	//The list contains all attribute=value of elements 
	//that the user has already written.
	if(typeof(document.elementTable)!="undefined"){
		document.allAutoCompleteList = [];
		if(document.elementTable.size>0){
			for(let element of document.elementTable.values()){
				if(element[1]!=""&&element[1][1]!="") {
					for(let attributes of element[1]){
						for(let attribute of attributes[1]){
							if(attribute[0]!=""){
								document.allAutoCompleteList[attributes[0] + ' = "' + attribute[0]+'"'] = ' Freq: ' + attribute[1];
							}
						}
					}
				}
			}
		}
		console.log(document.allAutoCompleteList);
		elementTokenization();
	}
}
function elementTokenization(){
	if(typeof(document.completeElementTable)!="undefined"){
		//This adds to the editros auto-complete list.
		//It adds values of complete elements that the 
		// user has already written.
		for(let element of document.completeElementTable){ 
			if(typeof(element)!="undefined" && element[0].attributes.length!=0){
				for(var attribute=0; attribute<element[0].attributes.length; attribute++){
					document.allAutoCompleteList["<"+element[0].nodeName.toLowerCase() +" "+ 
						element[0].attributes[attribute].nodeName+' = "'+ 
						element[0].attributes[attribute].nodeValue+'"'] =
						' Freq: ' +document.completeElementTable.get(element[0]);
				}
			}else if(typeof(element)!="undefined")
				document.allAutoCompleteList["<"+element[0].nodeName.toLowerCase()] = ' Freq: '+ document.completeElementTable.get(element[0]);
		}
		console.log("All auto Complete list");
		console.log(document.allAutoCompleteList);
	}
	groupTokenization();
}
