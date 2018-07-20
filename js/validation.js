const PERCENT = 1.0;
const seed = 42;
let RNG = function (s) {
    return function () {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
};
let rng = RNG(seed);
let acc, fileText, flexibleAST;
let iter, files;
let logContent = [];

function resetVars() {
    acc = {
        predTotal:0,
        strictTag:0,
        partialTag:0,
        wholeTotal:0,
    };
    fileText = '';
    flexibleAST = {};
}

function log(content) {
    console.log(content);
    logContent.push(content);
    logContent.push('\r\n');
}

function read(e) {
    resetVars();
    handleFileText(e.target.result);
    log('============');
    log('============');
    log('FINISHED ' + iter);
    log(JSON.stringify(acc));
    log('Predicts Correctly: ' + acc.strictTag/acc.wholeTotal);
    log('Suggests Correctly: ' + acc.partialTag/acc.wholeTotal);
    log('Predictions Correct: ' + acc.strictTag/acc.predTotal);
    log('Suggestions Correct: ' + acc.partialTag/acc.predTotal);
    log('============');
    log('============');
    if (iter === files.length-1) {
        let a = document.getElementById("downloadLink");
        let logFile = new Blob(logContent, {type: 'text/plain'});
        a.href = URL.createObjectURL(logFile);
        a.download = new Date().toLocaleString();
    }
    else {
        iter++;
        let reader = new FileReader();
        reader.addEventListener('load', read);
        reader.readAsText(files[iter]);
    }
}

function handleFiles(e) {
    files = e.target.files;
    iter = 0;
    let reader = new FileReader();
    reader.addEventListener('load', read);
    reader.readAsText(files[iter]);
}

function handleFileText(text) {
    storage.aceEditor.focus();
    himalaya.parseDefaults.includePositions = true;
    fileText = himalaya.stringify(himalaya.parse(text));
    flexibleAST = himalaya.parse(fileText);
    storage.aceEditor.setValue(fileText, -1);
    for (let node of flexibleAST) handleNode(node, flexibleAST);
}

function handleNode(node, parent) {
    if (node.type !== 'element') return;
    testNode(node, parent);
    for (let child of node.children) handleNode(child, node);
}

function testNode(node, parent) {
    let info = extractInfo(node, parent);
    testPrediction(node, parent, info.row, info.col);
    log("INFO: " + JSON.stringify(info));
    if (info.tag === Array.from(storage.predictionSet)[0]) acc.strictTag++;
    if (storage.predictionSet.has(info.tag)) acc.partialTag++;
    if (info.parentTag !== storage.sampleFeatures.parentTag) log("Incorrect sampling: " + storage.sampleFeatures.parentTag);
    acc.wholeTotal++;
    if (!storage.predictionSet.has('')) acc.predTotal++;
    log('---------------------------');
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