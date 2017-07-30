
function attributeTokenization(){

    var tag, attributes, element;
	var element_string = [""];
	var timer;
    
    //Getting the current line the programmer is working on from Ace editor.
    document.body_.html(document.editor.getValue());	
	document.currline = document.editor.getSelectionRange().start.row;
	var wholelinetxt = document.editor.session.getLine(document.currline);
	document.html = $.parseHTML(wholelinetxt);

    //Getting the information the programmer has written in the current line.
	for(var entry in document.html){
		if(document.html[entry].nodeType==1){	
		 	tag = document.html[entry].nodeName.toLowerCase();

			 	 element = document.html[entry];
				 attributes = document.html[entry].attributes;

				 //This returns if the user did a keyup, but did not actaully wrote something.
				 if(document.lastelement && document.lastelement.isEqualNode(element) &&
				 	 document.lastLine && document.lastLine==document.currline)
				 	return;
		
				 //The function findingSameAttributes, will only be called if
				 //the element has attributes.
				 if(attributes.length>0){
				 	findingSameAttributes(element);	
				 	document.lastLine = document.currline;
					document.lastAttribute = attributes;
					
					//To save info of the last state of the editor
					//everytime there is a keyup.
					document.lastLine = document.currline;
					document.lastelement = element;
				 }
				 else
				 	document.isGroupTag;
  			}
	  	}
	 		
	function findingSameAttributes(element){
		var foundValue = false, foundPattern = false;

		for(var entry=0; entry<attributes.length; entry++){
			if(attributes && attributes[entry] && attributes[entry].nodeValue!=""){
				if(entry==0)
					element_string[0] +=" <"+tag;

				element_string[0] +=  " "+attributes[entry].nodeName +"='"+attributes[entry].nodeValue+"'";
				
				//This add the element to an array, if the programmer is working on the same
				//element's attributes, this will keep adding to that element until the
				//user finishes writing it. 
				if(Object.keys(document.frequencyarray).length==0)//First line of code written
					document.frequencyarray[element_string[0]+"></"+tag+">"] = {"line":document.currline,"freq":1};
				else {
					var keys = Object.keys(document.frequencyarray);
					//Checks the array to see if the current element the programmer is working
					//is already on the list, by looking for the element and the current line.
					for (var i=0; i<keys.length; i++) {
						if(document.frequencyarray[keys[i]].line==document.currline){
							delete document.frequencyarray[keys[i]];
						}
					}
					var freqnum  = 1;
					if(typeof(document.frequencyarray[element_string[0]+"></"+tag+">"]) != "undefined")
						freqnum = (document.frequencyarray[element_string[0]+"></"+tag+">"].freq+1);
					document.frequencyarray[element_string[0]+"></"+tag+">"] = {"line":document.currline,"freq":freqnum};
				}
			}
		}
			
	}
}

 