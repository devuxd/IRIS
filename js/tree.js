/**
*Build desicion tree model, and stores prediction for next tag/attribute/value.
*/


function id3tree(){
	var features = [];
	//console.log(training);
	console.log(document.sample);
	if (training.length > 0 && document.sample != {}){
		training = _(training);
		if (predict == PREDICT.ATTRIBUTE){
			predictAttr();
		} else if (predict == PREDICT.VALUE){
			predictValue();
		} else if (predict == PREDICT.TAG){
			predictTag();
		}
		console.log("PREDICTION " + prediction);
		document.complete = prediction;
	}
}


function predictTag(){
	features = ['parentTag', 'parentAttr/Val'];
	var tree = id3(training,'tag',features);
	prediction = predicts(tree, document.sample);
}

function predictAttr(){
	features = ['tag', 'parentTag', 'parentAttr/Val'];
	var tree = id3(training,'attr',features);
	prediction = predicts(tree, document.sample);
}

function predictValue(){
	features = ['tag', 'attr', 'parentTag', 'parentAttr/Val'];
	var tree = id3(training,'val',features);
	prediction = predicts(tree, document.sample);
}
