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
    for (let node of syntaxTree) {
        extract(node, '', '', '');
    }
}

function extract(node, parentTag, parentAttr, parentVal) {
    
    if (node.type === 'text') {
        if (node.content.includes('<>')) extractSample(parentTag, parentAttr, parentVal);
        return;
    }

    let tag = node.tagName;
    let parentAttrVal = parentAttr + '=' + parentVal;
    if (parentAttrVal === '=') parentAttrVal = '';
    let attr = (node.attributes.length > 0) ? node.attributes[0].key : '';
    let val = (node.attributes.length > 0) ? node.attributes[0].value : '';   // TODO : Empty attribute fix

    if (storage.predictionCase === PREDICTION_CASE.TAG) {
        storage.trainingTable.push({'tag':tag, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal});
    } else if (storage.predictionCase === PREDICTION_CASE.ATTRIBUTE) {
        storage.trainingTable.push({'tag':tag, 'attr':attr, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal});
    } else if (storage.predictionCase === PREDICTION_CASE.VALUE) {
        storage.trainingTable.push({'tag':tag, 'attr':attr, 'val':val, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal});
    }

    for (let child of node.children) extract(child, tag, attr, val);
}

function clean(codeFile) {
    let lines = codeFile.code.split("\n");
    let text = lines[codeFile.position.row];
    let newText = text.substring(0, codeFile.starter) + text.substring(codeFile.position.column);   // without < to cursor
    storage.fragment = text.substring(codeFile.starter+1, codeFile.position.column);
    lines[codeFile.position.row] = newText + "<>";  // gets rid of incomplete, adds branding to end of line
    return lines.join("\n");
}

/*
Retrieves/stores the input features for the DT, necessary to make a prediction.
@param parentTag The tag of the parent node of the element being typed
@param parentAttr The attribute of the parent node of the element being typed
@param parentVal The value of the parent node of the element being typed
 */
function extractSample(parentTag, parentAttr, parentVal) {

    let parentAttrVal = parentAttr + "=" + parentVal;
    if (parentAttrVal === '=') parentAttrVal = '';

    if (storage.predictionCase === PREDICTION_CASE.ATTRIBUTE) {

        let tag = storage.fragment.split(" ")[0];
        storage.sampleFeatures = {'tag': tag, 'parentTag': parentTag, 'parentAttr/Val': parentAttrVal};

    } else if (storage.predictionCase === PREDICTION_CASE.VALUE) {

        let tag = storage.fragment.split(" ")[0];
        let attr = storage.fragment.split(" ")[1].split('=')[0];
        storage.sampleFeatures = {'tag': tag, 'attr': attr, 'parentTag': parentTag, 'parentAttr/Val': parentAttrVal};

    } else if (storage.predictionCase === PREDICTION_CASE.TAG) {

        storage.sampleFeatures = {'parentTag': parentTag, 'parentAttr/Val': parentAttrVal};
    }

}
