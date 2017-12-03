function associationRule(){
	//Getting the body of the programmers html code.
    document.body_.html(document.editor.getValue());	
	var elements = document.body_.find("*");
	var support, total = elements.length;
	const minsup = 0.5;
	var frequent = [];
	var elementList = [];
	for(var element of elements)
		elementList.push(element.tagName);

	hierarchySearch(elementList, support, total, minsup, frequent, 1)
}

function hierarchySearch(elementList, support, total, minsup, frequent, nth){
	var hierachy, current = 0, ith = 0, path = [];
	for(var element of elementList){
		hierachy = element.split(" ");
		if(hierachy.length>1)
			console.log("More child")

		support = $("iframe#output").contents().find(element).length/total;
		if(support>=minsup){
			frequent.push(element);
		}
	}
	elementList = [];
		ith++;
	for(var freq of frequent){
		var temp = ithPath($("iframe#output").contents().find(freq), current, ith, path);
		elementList.push(temp);
	}
}

function ithPath(element, current, ith, path){
	if(current==ith) return;
	path.push(element.tagName);
	ithPath(element.firstChild, current++, ith, path);
}