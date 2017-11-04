
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
								document.allAutoCompleteList[attributes[0] + ' = "' + attribute[0].trim()+'"'] = ' Freq: ' + attribute[1];
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

