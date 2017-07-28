
function attributeTokenization(){
    document.body_.html(document.editor.getValue());

    //Getting the current line the programmer is working on from Ace editor.	
	document.currline = document.editor.getSelectionRange().start.row;
	var wholelinetxt = document.editor.session.getLine(document.currline);
	document.html = $.parseHTML(wholelinetxt);
    var tag, attributes, element;
	var element_string = [""];
	var timer;

    //Getting the information the programmer has written in the current line.
	for(var entry in document.html){
		if(document.html[entry].nodeType==1){	
		 	tag = document.html[entry].nodeName.toLowerCase();
			if(document.html[entry].attributes){
			 	 element = document.html[entry];
				 attributes = document.html[entry].attributes;

				 //This returns if the user did a keyup, but did not actaully wrote something.
				 if(document.lastelement && document.lastelement.isEqualNode(element) &&
				 	 document.lastLine && document.lastLine==document.currline)
				 	return;
				 document.frequencyarray = [];

				 //The function findingSameAttributes, will only be called if
				 //the element has attributes.
				 if(attributes.length>0){
				 	findingSameAttributes(element);	
				 	document.lastLine = document.currline;
					if(attributes)
						document.lastAttribute = attributes;
					
					//When attributs and values have been found, this will
					//make a list of the element as key and frequency as values.
					var keys = Object.keys(document.newArray);
					for(var entry=0; entry<Object.keys(document.newArray).length; entry++){
						document.frequencyarray[keys[entry]] =  document.newArray[keys[entry]].freq
					}
					//To save info of the last state of the editor
					//everytime there is a keyup.
					document.lastLine = document.currline;
					document.lastelement = element;
					console.log(document.frequencyarray);
				 }
				 else
				 	document.isGroupTag;
  			}
	  	}
	 }		
	function findingSameAttributes(element){
		var foundValue = false, foundPattern = false;
		for(var entry=0; entry<attributes.length; entry++){
			if(attributes && attributes[entry] && attributes[entry].nodeValue!=""){
				if(entry==0)element_string[0]+=" <"+tag+" ";
				element_string[0]+=  attributes[entry].nodeName +"="+attributes[entry].nodeValue;
				
				//This add the element to an array, if the programmer is working on the same
				//element's attributes, this will keep adding to that element until the
				//user finishes writing it. 
				if(Object.keys(document.newArray).length==0)//First line of code written
					document.newArray[element_string[0]+">"] = {"line":document.currline,"freq":1};
				else {
					var keys = Object.keys(document.newArray);
					//Checks the array to see if the current element the programmer is working
					//is already on the list, by looking for the element and the current line.
					for (var i=0; i<keys.length; i++) {
						if((element_string[0].startsWith(keys[i].replace(">",""))
							&& document.newArray[keys[i]].line==document.currline)){
							delete document.newArray[keys[i]];
						}
					}
					var freqnum  = 1;
					if(typeof(document.newArray[element_string[0]+">"]) != "undefined")
						freqnum = (document.newArray[element_string[0]+">"].freq+1);
					document.newArray[element_string[0]+">"] = {"line":document.currline,"freq":freqnum};
				}
			}
		}
			
	}
}

 