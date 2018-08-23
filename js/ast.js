/*
Builds an Abstract Syntax Tree by 'cleaning' the code
of the user's incomplete fragments, branding the fragment section,
parsing HTML --> JSON and removing whitespace.

@param {CodeFile} codeFile - An object that includes the editor code and cursor position
@returns {JSON} AST - The Abstract Syntax Tree
 */
function getAST(codeFile, markSample) {
	return removeWhitespace(himalaya.parse(clean(codeFile, markSample)));
}

function extractFeatures(syntaxTree, predictionCase) {
    for (let node of syntaxTree) extract(node, predictionCase, '', '', '');
}

function extract(node, predictionCase, parentTag, parentAttribute, parentValue) {

    let parentAttributeValue = parentAttribute + '=' + parentValue;
    if (parentAttributeValue === '=') parentAttributeValue = '';
    
    if (node.type !== 'element') {
        if (node.content.includes('<>')) extractSample(parentTag, parentAttributeValue);
        return;
    }

    const tag = node.tagName;

    if (node.attributes.length > 0) {
        for (const attributeValue of node.attributes) {
            const attribute = attributeValue.key;
            let value = attributeValue.value;
            value = value === null ? '' : value;
            addTraining(predictionCase, tag, parentTag, parentAttributeValue, attribute, value);
            for (const child of node.children) extract(child, predictionCase, tag, attribute, value);
        }
    } else {
        const attribute = '';
        const value = '';
        addTraining(predictionCase, tag, parentTag, parentAttributeValue, attribute, value);
        for (const child of node.children) extract(child, predictionCase, tag, attribute, value);
    }

}

function addTraining(predictionCase, tag, parentTag, parentAttributeValue, attribute, value) {
    if (tag === '!doctype') return;
    let rule = new Rule(null, null);
	switch (predictionCase) {
        case PREDICTION_CASE.TAG:
            rule.setInputs({'parentTag':parentTag, 'parentAttributeValue':parentAttributeValue});
            rule.setPrediction({'tag':tag});
            break;
        case PREDICTION_CASE.ATTRIBUTE:
            rule.setInputs({'tag':tag, 'parentTag':parentTag, 'parentAttributeValue':parentAttributeValue});
            rule.setPrediction({'attribute':attribute});
			break;
        case PREDICTION_CASE.VALUE:
            rule.setInputs({'tag':tag, 'attribute':attribute, 'parentTag':parentTag, 'parentAttributeValue':parentAttributeValue});
            rule.setPrediction({'value':value});
			break;
    }
    const relevantBlacklist = storage.blacklist[predictionCase];
    if (!containsRule(rule, relevantBlacklist, false)) storage.trainingTable.push(rule.getRule());
}

/*
    What: Removes the code fragment user is currently writing
    Why: To not interfere parsing into AST
    @param {CodeFile} codeFile - Contains whole document, and current cursor position
    @param {Boolean} markSample - Whether to mark the fragment location for input extraction
 */
function clean(codeFile, markSample) {
    let lines = codeFile.code.split("\n");
    let text = lines[codeFile.position.row];
	const sampleMarker = markSample ? "<>" : "";
    let newText = text.substring(0, codeFile.fragmentStart) + sampleMarker + text.substring(codeFile.position.column);   // without < to cursor
	storage.fragment = text.substring(codeFile.fragmentStart+1, codeFile.position.column);
    lines[codeFile.position.row] = newText;
    return lines.join("\n");
}

/*
    What: Finds and stores the inputs to feed into the DT
    @param parentTag The tag of the parent node of the element being typed
    @param parentAttributeValue The attribute/value pair of the parent node of the element being typed
 */
function extractSample(parentTag, parentAttributeValue) {

    let input;
    const tag = storage.fragment.split(" ")[0].trim();

    switch (storage.predictionCase) {
        case PREDICTION_CASE.TAG:
            input = {'parentTag': parentTag, 'parentAttributeValue': parentAttributeValue};
            break;
        case PREDICTION_CASE.ATTRIBUTE:
            input = {'tag': tag, 'parentTag': parentTag, 'parentAttributeValue': parentAttributeValue};
            break;
        case PREDICTION_CASE.VALUE:
            const attribute = extractAttribute();
            input = {'tag': tag, 'attribute': attribute, 'parentTag': parentTag, 'parentAttributeValue': parentAttributeValue};
    }
    storage.inputs.push(input);
}

/*
    What: Extracts attribute from the user's code fragment
    How: Runs backward from assign (=) until it hits text and then a space. Stores the text.
 */
function extractAttribute() {

    let indexAssign = storage.fragment.lastIndexOf("=");
    let run = true;
    let i = indexAssign;
    let state = "assign";
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
    const attribute = storage.fragment.substring(++i, indexAssign).trim();
    return attribute;
}
