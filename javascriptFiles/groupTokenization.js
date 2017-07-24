

function groupTokenization(body, groupPaths, html, currline, langTools, groupBuckets){
	var lastChild = body[0];
	var tagPath = [""];//["<"+lastChild.nodeName+">"];
	var lastLine;

	if(!lastLine)lastLine=currline;


	//Finds the last child the programmer has written and 
	//saves the path from body to that child to compare
	//path to find patterns.
	for(var entry in html){//To make sure the user is on a line  
		var tabcounter = 0;
		if(html[entry].nodeType==1){//containing html tags.
			while(lastChild.childElementCount>0){//While current has child
				lastChild = lastChild.lastElementChild;
				tabcounter++;
				tagPath[0] += " <"+lastChild.nodeName+"> \n"+indent(tabcounter);//Add tag to path.
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
			if(groupPaths.length==0 || 
				(lastLine!=currline || groupPaths[groupPaths.length-1]!=tagPath[0])){
				groupPaths.push(tagPath[0]);//push string path to a global list.
				var count = 0;
				groupPaths.forEach(function(x) {
					if(x==groupPaths[groupPaths.length-1]){
						count++;
					}
				});
				console.log(groupPaths);
				groupBuckets.append("<p><pre><xmp>"+groupPaths[groupPaths.length-1]+"</xmp></pre>" + "frecuency: "+ count+"</p>");
				mode(groupPaths);
			}
		}
	}
	lastLine = currline;
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
		frecuencyarray = [];
		counter = 0
		for(var i = 0; i<array.length; i++){
		    if (!frecuencyarray[array[i]]) frecuencyarray[array[i]] = 0;
		    frecuencyarray[array[i]] += 1
		}
		console.log(frecuencyarray);
	}

	//Custom autocomplete.
	var staticWordCompleter = {//Custom autocoplete.
    getCompletions: function(editor, session, pos, prefix, callback) {
    	frecuencyarray.sort('value');
    	var sortedarray = Object.keys(frecuencyarray);
        callback(null, sortedarray.map(function(word) {
        	var removedSpaces = word.replace(/ |\n /g, "");
            return {
                caption: removedSpaces,
                value: word,
                meta: "static"
            };
        }));

	    }
	}

	langTools.setCompleters([staticWordCompleter]);
}
