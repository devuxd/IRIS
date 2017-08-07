
function attributeTokenization(){

    var tag, attributes, element;
	var element_string = [""];//Array of element string.
	var attr_string = [""];//Array of attribute=value string.
	var attr_type_string = [""];//Array of attribute types.
	var attr_value_string = [""];//Array of attribute values.
	var timer;
    
    //Getting the current line the programmer is working on from Ace editor.
    document.body_.html(document.editor.getValue());	
	document.currline = document.editor.getSelectionRange().start.row;
	var wholelinetxt = document.editor.session.getLine(document.currline);
	if(!wholelinetxt.includes(">"))
		wholelinetxt += ">"
	document.html = $.parseHTML(wholelinetxt);

    //Getting the information the programmer has written in the current line.
	for(var entry in document.html){
		if(document.html[entry].nodeType==1){	
		 	tag = document.html[entry].nodeName.toLowerCase();
		 	if(tag!="undefined")
		 		document.isAttributeType = true;

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
					//every time there is a keyup.
					document.lastLine = document.currline;
					document.lastelement = element;
				 }
  			}
	  	}

	 function updateLine(array, type, stringlist, entry){
	 	var nameOrVal;
	 	if(Object.keys(array).length==0){//First line of code written
			if(type==1)
				array[stringlist[0]+"></"+tag+">"] = {"line":document.currline,"freq":1};
			else
				array[stringlist[entry]] = {"line":document.currline,"freq":1};
		}else{
			//Checks the array to see if the token the programmer is working
			//is already on the list, by looking for the token string on the
			// object, which has the current line information.
			var keys = Object.keys(array);
			var keyIndex = 0;
			for (var i in array) {
				if(type==1)//type element
					nameOrVal = keys[keyIndex].includes(attributes[entry].nodeName) || 
						attributes[entry].nodeValue.startsWith(keys[keyIndex].replace(" ",""));
				else if(type==2)//type attr type
					nameOrVal = keys[keyIndex].includes(attributes[entry].nodeName) 
				else if(type==3)//type attr value
					nameOrVal = attributes[entry].nodeValue.startsWith(keys[keyIndex].replace(" ",""));
				
				//Makes sure we only delete the attribute with current value or name accordingly. 
				if(array[i].line==document.currline && nameOrVal){
					delete array[i];
				}
				keyIndex++;
			}
		}
	 }
	 		
	function findingSameAttributes(element){
		var foundValue = false, foundPattern = false;

		for(var entry=0; entry<attributes.length; entry++){
			if(attributes && attributes[entry] && attributes[entry].nodeValue!=""){
			 	document.isAttributeType = false;
			 	document.isAttributeVal = true;

				if(entry==0)//Need to add the tag to the element string.
					element_string[0] +=" <"+tag;

				//Adding element as a string to a list.
				attr_string[entry] = " "+attributes[entry].nodeName+"="+"'"+attributes[entry].nodeValue+"'";//Individual attributes
				element_string[0] +=  " "+attributes[entry].nodeName +"='"+attributes[entry].nodeValue+"'";//All attributes
				attr_type_string[entry] = " "+attributes[entry].nodeName;//Attribute type
				attr_value_string[entry] = attributes[entry].nodeValue;//Attribute value

				//These add the string type butckets to an array, if the programmer is working on the same
				//line attributes, this will keep updating that bucket by deleting the previous.
				//Fro element type
				updateLine(document.frequencyarray, 1, element_string,entry);
				//For attr type
				updateLine(document.attr_type_obj, 2, attr_type_string, entry);
				//For attr value type
				updateLine(document.attr_value_obj, 3, attr_value_string, entry);

				//This adds the new value
				var freqnum  = 1;
				//Adds value frequency to the object of element string.
				if(typeof(document.frequencyarray[element_string[0]+"></"+tag+">"]) != "undefined")
					freqnum = (document.frequencyarray[element_string[0]+"></"+tag+">"].freq+1);
				document.frequencyarray[element_string[0]+"></"+tag+">"] = {"line":document.currline,"freq":freqnum};
				freqnum  = 1;
				if(typeof(document.attr_type_obj [attr_type_string[entry]]) != "undefined")
					freqnum = (document.attr_type_obj [attr_type_string[entry]].freq+1);
				document.attr_type_obj[attr_type_string[entry]] = {"line":document.currline,"freq":freqnum};
				freqnum  = 1;
				if(typeof(document.attr_value_obj[attr_value_string[entry]]) != "undefined")
					freqnum = (document.attr_value_obj[attr_value_string[entry]].freq+1);
				document.attr_value_obj[attr_value_string[entry]] = {"line":document.currline,"freq":freqnum};
			}
		}		
	}
}