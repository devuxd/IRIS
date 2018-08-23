//All necessary functions for UI. Including functions for editing rules

/**
 *Display the main menu
 */
function mainMenu(){
    document.getElementById("current prediction").style.display = "none";
    document.getElementById("existing rules").style.display = "none";
    document.getElementById("add new rule").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
    updateCurrentRule();
}

function refreshUI() {
    if (document.getElementById("existing rules").style.display === "block") {
        existingRules();
    }
}

/**
 * Shows the top rule for the current prediction to the user.
 */
function updateCurrentRule() {
    const featuresElement = document.getElementById('currentConditions');
    const predictionElement = document.getElementById('currentPrediction');
    const topRule = storage.topRule;
    const topPred = topRule.getPrediction();

    if (topPred === null){
        featuresElement.innerHTML = 'No code prediction can be made.';
        predictionElement.innerHTML = '.';
        predictionElement.style.visibility = 'hidden';
    } else {
        featuresElement.innerHTML = toPlaintext(topRule.getInputs(), true);
        predictionElement.style.visibility = 'visible';
        predictionElement.innerHTML = toPlaintext(topPred, false);
    }

    /*
        Update selected options
     */
    for (const predictionCase of ['tag', 'attribute', 'value']) {
        if (predictionCase === storage.predictionCase) {
            document.getElementById(predictionCase + '_existing').setAttribute('selected', '');
            document.getElementById(predictionCase + '_new').setAttribute('selected', '');
        } else {
            document.getElementById(predictionCase + '_existing').removeAttribute('selected');
            document.getElementById(predictionCase + '_new').removeAttribute('selected');
        }
    }

}


/**
 * Lets the user edit the current prediction
 */
function editCurrent(){
	//deleteHighlight();
    if (storage.topRule.getPrediction() === null) {
        alert('No code prediction available.');
        return;
    }
	document.getElementById("current prediction").style.display = "block";
    document.getElementById("mainMenu").style.display = "none";

    const relevantWhitelist = storage.whitelist[storage.topRule.getPredictionCase()];
    if (containsRule(storage.topRule, relevantWhitelist, false)){
		document.getElementById("prioritizeCurrentRule").style.display = "none";
        document.getElementById("blacklistCurrentRule").style.display = "none";
		document.getElementById("deleteCurrentPrioritizedRule").style.display = "block";

	} else {
		document.getElementById("prioritizeCurrentRule").style.display = "block";
        document.getElementById("blacklistCurrentRule").style.display = "block";
		document.getElementById("deleteCurrentPrioritizedRule").style.display = "none";
	}

    document.getElementById("updateOptions").style.display = "block";
}

/**
 * Adds rule to priority list via edit current menu
 */
function include(){
    whitelist(storage.topRule);
    mainMenu();
}

/**
 * Blacklists rule via edit current menu
 * Gets rule from topPred and corresponding input features
 */
function notInclude(){
    blacklist(storage.topRule);
    mainMenu();
}

/*
    Deletes rule from whitelist via edit current menu
 */
function unPrioritize(){
	unWhitelist(storage.topRule);
	mainMenu();
}

/*// *
//  * Checks for inconsistency between rules
//  * returns true if a rule contradicts one in the array
function  checksRule(pred, array, rule){
    let valid = true;
    for (let i = 0; i < array.length; i++){
        if (contradicts(pred, rule, array[i])){
            valid = false;
        }
    }
    return valid;
}

// *
//  * Returns true if 2 rules contradict each other based on the target feature.
//  * A contradiction is defined as having equivalent input features and different prediction value
function contradicts(pred, rule1, rule2){
    let contradicts = false;
    if (pred === 'tag'){
        if (rule1['parentTag'] === rule2['parentTag'] && rule1['parentAttr/Val'] === rule2['parentAttr/Val'] && rule1['tag'] !==rule2['tag']){
            contradicts = true;
        }
    }else if (pred === 'attr'){
        if (rule1['parentTag'] === rule2['parentTag'] && rule1['parentAttr/Val'] === rule2['parentAttr/Val'] && rule1['tag'] === rule2['tag'] && rule1['attr'] !==rule2['attr']){
            contradicts = true;
        }
    }else if (pred === 'val'){
        if (rule1['parentTag'] === rule2['parentTag'] && rule1['parentAttr/Val'] === rule2['parentAttr/Val'] && rule1['tag'] === rule2['tag'] && rule1['attr'] === rule2['attr'] && rule1['val'] !==rule2['val']){
            contradicts = true;
        }
    }
    return contradicts;
}*/


/**
 * Adds custom rule to the whitelist unless new prediction is empty
 */
function updateCurrent(){
    const newPrediction = document.getElementById("updateCurrent").value;
    if (newPrediction === ''){
        alert('Invalid prediction value.');
        return;
    }
    const rule = Object.assign({}, storage.topRule);    // Clones rule to not modify original
    const prediction = {};
    prediction[rule.getPredictionCase()] = newPrediction;
    rule.setPrediction(prediction);
    whitelist(rule);
    mainMenu();
}

/**
 *Display all existing rules for a prediction scenario.
 * Fills priority table with all priority rules for scenario
 * Fills regular table with all regular training rules...
 */
function existingRules() {

    const predictionCase = document.getElementById("existingRules").options[document.getElementById("existingRules").selectedIndex].value;

    const relevantWhitelist = storage.whitelist[predictionCase];
    fillTable(relevantWhitelist, 'whitelistTable');

    const codeFile = new CodeFile(storage.aceEditor.getValue(), storage.aceEditor.getCursorPosition());
    const ast = getAST(codeFile, false);
    storage.trainingTable.length = 0;
    extractFeatures(ast, predictionCase);
    const decisionTree = getDT(storage.trainingTable, predictionCase);
    const relevantList = storage.standard[predictionCase];
    relevantList.length = 0;
    getRulesFromDT(decisionTree, predictionCase);
    fillTable(relevantList, 'standardTable');

    const relevantBlacklist = storage.blacklist[predictionCase];
    fillTable(relevantBlacklist, 'blacklistTable');

    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("existing rules").style.display = "block";
}

function fillTable(list, table){
    const tableElem = document.getElementById(table);
    tableElem.innerHTML = '';

    if (list.length === 0) return;

    let prevConditions = '';

    for (let i = 0; i <= list.length; i++) { // Account for header
        let y = 0;

        const row = tableElem.insertRow(i);
        let cell = row.insertCell(y++);
        cell.innerHTML = i > 0 ? i.toString() : '#';
        cell.setAttribute('class', 'center');   // Centers the id

        const rule = list[i-1]; // Account for header
        cell = row.insertCell(y++);
        const conditions = i > 0 ? toPlaintext(rule.getInputs(), true) : null;
        const matchesPrevConditions = conditions === prevConditions;
        row.setAttribute('class', matchesPrevConditions  ? 'sameCondition' : 'uniqueCondition');
        prevConditions = conditions;
        cell.innerHTML = i > 0 ? conditions : 'Conditions';
        cell.setAttribute('class', 'expandH');

        cell = row.insertCell(y++);
        cell.innerHTML = i > 0 ? toPlaintext(rule.getPrediction(), false): 'Prediction';

        const ruleInfo = {rule: rule, table:table};
        let options = [];
        options[0] = document.createElement('button');
        options[0].innerHTML = '&#128269;';
        options[0].setAttribute('class', 'example');
        options[0].addEventListener('click', function(){
            viewRulesExample(ruleInfo);
        });


        options[1] = document.createElement('button');
        options[1].innerHTML = '&#9650;';
        if (table === 'whitelistTable') options[1].setAttribute('disabled','');
        options[1].addEventListener('click', function(){
            viewRulesPromote(ruleInfo);
        });

        options[2] = document.createElement('button');
        options[2].innerHTML = '&#9660;';
        if (table === 'blacklistTable') options[2].setAttribute('disabled','');
        options[2].addEventListener('click', function(){
            viewRulesDemote(ruleInfo);
        });

        let span = document.createElement('span');
        for (const option of options) {
            span.appendChild(option);
        }

        cell = row.insertCell(y++);
        if (i > 0) {
            cell.appendChild(span);
        } else {
            cell.innerHTML = 'Options';
        }

    }
}

function viewRulesDemote(ruleInfo){
	const rule = ruleInfo.rule;
	switch (ruleInfo.table) {
        case 'whitelistTable':
            unWhitelist(rule);
            break;
        case 'standardTable':
            blacklist(rule);
            break;
    }
	existingRules();
}

function viewRulesPromote(ruleInfo) {
    const rule = ruleInfo.rule;
    switch (ruleInfo.table) {
        case 'blacklistTable':
            unBlacklist(rule);
            break;
        case 'standardTable':
            whitelist(rule);
            break;
    }
    existingRules();
}

function viewRulesExample(ruleInfo) {
    const input = ruleInfo.rule.getInputs();
    findNodes(input, storage.ast);
    highlightLine();
    existingRules();
}

/**
 * Shows the relevant features for the user to add a new rule
 */
function addNew(){
	//deleteHighlight();
    document.getElementById("mainMenu").style.display = 'none';
    document.getElementById("add new rule").style.display = 'block';
    document.getElementById("newNotValid").style.display = 'none';
    let type = document.getElementById("addNewRule").options[document.getElementById("addNewRule").selectedIndex].value;
	document.getElementById("0").style.display = 'block';
	document.getElementById("1").style.display = 'block';
    document.getElementById("2").style.display = 'block';
    document.getElementById("3").style.display = 'block';
    if (type === "tag"){
        document.getElementById("4").style.display = 'none';
        document.getElementById("5").style.display = 'none';
    } else if (type === "attr"){
        document.getElementById("4").style.display = 'block';
        document.getElementById("5").style.display = 'none';
    } else if (type === "value"){
        document.getElementById("4").style.display = 'block';
        document.getElementById("5").style.display = 'block';
    }
}

/**
 * Adds the new rule to the respective always use array,
 * only if it's not on the dontUse array or alwaysArray
 * so rule cannot be blacklisted or whitelisted already
 */
function addRule(){
    let target = document.getElementById("addNewRule").value;
    let rule;
    if (target === "tag"){
        rule = {'parentTag':document.getElementById("parentTag").value, 'parentAttr/Val':document.getElementById("parentAttr/Val").value, 'tag':document.getElementById("tag").value};
        if (!contains(rule, storage.dontUse) && (!contains(rule, storage.alwaysTag)) && checksRule('tag', storage.alwaysTag, rule) && rule['tag'] !==""){
            storage.alwaysTag.push(rule);
            console.log(storage.alwaysTag);
        }else{
            document.getElementById("newNotValid").style.display = "block";
            return;
        }
    } else if (target === "attr"){
        rule = {'tag':document.getElementById("tag").value, 'parentTag':document.getElementById("parentTag").value, 'parentAttr/Val':document.getElementById("parentAttr/Val").value, 'attr':document.getElementById("attr").value};
        if (!contains(rule, storage.dontUse) && (!contains(rule, storage.alwaysAttr)) && checksRule('attr', storage.alwaysAttr, rule) && rule['tag'] !=="" && rule['attr'] !==""){
            storage.alwaysAttr.push(rule);
            console.log(storage.alwaysAttr);
        }else{
            document.getElementById("newNotValid").style.display = "block";
            return;
        }
    } else if (target === "value"){
        rule = {'tag':document.getElementById("tag").value, 'attr':document.getElementById("attr").value, 'parentTag':document.getElementById("parentTag").value, 'parentAttr/Val':document.getElementById("parentAttr/Val").value, 'val':document.getElementById("value").value};
        if (!contains(rule, storage.dontUse) && (!contains(rule, storage.alwaysValue)) && checksRule('val', storage.alwaysValue, rule) && rule['tag'] !=="" && rule['attr'] !=="" && rule['val'] !==""){
            storage.alwaysValue.push(rule);
            console.log(storage.alwaysValue);
        }else{
            document.getElementById("newNotValid").style.display = "block";
            return;
        }
    }
    mainMenu();
}

/**
 * Part of the search engine, narrows down the options when the user starts typing when looking for a rule
 */
function filter(){
    let columns = document.getElementById("table2").rows[0].cells.length;
    let input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("table1");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[columns - 2];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("table2");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[columns - 2];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function highlightLine(){
	let aceEditor = storage.aceEditor;
	let Range = ace.require('ace/range').Range;
	let marker;
	deleteHighlight();
	for (let line of storage.examples){
		marker = aceEditor.getSession().addMarker(new Range(line, 0, line, 1), "myMarker", "fullLine");
		storage.highlights.push(marker);
	}
	for (let line of storage.badExamples){
		marker = aceEditor.getSession().addMarker(new Range(line, 0, line, 1), "myMarker1", "fullLine");
		storage.highlights.push(marker);
	}
}

function deleteHighlight(){
	let aceEditor = storage.aceEditor;
	for (let highlight of storage.highlights){
		aceEditor.getSession().removeMarker(highlight);
	}
		storage.highlights = [];
}

/*
    Converts input features and top prediction to a rule object
 */
function getRule(){
	let rule = Object.assign({}, storage.sampleFeaturesMap[storage.topPred]);
	let type = storage.predictionCase;
	if (type === PREDICTION_CASE.TAG){
		rule['tag'] = storage.topPred;
	} else if (type === PREDICTION_CASE.ATTRIBUTE){
		rule['attr'] = storage.topPred;
	} else if (type === PREDICTION_CASE.VALUE){
		rule['val'] = storage.topPred;
	}
	return rule;
}

function findNodes(rule, syntaxTree){
	storage.examples = new Set();
	storage.badExamples = new Set();
	for (let node of syntaxTree){
		checkNodes(rule, node, "", "", "");
	}
	for (example of storage.badExamples){
		if (storage.examples.has(example)){
			storage.badExamples.delete(example);
		}
	}
}

function checkNodes(rule, node, parentTag, parentAttr, parentVal){
	if (node.type !== 'element'){
		return;
	}
	let parentAttrVal = parentAttr + '=' + parentVal;
	if (parentAttrVal === '=') parentAttrVal = '';
	let tag = node.tagName;
	let attr, val;
	if (node.attributes.length > 0) {
		for (let attribute of node.attributes) {
			attr = attribute.key;
            val = attribute.value;
            val = val === null ? '' : val;
			addLine(rule, node, tag, parentTag, parentAttrVal, attr, val);
			for (let child of node.children){
				checkNodes(rule, child, tag, attr, val);
			}
		}
	} else {
		attr = '';
		val = '';
		addLine(rule, node, tag, parentTag, parentAttrVal, attr, val);
		for (let child of node.children){
			checkNodes(rule, child, tag, attr, val);
		}
	}
}


function addLine(rule, node, tag, parentTag, parentAttrVal, attr, val){
	let type = storage.predictionCase;
	let rule2;
	let pred;
	if (type === PREDICTION_CASE.TAG){
		rule2 = {'tag':tag, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal};
		if (rule['parentTag'] === parentTag && rule['parentAttr/Val'] === parentAttrVal && rule['tag'] === tag){
			storage.examples.add(node.position.start.line);
			return;
		}
		pred = 'tag'
	} else if (type === PREDICTION_CASE.ATTRIBUTE){
		rule2 = {'tag':tag, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal, 'attr':attr};
		if (rule['parentTag'] === parentTag && rule['parentAttr/Val'] === parentAttrVal && rule['tag'] === tag && rule['attr'] === attr){
			storage.examples.add(node.position.start.line);
			return;
		}
		pred = 'attr';
	} else if (type === PREDICTION_CASE.VALUE){
		rule2 = {'tag':tag, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal, 'attr':attr, 'val':val};
		if (rule['parentTag'] === parentTag && rule['parentAttr/Val'] === parentAttrVal && rule['tag'] === tag && rule['attr'] === attr && rule['val'] === val){
			storage.examples.add(node.position.start.line);
			return;
		}
		pred = 'val'
	}
	if (Object.keys(rule2).length > 0 && contradicts(pred, rule, rule2)){
		storage.badExamples.add(node.position.start.line);
	}
}
