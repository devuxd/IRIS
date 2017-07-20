$(document).ready(function() {

  //Using ace to get the editor.	
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/html");

  $("#submitButton").click(function() {
    algorithm(editor.getValue());
  });

  //This shows the html body code on the iframe.
  //This saves the content of the html doc that is going to be created on an iframe. 
  var frame = $('#output'),
    contents = frame.contents(),
    body = contents.find('body'),
    styleTag = contents.find('head')
    .append('<style></style>')//For CSS code.
    .children('style');

  //This outputs the text editor content everytime something is written.
  editor.on('focus', function(event, editors) {
	    $(this).keyup(function() {

	    body.html(editor.getValue());
		var allWithSameTag = [], allWithSameClass;
		var isSameAttributes = false;
		var allWithSameTag_frequency = 0, allWithSameTag_attr = [];

	    //Getting the current line the programmer is working on from Ace editor.	
		var currline = editor.getSelectionRange().start.row;
		var wholelinetxt = editor.session.getLine(currline);
		var html = $.parseHTML(wholelinetxt);
	    var tag, attributes, class_;

	    //Getting tag attributes and class name of the last element the programmer wrote.
	    //Assuming that programmer writes only one element at each line.
		for(var entry in html){
			if(html[entry].nodeType==1){
			 tag = html[entry].nodeName;
				 if(html[entry].attributes){
					 attributes = html[entry].attributes;
					 class_ = html[entry].className;
				}
			}		
		}

		var sameTag = body.find(tag);
		//Find all same elements with same attributes
		for(var entry = 0; entry<sameTag.length; entry++){
			if(sameTag[entry].attributes && attributes && sameTag[entry].attributes.length==attributes.length){
				for(var entry_attr = 0; entry_attr<sameTag[entry].attributes.length; entry_attr++){
					//Adds tags and attributes to a list if they are the same, it contains a different attribute
					//it does not add the the list allWithSameTag_attr.
					if( sameTag[entry].attributes[entry_attr] && sameTag[entry].attributes[entry_attr].isEqualNode(attributes[entry_attr])){
						if(entry_attr==0){
							allWithSameTag.push("<br><b>Tag: </b>" + sameTag[entry].tagName);
						}
						allWithSameTag.push(" <b>Attribute name: </b>"+attributes[entry_attr].name+
							" <b>Attribute value: </b>"+attributes[entry_attr].value);
						isSameAttributes = true;
					}else{
						isSameAttributes = false;
					}
				}
				if(isSameAttributes){
					for(var verified = 0; verified<allWithSameTag.length; verified++){
						allWithSameTag_attr.push(allWithSameTag[verified]);
					}
					allWithSameTag_attr[0] = allWithSameTag_attr[0].replace("<br>","");
					allWithSameTag_frequency+=1;
				}
			}
			allWithSameTag = [];
    	}
		
		//Looking for all the elements in the body to find the ones 
		//that are the same as the last one the programme wrote.
		var buckets = $('#buckets');
		buckets.empty();

		allWithSameClass = body.find("[class='"+class_+"']");

		//All with same tag and attributes.
		if(isSameAttributes || allWithSameTag_attr.length>0){
			buckets.append("<p><u><b>All same element with same attributes:</b></u><br> Frequency: "+ 
				allWithSameTag_frequency+"</p>");
			buckets.append(allWithSameTag_attr);
		}

		//All with same class.
		if(class_ && allWithSameClass.length>1){
			buckets.append("<p><b><u>All elements with same class:</b></u><br> Frequency: "+
			 allWithSameClass.length+"</p>");
			for(var entry = 0; entry<allWithSameClass.length; entry++){
				buckets.append("<b>Tag:</b> " +allWithSameClass[entry].tagName +" |  <b>Class:</b> "
					+allWithSameClass[entry].getAttribute('class')+"<br>");
			}
		}
    });
  })();
});