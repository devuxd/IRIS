function updateHighlights(rule, ast) {
    unHighlightExamples();
    storage.examples.length = 0;
    storage.strongExamples.length = 0;
    if (!_.isEmpty(ast) && rule.getPrediction() !== null) {
        findExamples(rule, ast);
        highlightExamples();
    }
}

function highlightExamples() {
    const Range = ace.require('ace/range').Range;
    for (const line of storage.examples){
        const marker = storage.aceEditor.getSession().addMarker(new Range(line, 0, line, 1), "highlightGreen", "fullLine");
        storage.highlights.push(marker);
    }
    for (const line of storage.strongExamples){
        const marker = storage.aceEditor.getSession().addMarker(new Range(line, 0, line, 1), "highlightBrightGreen", "fullLine");
        storage.highlights.push(marker);
    }
}

function unHighlightExamples() {
    for (const highlight of storage.highlights){
        storage.aceEditor.getSession().removeMarker(highlight);
    }
    storage.highlights.length = 0;
}

function findExamples(desiredRule, ast){
    for (const node of ast){
        checkASTNodeForExamples(node, desiredRule, '', '', '', 0);
    }
}

function checkASTNodeForExamples(node, desiredRule, parentTag, parentAttribute, parentValue, pAVIndex){

    if (node.type !== 'element') {
        return;
    }

    const parentAttributeValue = (parentAttribute === '' && parentValue === '') ? '' : parentAttribute + '=' + parentValue;
    const tag = node.tagName;

    if (node.attributes.length > 0) {
        let i = 0;
        for (const avPair of node.attributes) {
            const attribute = avPair.key;
            const value = avPair.value === null ? '' : avPair.value;
            checkExample(node, desiredRule, tag, parentTag, parentAttributeValue, attribute, value);
            if (pAVIndex === 0) {
                for (const child of node.children) {
                    checkASTNodeForExamples(child, desiredRule, tag, attribute, value, i);
                }
            }
            i++;
        }
    } else {
        const attribute = '';
        const value = '';
        checkExample(node, desiredRule, tag, parentTag, parentAttributeValue, attribute, value);
        if (pAVIndex === 0) {
            for (const child of node.children){
                checkASTNodeForExamples(child, desiredRule, tag, attribute, value, 0);
            }
        }
    }
}

function checkExample(node, desiredRule, tag, parentTag, parentAttributeValue, attribute, value) {

    const prospectiveRule = new Rule(null, null);

    switch (desiredRule.getPredictionCase()) {
        case PREDICTION_CASE.TAG:
            prospectiveRule.setInputs({parentTag: parentTag, parentAttributeValue: parentAttributeValue});
            prospectiveRule.setPrediction({tag: tag});
            break;
        case PREDICTION_CASE.ATTRIBUTE:
            prospectiveRule.setInputs({parentTag: parentTag, parentAttributeValue: parentAttributeValue, tag: tag});
            prospectiveRule.setPrediction({attribute: attribute});
            break;
        case PREDICTION_CASE.VALUE:
            prospectiveRule.setInputs({parentTag: parentTag, parentAttributeValue: parentAttributeValue, tag: tag, attribute:attribute});
            prospectiveRule.setPrediction({value: value});
            break;
    }

    desiredRule.trimInputs();
    prospectiveRule.trimInputs();

    const line = node.position.start.line;
    if (prospectiveRule.equalsRule(desiredRule, true)) {
        if (!storage.strongExamples.includes(line)) {
            storage.strongExamples.push(line);
        }
    } else if (prospectiveRule.equalsRule(desiredRule, false)) {
        if (!storage.examples.includes(line)) {
            storage.examples.push(line);
        }
    }
}