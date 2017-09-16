
function attributeTokenization(){
	//This creates a list for the editors auto-complete.
	//The list contains all attribute=value of elements 
	//that the user has already written.
	if(typeof(document.elementTable)!="undefined"){
		document.attributeFreq = [];
		// document.elementFreq = [];
		for(let element of document.elementTable){
			if(typeof(document.elementTable.get(element)!="undefined")){
				for(let attributes of element[1][1])
					for(let attribute of attributes[1]){
						if(attribute[0]!=""){
							document.attributeFreq[attributes[0] + ' = "' + attribute[0]] = '" Freq: ' + attribute[1];
							// document.elementFreq [element[0].toLocaleLowerCase()] += " "+ attributes[0] + ' = "' + 
							// attribute[0] +'" Freq: ';
						}
					}
			}
		}
		console.log(document.attributeFreq);
		// console.log(document.elementFreq);
	}
}
