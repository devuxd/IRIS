function handleFiles(e) {
    storage.aceEditor.focus();
    let file = e.target.files[1];
    let reader = new FileReader();
    reader.addEventListener('load', function (e) {
        handleFileText(e.target.result);
    });
    reader.readAsText(file);
}

const PERCENT = 1.0;
const seed = 42;
let RNG = function (s) {
    return function () {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
};
let rng = RNG(seed);

let strict = 0;
let total = 0;
let partial = 0;

let fileText = '';
let flexibleAST = {};

function handleFileText(text) {
    himalaya.parseDefaults.includePositions = true;
    fileText = himalaya.stringify(himalaya.parse(text));
    flexibleAST = himalaya.parse(fileText);
    storage.aceEditor.setValue(fileText, -1);
    for (let node of flexibleAST) handleNode(node, flexibleAST);

    console.log(strict + " " + partial + " " + total);
}

function handleNode(node, parent) {
    if (node.type !== 'element') return;
    if (rng() < PERCENT) testNode(node, parent);
    for (let child of node.children) handleNode(child, node);
}

function testNode(node, parent) {
    let info = extractInfo(node, parent);
    testPrediction(node, parent, info.row, info.col);
    console.log("INFO: " + JSON.stringify(info));
    if (info.tag === storage.predictionList[0]) strict++;   // doesn't account for basic removal
    if (storage.predictionList.includes(info.tag)) partial++;
    if (info.parentTag !== storage.sampleFeatures.parentTag) {
        console.log("Incorrect sampling: " + storage.sampleFeatures.parentTag);
    }
    total++;
    console.log('---------------------------');
}

function extractInfo(node, parent) {
    let tag = node.tagName;
    let parentTag = parent.tagName ? parent.tagName : '';
    let parentAttr = '', parentVal = '';
    if (parent.attributes && parent.attributes.length > 0) {    // Only one pair
        parentAttr = parent.attributes[0].key;
        parentVal = parent.attributes[0].value;
    }
    let row = node.position.start.line;
    let col = node.position.start.column;
    return {tag:tag, parentTag:parentTag, parentAttr:parentAttr, parentVal:parentVal, row:row, col:col};
}

function testPrediction(node, parent, row, col) {
    let parentEntity = parent.children ? parent.children : parent;
    let nodeIndex = parentEntity.indexOf(node);

    parentEntity.splice(nodeIndex, 1);
    makeEdit(row, col);
    storage.aceEditor.gotoLine(row + 1, col + 1);

    handleKey('<');

    parentEntity.splice(nodeIndex, 0, node);
    storage.aceEditor.setValue(fileText, -1);
    storage.aceEditor.gotoLine(row + 1, col);
}

function makeEdit(row, col) {
    let lines = himalaya.stringify(flexibleAST).split("\n");
    lines[row] = lines[row].substring(0, col) + '<' + lines[row].substring(col);
    storage.aceEditor.setValue(lines.join("\n"), -1);
}