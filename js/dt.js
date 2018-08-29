/*
*
* Builds Decision Tree from AST-generated Training Table
* according to the type of code the user needs completed:
* Tag, Attribute or Value.
*
*/
function buildDT(trainingRules, predictionCase) {
    trainingRules = _(trainingRules);
    let inputFeatures;
    switch (predictionCase) {
        case PREDICTION_CASE.TAG:
            inputFeatures = ['parentTag', 'parentAttributeValue'];
            break;
        case PREDICTION_CASE.ATTRIBUTE:
            inputFeatures = ['tag', 'parentTag', 'parentAttributeValue'];
            break;
        case PREDICTION_CASE.VALUE:
            inputFeatures = ['tag', 'attribute', 'parentTag', 'parentAttributeValue'];
            break;
    }
    const targetFeature = predictionCase.toString();
    return id3(trainingRules, targetFeature, inputFeatures);
}

function getRulesFromDT(dt, predictionCase) {
    parseDTNode(dt, predictionCase, {});
}

function parseDTNode(node, predictionCase, info, featureKey) {

    if (node.type === 'feature') {

        const featureKey = node.name;
        for (const featureValueNode of node.vals) {
            parseDTNode(featureValueNode, predictionCase, info, featureKey);
        }

    } else if (node.type === 'feature_value') {

        const kvp = Object.assign({}, info);    // Clones info to allow upstream reuse
        kvp[featureKey] = node.name;
        parseDTNode(node.child, predictionCase, kvp);

    } else if (node.type === 'result') {
        const relevantList = storage.standard[predictionCase];
/*        const relevantBlacklist = storage.blacklist[predictionCase];*/
        const relevantWhitelist = storage.whitelist[predictionCase];
        const inputs = info;
        const predictions = node.name;
        for (const pred of predictions) {
            const prediction = {};
            prediction[predictionCase] = pred;
            const rule = new Rule(inputs, prediction);
            if (/*!containsRule(rule, relevantBlacklist, true) && */!containsRule(rule, relevantWhitelist, true)) {
                relevantList.push(rule);
            }
        }
    }

}
