/*
    Setup
 */

const elem = {};
const newRulePlaceholders = {tag:["<div class = 'content'>", null, '<main>'], attribute:['<nav>','<a','href'], value:["<table id = 'data'>","",]};
const MODE = Object.freeze({'VIEW':0,'ADD':1});
let mode = MODE.VIEW;

function loadElements() {
    elem.currentConditions = document.getElementById('currentConditions');
    elem.currentPrediction = document.getElementById('currentPrediction');
    elem.currentPredictionHeader = document.getElementById('currentPredictionHeader');
    elem.currentExamplesButton = document.getElementById('currentExample');
    elem.currentPromoteButton = document.getElementById('currentPromote');
    elem.currentDemoteButton = document.getElementById('currentDemote');

    elem.predictionCaseSelector = document.getElementById('selectPredictionCase');
    elem.addRuleButton = document.getElementById('addRuleButton');
    elem.viewRulesButton = document.getElementById('viewRulesButton');

    elem.allRules = document.getElementById('allRules');
    elem.addRule = document.getElementById('addRule');

    elem.newRuleTable = document.getElementById('newRuleTable');
}

/*
    What: Updates current rule, dropdown, menu
 */
function refreshUI(updateDropdown) {
    updateCurrentRule();
    if (updateDropdown) this.updateDropdown();
    switch(mode) {
        case MODE.VIEW: viewRules(); break;
        case MODE.ADD: addRule(); break;
    }
}

function updateDropdown() {
    if (storage.predictionCase !== 'none') {
        for (const predictionCase of ['tag', 'attribute', 'value']) {
            document.getElementById(predictionCase + '_existing').removeAttribute('selected');
        }
        document.getElementById(storage.predictionCase + '_existing').setAttribute('selected','');
    }
}

/*
    Current Rule
 */

function updateCurrentRule() {

    const topRule = storage.topRule;
    const topPrediction = topRule.getPrediction();

    if (topPrediction === null){
        elem.currentPrediction.style.visibility = 'hidden';
        elem.currentPredictionHeader.innerHTML = toPredictionHeader('');
        elem.currentConditions.style.visibility = 'hidden';
        for (const button of [elem.currentExamplesButton, elem.currentPromoteButton, elem.currentDemoteButton]) {
            button.setAttribute('disabled', '');
        }

    } else {
        elem.currentConditions.innerHTML = toPlaintext(topRule.getInputs(), true);
        elem.currentPrediction.innerHTML = toPlaintext(topPrediction, false);
        elem.currentPredictionHeader.innerHTML = toPredictionHeader(topRule.getPredictionCase());
        elem.currentConditions.style.visibility = 'visible';
        elem.currentPrediction.style.visibility = 'visible';

        elem.currentExamplesButton.removeAttribute('disabled');
        elem.currentDemoteButton.removeAttribute('disabled');
        const relevantWhitelist = storage.whitelist[topRule.getPredictionCase()];
        const isWhitelisted = containsRule(topRule, relevantWhitelist, false);
        if (isWhitelisted) {
            elem.currentDemoteButton.onclick = function() {
                unWhitelist(topRule);
            };
        } else {
            elem.currentDemoteButton.onclick = function () {
                blacklist(topRule);
            };
            elem.currentPromoteButton.removeAttribute('disabled');
        }
    }
}

/*
    All Rules
 */

function viewRules() {
    mode = MODE.VIEW;

    // View Whitelist
    const predictionCase = elem.predictionCaseSelector.options[elem.predictionCaseSelector.selectedIndex].value;
    const relevantWhitelist = storage.whitelist[predictionCase];
    fillTable(relevantWhitelist, 'whitelistTable', predictionCase);

    // View Standard
    const codeFile = new CodeFile(storage.aceEditor.getValue(), storage.aceEditor.getCursorPosition());
    const ast = getAST(codeFile, false);
    storage.trainingTable.length = 0;
    extractFeatures(ast, predictionCase);
    const relevantList = storage.standard[predictionCase];
    relevantList.length = 0;
    if (storage.trainingTable.length > 0) {
        const decisionTree = getDT(storage.trainingTable, predictionCase);
        getRulesFromDT(decisionTree, predictionCase);
    }
    fillTable(relevantList, 'standardTable', predictionCase);

    // View Blacklist
    const relevantBlacklist = storage.blacklist[predictionCase];
    fillTable(relevantBlacklist, 'blacklistTable', predictionCase);

    elem.addRule.style.display = 'none';
    elem.allRules.style.display = 'block';
    elem.addRuleButton.removeAttribute('disabled');
    elem.viewRulesButton.setAttribute('disabled','');
}

function fillTable(list, table, predictionCase){
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
        cell.innerHTML = i > 0 ? toPlaintext(rule.getPrediction(), false): toPredictionHeader(predictionCase);

        const ruleInfo = {rule: rule, table:table};
        let options = [];
        options[0] = document.createElement('button');
        options[0].innerHTML = '&#128269;';
        options[0].setAttribute('class', 'example');
        options[0].onclick = function(){
            viewRulesExample(ruleInfo);
        };


        options[1] = document.createElement('button');
        options[1].innerHTML = '&#9650;';
        if (table === 'whitelistTable') options[1].setAttribute('disabled','');
        options[1].onclick = function(){
            viewRulesPromote(ruleInfo);
        };

        options[2] = document.createElement('button');
        options[2].innerHTML = '&#9660;';
        if (table === 'blacklistTable') options[2].setAttribute('disabled','');
        options[2].onclick = function(){
            viewRulesDemote(ruleInfo);
        };

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
	refreshUI(false);
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
    refreshUI(false);
}

function viewRulesExample(ruleInfo) {
    const input = ruleInfo.rule.getInputs();
    findNodes(input, storage.ast);
    highlightLine();
    refreshUI(false);
}

/*
    Add Rule
 */

function addRule() {
    mode = MODE.ADD;

    const fields = [];
    const predictionCase = elem.predictionCaseSelector.options[elem.predictionCaseSelector.selectedIndex].value;
    switch (predictionCase) {
        case PREDICTION_CASE.VALUE:
            fields.push({header:'Attribute',placeholder:'width',class:'attribute'});
        case PREDICTION_CASE.ATTRIBUTE:
            fields.push({header:'Tag',placeholder:'img',class:'tag'});
        case PREDICTION_CASE.TAG:
            fields.push({header:'Parent Attribute-Value',placeholder:'class=header',class:'parentAttributeValue'});
            fields.push({header:'Parent Tag',placeholder:'section',class:'parentTag'});
            break;
    }
    fields.reverse();
    const predictionPlaceholders = {tag: 'img', attribute:'width', value:'250px'};
    fields.push({header:toPredictionHeader(predictionCase),placeholder:predictionPlaceholders[predictionCase],class:predictionCase});
    const table = elem.newRuleTable;
    table.innerHTML = '';
    const tableHeaderRow = table.insertRow();
    const tableBodyRow = table.insertRow();
    tableBodyRow.setAttribute('class', 'uniqueCondition');

    let j, cell;
    for (j = 0; j < fields.length; j++) {
        const field = fields[j];
        cell = tableHeaderRow.insertCell(j);
        cell.innerHTML = field.header;
        cell = tableBodyRow.insertCell(j);
        const inputField = document.createElement('input');
        inputField.setAttribute('placeholder', field.placeholder);
        inputField.setAttribute('class',field.class);
        inputField.onkeyup = function () {
            validateNewRule(tableBodyRow, inputField);
        };
        cell.appendChild(inputField);
    }
    cell = tableHeaderRow.insertCell(j);
    cell.innerHTML = 'Options';
    const optionsButton = document.createElement('button');
    optionsButton.setAttribute('disabled','');
    optionsButton.innerHTML = '&#10010;';
    optionsButton.onclick = function() {
        newRule(tableBodyRow);
    };
    cell = tableBodyRow.insertCell(j);
    cell.appendChild(optionsButton);

    elem.allRules.style.display = 'none';
    elem.addRule.style.display = 'block';
    elem.viewRulesButton.removeAttribute('disabled');
    elem.addRuleButton.setAttribute('disabled','');
}

function validateNewRule(tableBodyRow, inputField) {

    if (inputField.className === 'parentAttributeValue') {
        inputField.value = inputField.value.replace(/[ '"]/,'');
    }

    let valid = false;
    const cells = tableBodyRow.cells;
    const prediction = cells[cells.length - 2].children[0].value;
    if (prediction !== '') {
        for (let i = 0; i < cells.length - 2; i++) {
            const entry = cells[i].children[0].value;
            if (entry !== '') {
                valid = true;
                break;
            }
        }
    }
    const optionButton = cells[cells.length - 1].children[0];
    if (valid) {
        optionButton.removeAttribute('disabled');
    } else {
        optionButton.setAttribute('disabled','');
    }
}

function newRule(tableBodyRow) {
    const cells = tableBodyRow.cells;
    const input = {};
    for (let i = 0; i < cells.length - 2; i++) {
        const field = cells[i].children[0];
        input[field.className] = field.value;
    }
    const predictionField = cells[cells.length - 2].children[0];
    const predictionCase = predictionField.className;
    const predictionVal = predictionField.value;
    const prediction = {};
    prediction[predictionCase] = predictionVal;

    const newRule = new Rule(input, prediction);
    whitelist(newRule);
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

function findNodes(rule, syntaxTree){
	storage.examples = new Set();
	storage.badExamples = new Set();
	for (let node of syntaxTree){
		checkNodes(rule, node, "", "", "");
	}
	for (const example of storage.badExamples){
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
