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
    for (let node of syntaxTree) extract(node, predictionCase, '', '', '', 0    );
}

/*
    What: Extracts features like tag and attribute-value pairs for the element and its parent
    How:
        1. Parent features passed as parameter
        2. Extract tag
        3. If node has attribute-value pairs:
            a. For each pair, extract attribute and value
                b. Send tag, attribute, value and parent info for training storage
                c. If the current node is recursed from first parent attribute-value pair, recurse node children
        4. Else
            a. Send tag, attribute, value, and parent info for training storage
            b. If the current node is recursed from first parent attribute-value pair, recurse node children

    What: Also extracts input features if marked for extraction

 */
function extract(node, predictionCase, parentTag, parentAttribute, parentValue, pAVIndex) {

    const parentAttributeValue = (parentAttribute === '' && parentValue === '') ? '' : parentAttribute + '=' + parentValue;
    
    if (node.type !== 'element') {
        if (node.content.includes('<>')) {
            extractSample(parentTag, parentAttributeValue);
        }
        return;
    }

    const tag = node.tagName;

    if (node.attributes.length > 0) {
        let i = 0;
        for (const avPair of node.attributes) {
            const attribute = avPair.key;
            const value = avPair.value === null ? '' : avPair.value;
            addTraining(predictionCase, tag, parentTag, parentAttributeValue, attribute, value);
            if (pAVIndex === 0) {
                for (const child of node.children) {
                    extract(child, predictionCase, tag, attribute, value, i);
                }
            }
            i++;
        }
    } else {
        const attribute = '';
        const value = '';
        addTraining(predictionCase, tag, parentTag, parentAttributeValue, attribute, value);
        if (pAVIndex === 0) {
            for (const child of node.children) {
                extract(child, predictionCase, tag, attribute, value, 0);
            }
        }
    }

}

function addTraining(predictionCase, tag, parentTag, parentAttributeValue, attribute, value) {
    if (['!doctype', 'html', 'head', 'body'].includes(tag)) return;
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
	// Adds rule if its prediction isn't empty and if its not blacklisted
    if ((rule.getPrediction()[predictionCase] !== '') && !containsRule(rule, relevantBlacklist, false)) {
        storage.trainingTable.push(rule.getRule());
    }
}

/*
    What: Removes the code fragment user is currently writing
    Why: To not interfere parsing into AST
    @param {CodeFile} codeFile - Contains whole document, and current cursor position
    @param {Boolean} markSample - Whether to mark the fragment location for input extraction
 */
function clean(codeFile, markSample) {
    let lines = codeFile.lines;
    let text = codeFile.text;
	const sampleMarker = markSample ? '<>' : '';
    let newText = text.substring(0, codeFile.fragmentStart()) + sampleMarker + text.substring(codeFile.position.column);   // without < to cursor
	if (markSample) storage.fragment = text.substring(codeFile.fragmentStart()+1, codeFile.position.column);
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
