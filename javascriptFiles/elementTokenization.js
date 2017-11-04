
function elementTokenization(){
	if(typeof(document.completeElementTable)!="undefined"){
		//This adds to the editros auto-complete list.
		//It adds values of complete elements that the 
		// user has already written.
		for(let element of document.completeElementTable){ 
			if(typeof(element)!="undefined" && typeof(element[0])!="undefined" && element[0].attributes.length!=0){
				for(var attribute=0; attribute<element[0].attributes.length; attribute++){
					document.allAutoCompleteList["<"+element[0].nodeName.toLowerCase() +" "+ 
						element[0].attributes[attribute].nodeName+' = "'+ 
						element[0].attributes[attribute].nodeValue+'"'] =
						' Freq: ' +document.completeElementTable.get(element[0]);
				}
			}else if(typeof(element)!="undefined" && typeof(element[0])!="undefined")
				document.allAutoCompleteList["<"+element[0].nodeName.toLowerCase()] = ' Freq: '+ document.completeElementTable.get(element[0]);
		}
		console.log("All auto Complete list");
		console.log(document.allAutoCompleteList);
	}
	groupTokenization();
}