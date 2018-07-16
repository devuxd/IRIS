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
            val = attribute.value;  // TODO: Empty attribute fix
            addTraining(tag, parentTag, parentAttrVal, attr, val);
        }
    } else {
        attr = '';
        val = '';
        addTraining(tag, parentTag, parentAttrVal, attr, val);
    }

    updateTagBlacklist(tag);
    for (let child of node.children) extract(child, tag, attr, val);
}

function addTraining(tag, parentTag, parentAttrVal, attr, val) {
    switch (storage.predictionCase) {
        case PREDICTION_CASE.TAG:
            storage.trainingTable.push({'tag':tag, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal});
            break;
        case PREDICTION_CASE.ATTRIBUTE:
            storage.trainingTable.push({'tag':tag, 'attr':attr, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal});
            break;
        case PREDICTION_CASE.VALUE:
            storage.trainingTable.push({'tag':tag, 'attr':attr, 'val':val, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal});
            break;
    }
}

function updateTagBlacklist(tag) {
    for (let checkTag of ['html','head','body']) if (tag === checkTag) storage.tagBlacklist.push(tag);
}

function clean(codeFile) {
    let lines = codeFile.code.split("\n");
    let text = lines[codeFile.position.row];
    let newText = text.substring(0, codeFile.fragmentStart) + '<>' + text.substring(codeFile.position.column);   // without < to cursor
    storage.fragment = text.substring(codeFile.fragmentStart+1, codeFile.position.column);
    lines[codeFile.position.row] = newText;
    return lines.join("\n");
}

/*
Retrieves/stores the input features for the DT, necessary to make a prediction.
@param parentTag The tag of the parent node of the element being typed
@param parentAttr The attribute of the parent node of the element being typed
@param parentVal The value of the parent node of the element being typed
 */

function extractSample(parentTag, parentAttrVal) {

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
