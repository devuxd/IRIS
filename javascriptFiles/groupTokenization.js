

function groupTokenization(){
	var lastLine;
    var lastChild = document.body_[0];
	var tagPath = [""];
     
	if(!lastLine)lastLine=document.currline;


	//Finds the last child the programmer has written and 
	//saves the path from body to that child to compare
	//path to find patterns.
	for(var entry in document.html){//To make sure the user is on a line  
		var tabcounter = 0;
		if(document.html[entry].nodeType==1){//containing html tags.
			while(lastChild.childElementCount>0){//While current has child
				lastChild = lastChild.lastElementChild;
				tabcounter++;
				tagPath[0] += " <"+lastChild.nodeName.toLowerCase()+"> \n"+indent(tabcounter);//Add tag to path.
				console.log(lastChild);
			}
			console.log(tagPath[0]);
			//Adding closing tags to path of string.
			var tagPathclosingtags = tagPath[0].split(' ');
			for(var i=tagPathclosingtags.length-1; i>0; i--){
				tagPath[0]+= tagPathclosingtags[i].replace("<", indent(tabcounter)+"</");
				if(tagPathclosingtags[i].includes("<")){
					tabcounter--;
				}
			}
			//Make sure we don't get duplicates by making sure we are not looking at
			//the same line as the last the user worked on having the same path.
			if(document.groupPaths.length==0 || 
				(lastLine!=document.currline || document.groupPaths[document.groupPaths.length-1]!=tagPath[0])){
				document.groupPaths.push(tagPath[0]);//push string path to a global list.
				mode(document.groupPaths);
			}
		}
	}
	lastLine = document.currline;
	//To add indentation to the autocomplete.
	function indent(x) {
	    var spaces = '';
	    while(x--){ 
	    	spaces += ' ';
	    }
	    return spaces;
	}

	//To find the frecuency of each group of elements.
	function mode(array){
		for(var i = 0; i<array.length; i++){
		    if (!document.frecuencyarray[array[i]]) 
		    	document.frecuencyarray[array[i]] = 0;
		    document.frecuencyarray[array[i]] += 1
		}
		console.log(document.frecuencyarray);
	}

}
