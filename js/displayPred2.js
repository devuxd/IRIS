//All necessary functions for UI. Including functions for editing rules

/**
 *Display the main menu
 */
function mainMenu(){
    currentPred();
    document.getElementById("current prediction").style.display = "none";
    document.getElementById("existing rules").style.display = "none";
    document.getElementById("add new rule").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
}

/**
 * Shows the top rule for the current prediction to the user.
 */
function currentPred() {
    const featuresElement = document.getElementById('currentConditions');
    const predictionElement = document.getElementById('currentPrediction');
    const topRule = storage.topRule;
    const topPred = topRule.getPrediction();

    if (topPred === null){
        featuresElement.innerHTML = 'No code prediction can be made.';
        predictionElement.innerHTML = '.';
        predictionElement.style.visibility = 'hidden';
        return;
    } else {
        featuresElement.innerHTML = toPlaintext(storage.topRule.getInputs(), true);
        predictionElement.style.visibility = 'visible';
        predictionElement.innerHTML = toPlaintext(topPred, false);
    }

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
    if (containsRule(storage.topRule, relevantWhitelist)){
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
    if (relevantWhitelist.length > 0) {
        fillTable(relevantWhitelist, true, predictionCase);
    }

    const relevantList = storage.standard[predictionCase];
    relevantList.length = 0;
    const relevantDT = storage.dt[predictionCase];
    getRulesFromDT(relevantDT, predictionCase);
    if (relevantList.length > 0) {
        fillTable(relevantList, false, predictionCase);
    }

    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("existing rules").style.display = "block";
}

function fillTable(list, whitelistTable, predictionCase){
    const table = document.getElementById(whitelistTable ? 'whitelistTable' : 'standardTable');
    table.innerHTML = '';

    for (let i = 0; i <= list.length; i++) { // Account for header
        let y = 0;

        const row = table.insertRow(i);
        let cell = row.insertCell(y++);
        cell.innerHTML = i > 0 ? i.toString() : '#';

        const rule = list[i-1]; // Account for header
        cell = row.insertCell(y++);
        cell.innerHTML = i > 0 ? toPlaintext(rule.getInputs(), true) : 'Conditions';

        cell = row.insertCell(y++);
        cell.innerHTML = i > 0 ? toPlaintext(rule.getPrediction(), false): 'Prediction';

        let optionsCell = '<button class="'+predictionCase+i+'" onclick="lookExamples(this)">&#128269;</button>';
        if (whitelistTable) {
            optionsCell += '<button class="'+predictionCase+i+'" onclick="whitelistDemote(this)">&#9660;</button>';
        } else {
            optionsCell += '<button class="'+predictionCase+i+'" onclick="doPrioritize(this)">&#9650;</button>';
            optionsCell += '<button class="'+predictionCase+i+'" onclick="deleteRule(this)">&#9660;</button>';
        }
        optionsCell = '<span>' + optionsCell + '</span>';

        cell = row.insertCell(y++);
        cell.innerHTML = i > 0 ? optionsCell : 'Options';

    }
}

/*
    Demotes priority to regular via view all rules
 */
function whitelistDemote(cell){
	const index = cell.className;
    const rule =
	mainMenu();
}

function lookExamples(cell){
	let index = cell.id.split("e")[1];
    let pred = pred1;
    let table = cell.parentNode.parentNode.parentNode.parentNode.id;
    let sample;
    if (table === "table2"){
        sample = newList[index];
    } else if (pred === 'tag'){
        sample = storage.alwaysTag[index];
    }else if (pred === 'attr'){
        sample = storage.alwaysAttr[index];
    }else if ( pred === 'val'){
        sample = storage.alwaysValue[index];
    }
	findNodes(sample, storage.ast);
	highlightLine();
}
// TODO: Do we need to clone objects?
function deleteRule(cell){
    let index = cell.id;
    let pred = pred1;
    let table = cell.parentNode.parentNode.parentNode.parentNode.id;
    let rule;
    if (table === "table2"){
        rule = newList[index];
    } /*else if (pred === 'tag'){ TODO: This doesn't appear reachable
        rule = storage.alwaysTag[index];
        deleteEntry(storage.alwaysTag, rule);
    }else if (pred === 'attr'){
        rule = storage.alwaysAttr[index];
        deleteEntry(storage.alwaysAttr, rule);
    }else if ( pred === 'val'){
        rule = storage.alwaysValue[index];
        deleteEntry(storage.alwaysValue, rule);
    }*/
    storage.dontUse.push(rule);
	mainMenu();
}

/**
 * Shows the relevant features for the user to add a new rule
 */
function addNew(){
	deleteHighlight();
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
