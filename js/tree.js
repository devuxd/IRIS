/**
*Build desicion tree model, and stores prediction for next element
* training: training set, array of the elements' features.
* 	->[{'tag':'div', 'attrKey':'class', 'parentTag':'div', 'parentAttr/Val':'class=home_banner', 'value':'sample_button'},...];
* samples: current element's features, used to predict the value of the class
*   ->{'tag':'h2', 'attrKey':'class', 'parentTag':'', 'parentAttr/Val':''};
*/


function id3tree(){
	var features = ['tag', 'attrKey', 'parentTag', 'parentAttr/Val'];
	var training = [];
	var samples = {};
	//TO DO: Create function that populates training set, and gets the current element from new tokenizer.
  
	training = _(training);
	if (training.length != 0){
		document.tree = id3(training,'value',features);
	}
	if ( typeof (document.tree) != "undefined" && typeof (samples) != "undefined"){
		predictions = predict(document.tree, samples);
		
	}
}
