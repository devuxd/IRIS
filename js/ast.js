var training = [];
var json = "";
var str = "";

/**
*Builds AST
*/
function buildtree(codeFile) {
	training = [];
	const html = clean(codeFile);
	json = himalaya.parse(html);
	json = removeWhitespace(json);
}

function extractFeatures() {
    for (let node of json) {
        extract(node, predict, '', '', '');
    }
}

function clean(codeFile) {
    let code = codeFile.code;
    let lines = code.split("\n");
    let text = lines[codeFile.position.row];
    let newText = text.substring(0, codeFile.starter) + text.substring(codeFile.position.column);   // without < to cursor
    str = text.substring(codeFile.starter+1, codeFile.position.column);
    lines[codeFile.position.row] = newText + "<>";  // gets rid of incomplete, adds branding to end of line
    return lines.join("\n");
}

/**
*Gets the features needed to make a prediction
*/
function getsample(predict, parentTag, parentAttr, parentVal){
	var parentAttrVal = parentAttr + "=" + parentVal;
	if (parentAttrVal === '=') parentAttrVal = '';
	if (predict === PREDICT.ATTRIBUTE) {
		var tag = str.split(" ")[0];
		document.sample = {'tag': tag, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal};
	} else if (predict === PREDICT.VALUE){
		var tag = str.split(" ")[0];
		var attr = str.split(" ")[1].split('=')[0];
		document.sample = {'tag': tag, 'attr': attr, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal};
	} else if (predict === PREDICT.TAG){
		document.sample = {'parentTag':parentTag, 'parentAttr/Val':parentAttrVal};
	}
	
}

/**
*Depending on the scenario, it gets all the information necessary
*from the AST to build the training set for the decision tree
*/
function extract(node, predict, parentTag, parentAttr, parentVal) {
	if (typeof (node['content']) !== "undefined" && node['content'].includes("<>")){
		getsample(predict, parentTag, parentAttr, parentVal);
	}
	
    if (node.type !== 'element') return;

    let tag = node.tagName;
    let parentAttrVal = parentAttr + "=" + parentVal;
    if (parentAttrVal === '=') parentAttrVal = '';
    let attr = (node.attributes.length > 0) ? node.attributes[0].key : '';
    let val = (node.attributes.length > 0) ? node.attributes[0].value : '';   // TODO : Empty attribute fix

    if (predict == PREDICT.ATTRIBUTE || predict == PREDICT.VALUE) {
        if (predict == PREDICT.VALUE) {
            store_val(tag, attr, val, parentTag, parentAttrVal);
        } else {
            store_attr(tag, attr, parentTag, parentAttrVal);
        }
    } else {
        store_tag(tag, parentTag, parentAttrVal);
    }
    for (let child of node.children) extract(child, predict, tag, attr, val);
}

function store_tag(tag, parentTag, parentAttrVal) {
    training.push({'tag':tag, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal});
}

function store_attr(tag, attr, parentTag, parentAttrVal) {
    training.push({'tag':tag, 'attr':attr, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal});
}

function store_val(tag, attr, val, parentTag, parentAttrVal) {
    training.push({'tag':tag, 'attr':attr, 'val':val, 'parentTag':parentTag, 'parentAttr/Val':parentAttrVal});
}
