//All necessary functions for UI. Including functions for editing rules

/**
* Shows the top rule for the current prediction to the user. 
*/
function currentPred(){
	console.log(storage.sampleFeatures);
	document.getElementById("button1").style.display = "block";
	document.getElementById("button2").style.display = "block";
	let sample;
	let featureStr;
	let predStr;
	if (storage.predictionList[0] == ""){
		document.getElementById("button1").style.display = "none";
		document.getElementById("button2").style.display = "none";
	}
	if (storage.predictionCase == PREDICTION_CASE.VALUE){
		sample = storage.sampleFeatures;
		for (var x = 0; x < sample.length; x++){
			if (sample[x] == ""){
				sample[x] = "none";
			}
			sample[x] = sample[x].toUpperCase();
		}
		predStr = "Therefore, the top prediction for the next value is: " + storage.predictionList[0].toUpperCase();
		featureStr = "The current tag is " + sample['tag'].toUpperCase() + ". The attribute is " + sample['attr'].toUpperCase() + ". The parent tag is " + sample['parentTag'].toUpperCase() + ". The attribute and value pair of the parent is " + sample['parentAttr/Val'].toUpperCase() + ".";
	} else if (storage.predictionCase == PREDICTION_CASE.TAG){
		sample = storage.sampleFeatures;
		for (var x = 0; x < sample.length; x++){
			if (sample[x] == ""){
				sample[x] = "none";
			}
			sample[x] = sample[x].toUpperCase();
		}
		featureStr = "The parent tag is " + sample['parentTag'].toUpperCase() + ". The attribute and value pair of the parent is " + sample['parentAttr/Val'].toUpperCase() + ".";
		predStr = "Therefore, the top prediction for the next tag is: " + storage.predictionList[0].toUpperCase();
	} else if (storage.predictionCase == PREDICTION_CASE.ATTRIBUTE){
		sample = storage.sampleFeatures;
		for (var x = 0; x < sample.length; x++){
			if (sample[x] == ""){
				sample[x] = "none";
			}
			sample[x] = sample[x].toUpperCase();
		}
		featureStr = "The current tag is " + sample['tag'].toUpperCase() + ", the parent tag is " + sample['parentTag'].toUpperCase() + ", and the attribute and value pair of the parent is " + sample['parentAttr/Val'].toUpperCase() + ".";
		predStr = "Therefore, the top prediction for the next attribute is: " + storage.predictionList[0].toUpperCase();
	}
	$("#features").html(featureStr);
	$("#prediction").html(predStr);
	document.getElementById("main menu").style.display = "none";
	document.getElementById("current prediction").style.display = "block";
}

/**
* If the user likes a rule, the user can add it to the respective array to use it as a priority.
* Does not add repeated rules.
* If the prediction feature is empty ("") does not add the rule.
*/
function include(){
	let sample = storage.sampleFeatures;
	if (storage.predictionCase == PREDICTION_CASE.VALUE){
		sample['val'] = storage.predictionList[0];
		if (!contains(sample, storage.alwaysValue)){
				storage.alwaysValue.push(sample);
		}
	} else if (storage.predictionCase == PREDICTION_CASE.TAG){
		sample['tag'] = storage.predictionList[0];
		if (!contains(sample, storage.alwaysTag)){
				storage.alwaysTag.push(sample);
		}
	} else if (storage.predictionCase == PREDICTION_CASE.ATTRIBUTE){
		sample['attr'] = storage.predictionList[0];
		if (!contains(sample, storage.alwaysAttr)){
				storage.alwaysAttr.push(sample);
		}
	}
	mainMenu();
}

/**
* stores the not wanted rule in the dontUse array. 
* It also deletes the rule from the respective always array.
* It does not blacklist a rule if the prediction feature is empty
*/
function notInclude(){
	let sample = storage.sampleFeatures;
	if (storage.predictionCase == PREDICTION_CASE.VALUE){
		sample['val'] = storage.predictionList[0];
		deleteEntry(storage.alwaysValue, sample);
	} else if (storage.predictionCase == PREDICTION_CASE.TAG){
		sample['tag'] = storage.predictionList[0];
		deleteEntry(storage.alwaysTag, sample);
	} else if (storage.predictionCase == PREDICTION_CASE.ATTRIBUTE){
		sample['attr'] = storage.predictionList[0];
		deleteEntry(storage.alwaysAttr, sample);
	}
	if (!contains(sample, storage.dontUse)){
		storage.dontUse.push(sample);
	}
	mainMenu();
}

function deleteEntry(array, entry){
	for (let i=0; i < array.length; i++){
		if (isEqual(entry, array[i])){
			array.splice(i, 1);
			break;
		}
	}
}


/**
* Checks for inconsistency between rules 
* returns true if a rule contradicts one in the array
*/
function checksRule(pred, array, rule){
	let valid = true;
	for (let i = 0; i < array.length; i++){
		if (contradicts(pred, rule, array[i])){
			valid = false;
		}
	}
	return valid;
}

/**
* Returns true if 2 rules contradict each other based on the target feature.
*/
function contradicts(pred, rule1, rule2){
	let contradicts = false;
	if (pred == 'tag'){
		if (rule1['parentTag'] == rule2['parentTag'] && rule1['parentAttr/Val'] == rule2['parentAttr/Val'] && rule1['tag'] != rule2['tag']){
			contradicts = true;
		}
	}else if (pred == 'attr'){
		if (rule1['parentTag'] == rule2['parentTag'] && rule1['parentAttr/Val'] == rule2['parentAttr/Val'] && rule1['tag'] == rule2['tag'] && rule1['attr'] != rule2['attr']){
			contradicts = true;
		}
	}else if (pred == 'val'){
		if (rule1['parentTag'] == rule2['parentTag'] && rule1['parentAttr/Val'] == rule2['parentAttr/Val'] && rule1['tag'] == rule2['tag'] && rule1['attr'] == rule2['attr'] && rule1['val'] != rule2['val']){
			contradicts = true;
		}
	}
	return contradicts;
}


/**
* Update current Rule, adds it to the respective always use array
* It does not add it to the array if the rule is in the don't use array
* does not add duplicates, and does not add the rule if it's inconsistent with another rule in the array
* does not update if the input entered by the user is empty.
*/
function updateCurrent(){
	let sample = storage.sampleFeatures;
	let newPred = document.getElementById("updateCurrent").value;
	if (newPred == ""){
		return;
	}
	if (storage.predictionCase == PREDICTION_CASE.VALUE){
		sample['val'] = newPred;
		if (!contains(sample, storage.dontUse) && (!contains(sample, storage.alwaysValue)) && checksRule('val', storage.alwaysValue, sample)){
			storage.alwaysValue.push(sample);
		}
	} else if (storage.predictionCase == PREDICTION_CASE.TAG){
		sample['tag'] = newPred;
		if (!contains(sample, storage.dontUse) && (!contains(sample, storage.alwaysTag)) && checksRule('tag', storage.alwaysTag, sample)){
			storage.alwaysTag.push(sample);
		}
	} else if (storage.predictionCase == PREDICTION_CASE.ATTRIBUTE){
		sample['attr'] = newPred;
		if (!contains(sample, storage.dontUse) && (!contains(sample, storage.alwaysAttr)) && checksRule('attr', storage.alwaysAttr, sample)){
			storage.alwaysAttr.push(sample);
		}
	}
	mainMenu();
}

/**
*Display the main menu
*/
function mainMenu(){
	document.getElementById("current prediction").style.display = "none";
	document.getElementById("existing rules").style.display = "none";
	document.getElementById("add new rule").style.display = "none";
	document.getElementById("main menu").style.display = "block";
}

/**
*Display all existing rules for a prediction scenario.
* TO DO: do not display the rules when the prediction feature is empty
*/
var newList;
function existingRules(){
	storage.justTable = true;
	storage.trainingTable = [];
	let list = [];
	newList = [];
	let aceEditor = setupEditor();
	let codeFile = new CodeFile(aceEditor.getValue(), aceEditor.getCursorPosition());
	codeFile.tokenize();
	let pred = document.getElementById("existingRules").value;
	if (pred == "tag"){
		storage.predictionCase = PREDICTION_CASE.TAG;
		fillTable(storage.alwaysTag, "user");
		list = storage.alwaysTag.slice();
	} else if (pred == "attr"){
		storage.predictionCase = PREDICTION_CASE.ATTRIBUTE;
		fillTable(storage.alwaysAttr, "user");
		list = storage.alwaysAttr.slice();
	} else if (pred == "val"){
		storage.predictionCase = PREDICTION_CASE.VALUE;
		fillTable(storage.alwaysValue, "user");
		list = storage.alwaysValue.slice();
	}
	
	//gets all the rules from the document as if making a prediction.
	let syntaxTree = getAST(codeFile);
	extractFeatures(syntaxTree);
	for (let i=0; i < storage.trainingTable.length; i++){
		if ((!contains(storage.trainingTable[i], newList)) && (checksRule(pred, list, storage.trainingTable[i])) && storage.trainingTable[i]['tag'] != "" && storage.trainingTable[i]['attr'] != "" && storage.trainingTable[i]['val'] != ""){
			newList.push(storage.trainingTable[i]);
		}
	}
	
	document.getElementById("main menu").style.display = "none";
	document.getElementById("existing rules").style.display = "block";
	fillTable(newList, "document", pred);
	storage.justTable = false;
}


var pred1;
function fillTable(list, type, pred){
	pred1 = pred;
	let table;
	if (type == "user"){
		table = document.getElementById("table1");
	} else if (type == "document"){
		table = document.getElementById("table2");
	}
	if (list.length > 0){
		table.innerHTML = "";
		let keys = Object.keys(list[0]);
		for (let x = 0; x < list.length; x++){
			let row = table.insertRow(x);
			let cell = row.insertCell(0);
			cell.innerHTML = x;
			let y = 1;
			for (let key in keys){
				cell = row.insertCell(y);
				cell.innerHTML = keys[key] + ": " + list[x][keys[key]];
				y++;
			}
			cell = row.insertCell(y);
			cell.innerHTML = '<button id="' + x + '" onclick="deleteRule(this)">do not use</butoon>';
		}
	}
}

function deleteRule(cell){
	let index = cell.id;
	let pred = pred1;
	let table = cell.parentNode.parentNode.parentNode.parentNode.id;
	let sample;
	if (table == "table2"){
		sample = newList[index];
	} else if (pred == 'tag'){
		sample = storage.alwaysTag[index];
		deleteEntry(storage.alwaysTag, sample);
	}else if (pred == 'attr'){
		sample = storage.alwaysAttr[index];
		deleteEntry(storage.alwaysAttr, sample);
	}else if ( pred == 'val'){
		sample = storage.alwaysValue[index];
		deleteEntry(storage.alwaysValue, sample);
	}
	storage.dontUse.push(sample);
	console.log(storage.dontUse);
}

/**
* Shows the relevant features for the user to add a new rule
*/
function addNew(){
	document.getElementById("main menu").style.display = "none";
	document.getElementById("add new rule").style.display = "block";
	document.getElementById("newNotValid").style.display = "none";
	let target = document.getElementById("addNewRule").value;
	if (target == "tag"){
		document.getElementById("1").style.display = "block";
		document.getElementById("2").style.display = "block";
		document.getElementById("3").style.display = "block";
		document.getElementById("4").style.display = "none";
		document.getElementById("5").style.display = "none";
	} else if (target == "attr"){
		document.getElementById("1").style.display = "block";
		document.getElementById("2").style.display = "block";
		document.getElementById("3").style.display = "block";
		document.getElementById("4").style.display = "block";
		document.getElementById("5").style.display = "none";
	} else if (target == "val"){
		document.getElementById("1").style.display = "block";
		document.getElementById("2").style.display = "block";
		document.getElementById("3").style.display = "block";
		document.getElementById("4").style.display = "block";
		document.getElementById("5").style.display = "block";
	}
}
	
/**
* Adds the new rule to the respective always use array, 
* only if it's not on the dontUse array
*/
function addRule(){
	let target = document.getElementById("addNewRule").value; 
	let rule;
	if (target == "tag"){
		rule = {'parentTag':document.getElementById("parentTag").value, 'parentAttr/Val':document.getElementById("parentAttr/Val").value, 'tag':document.getElementById("tag").value};
		if (!contains(rule, storage.dontUse) && (!contains(rule, storage.alwaysTag)) && checksRule('tag', storage.alwaysTag, rule) && rule['tag'] != ""){
			storage.alwaysTag.push(rule);
			console.log(storage.alwaysTag);
		}else{
			document.getElementById("newNotValid").style.display = "block";
			return;
		}
	} else if (target == "attr"){
		rule = {'tag':document.getElementById("tag").value, 'parentTag':document.getElementById("parentTag").value, 'parentAttr/Val':document.getElementById("parentAttr/Val").value, 'attr':document.getElementById("attr").value};
		if (!contains(rule, storage.dontUse) && (!contains(rule, storage.alwaysAttr)) && checksRule('attr', storage.alwaysAttr, rule) && rule['tag'] != "" && rule['attr'] != ""){
			storage.alwaysAttr.push(rule);
			console.log(storage.alwaysAttr);
		}else{
			document.getElementById("newNotValid").style.display = "block";
			return;
		}
	} else if (target == "value"){
		rule = {'tag':document.getElementById("tag").value, 'attr':document.getElementById("attr").value, 'parentTag':document.getElementById("parentTag").value, 'parentAttr/Val':document.getElementById("parentAttr/Val").value, 'val':document.getElementById("value").value};
		if (!contains(rule, storage.dontUse) && (!contains(rule, storage.alwaysValue)) && checksRule('val', storage.alwaysValue, rule) && rule['tag'] != "" && rule['attr'] != "" && rule['val'] != ""){
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
