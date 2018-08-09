/*
Builds an Abstract Syntax Tree by 'cleaning' the code
of the user's incomplete fragments, branding the fragment section,
parsing HTML --> JSON and removing whitespace.

@param {CodeFile} codeFile - An object that includes the editor code and cursor position
@returns {JSON} AST - The Abstract Syntax Tree
 */
function getAST(codeFile) {
	return removeWhitespace(himalaya.parse(clean(codeFile)));
}

function extractFeatures(syntaxTree) {
    //storage.sampleFeatures = {};
    for (let node of syntaxTree) extract(node, '', '', '');
}

function extract(node, parentTag, parentAttr, parentVal) {

    let parentAttrVal = parentAttr + '=' + parentVal;
    if (parentAttrVal === '=') parentAttrVal = '';
    
    if (node.type !== 'element') {
        if (node.content.includes('<>')) extractSample(parentTag, parentAttrVal);
        return;
    }

    let tag = node.tagName;
    let attr, val;

    if (node.attributes.length > 0) {
        for (let attribute of node.attributes) {
            attr = attribute.key;
            val = attribute.value;
            val = val === null ? '' : val;
            addTraining(tag, parentTag, parentAttrVal, attr, val);
            for (let child of node.children) extract(child, tag, attr, val);
        }
    } else {
        attr = '';
        val = '';
        addTraining(tag, parentTag, parentAttrVal, attr, val);
        for (let child of node.children) extract(child, tag, attr, val);
    }

}

function addTraining(tag, parentTag, parentAttrVal, attr, val) {
    if (['!doctype','html','head','body'].includes(tag)) return;
    let entry;
	switch (storage.predictionCase) {
        case PREDICTION_CASE.TAG:
			entry = {'parentTag':parentTag, 'parentAttr/Val':parentAttrVal, 'tag':tag};
            break;
        case PREDICTION_CASE.ATTRIBUTE:
			entry = {'tag':tag, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal, 'attr':attr};
            break;
        case PREDICTION_CASE.VALUE:
			entry = {'tag':tag, 'attr':attr, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal, 'val':val};
            break;
    }
	if (entry !== undefined && !contains(entry, storage.dontUse)){
		storage.trainingTable.push(entry);
	}
}

function isEqual(entry1, entry2){
	var a = Object.getOwnPropertyNames(entry1);
    var b = Object.getOwnPropertyNames(entry2);
    if (a.length !== b.length) {
        return false;
    }
    for (var i = 0; i < a.length; i++) {
        var name = a[i];
        if (entry1[name] !== entry2[name]) {
            return false;
        }
    }
	return true;
}

function contains(x, list){
	for (var i = 0; i < list.length; i++ ){
		if (isEqual(x, list[i])){
			return true;
		}
	}
	return false;
}

function clean(codeFile) {
    let lines = codeFile.code.split("\n");
    let text = lines[codeFile.position.row];
	let newText;
	if (storage.justTable === true){
		newText = text.substring(0, codeFile.fragmentStart) + text.substring(codeFile.position.column);   // without < to cursor
	} else{
		newText = text.substring(0, codeFile.fragmentStart) + '<>' + text.substring(codeFile.position.column);   // without < to cursor
    }
	storage.fragment = text.substring(codeFile.fragmentStart+1, codeFile.position.column);
    lines[codeFile.position.row] = newText;
    return lines.join("\n");
}

/*
Retrieves/stores the input features for the DT, necessary to make a prediction.
@param parentTag The tag of the parent node of the element being typed
@param parentAttrVal The attribute/value pair of the parent node of the element being typed
 */

function extractSample(parentTag, parentAttrVal) {

    let sampleFeatures;

    if (storage.predictionCase === PREDICTION_CASE.ATTRIBUTE) {

        let tag = storage.fragment.split(" ")[0].trim();
        sampleFeatures = {'tag': tag, 'parentTag': parentTag, 'parentAttr/Val': parentAttrVal};

    } else if (storage.predictionCase === PREDICTION_CASE.VALUE) {
        let tag = storage.fragment.split(" ")[0].trim();

        // Tokenizer - runs backwards from = until it hits text and then space
        let indexAssign = storage.fragment.lastIndexOf("=");
        let run = true;
        let i = indexAssign;
        let state = "assign"
        while (run && --i >= 0) {
            let chr = storage.fragment.substring(i,i+1);
            if (chr.match(/[A-z]/)) {
                state = "text";
            } else if (chr === " ") {
                if (state === "text") {
                    run = false;
                }
            }
        }

        let attr = storage.fragment.substring(++i, indexAssign).trim();

        sampleFeatures = {'tag': tag, 'attr': attr, 'parentTag': parentTag, 'parentAttr/Val': parentAttrVal};

    } else if (storage.predictionCase === PREDICTION_CASE.TAG) {

        sampleFeatures = {'parentTag': parentTag, 'parentAttr/Val': parentAttrVal};
    }

    // If we already have some sample features, that means there's multiple parentAttr/Val pairs
    if (_.isEmpty(storage.sampleFeatures)) {
        storage.sampleFeatures = sampleFeatures;
    } else {
        let exists = false;
        for (let s of storage.sampleFeaturesExtra) {
            if (_.isEqual(sampleFeatures, s)) {
                exists = true;
            }
        }
        if (!exists) storage.sampleFeaturesExtra.push(sampleFeatures);
    }

}
