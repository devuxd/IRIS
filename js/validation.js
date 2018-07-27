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
        predTag:0,
        wholeTag:0,
        t1Tag:0,
        t3Tag:0,
        t5Tag:0,
        predAttr:0,
        wholeAttr:0,
        t1Attr:0,
        t3Attr:0,
        t5Attr:0,
        predVal:0,
        wholeVal:0,
        t1Val:0,
        t3Val:0,
        t5Val:0,
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
    log(JSON.stringify(acc, null, 4));
    log('TAG ACCURACIES');
    log('Tag T1 Whole: ' + acc.t1Tag/acc.wholeTag);
    log('Tag T3 Whole: ' + acc.t3Tag/acc.wholeTag);
    log('Tag T5 Whole: ' + acc.t5Tag/acc.wholeTag);
    log('Tag T1 Pred: ' + acc.t1Tag/acc.predTag);
    log('Tag T3 Pred: ' + acc.t3Tag/acc.predTag);
    log('Tag T5 Pred: ' + acc.t5Tag/acc.predTag);
    log('ATTR ACCURACIES');
    log('Attr T1 Whole: ' + acc.t1Attr/acc.wholeAttr);
    log('Attr T3 Whole: ' + acc.t3Attr/acc.wholeAttr);
    log('Attr T5 Whole: ' + acc.t5Attr/acc.wholeAttr);
    log('Attr T1 Pred: ' + acc.t1Attr/acc.predAttr);
    log('Attr T3 Pred: ' + acc.t3Attr/acc.predAttr);
    log('Attr T5 Pred: ' + acc.t5Attr/acc.predAttr);
    log('VAL ACCURACIES');
    log('Val T1 Whole: ' + acc.t1Val/acc.wholeVal);
    log('Val T3 Whole: ' + acc.t3Val/acc.wholeVal);
    log('Val T5 Whole: ' + acc.t5Val/acc.wholeVal);
    log('Val T1 Pred: ' + acc.t1Val/acc.predVal);
    log('Val T3 Pred: ' + acc.t3Val/acc.predVal);
    log('Val T5 Pred: ' + acc.t5Val/acc.predVal);

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
    log("INFO: " + JSON.stringify(info, null, 4));

    // Sampling Checker
    if (info.parentTag !== storage.sampleFeatures.parentTag) log("Incorrect sampling: " + storage.sampleFeatures.parentTag);

    // Tag
    testTagPrediction(node, parent, info.row, info.col);
    if (!storage.predictionSet.has('')) {
        let tagPreds = Array.from(storage.predictionSet);
        if (info.tag === tagPreds[0]) {
            acc.t1Tag++;
            log('+1 Tag T1 ' + info.tag);
        } else {
            log('0 Tag T1 ' + info.tag);
        }
        if (tagPreds.slice(0, 3).includes(info.tag)) {
            acc.t3Tag++;
            log('+1 Tag T3 ' + info.tag);
        } else {
            log('0 Tag T3 ' + info.tag);
        }
        if (tagPreds.slice(0, 5).includes(info.tag)) {
            acc.t5Tag++;
            log('+1 Tag T5 ' + info.tag);
        } else {
            log('0 Tag T5 ' + info.tag);
        }
        acc.predTag++;
    }
    acc.wholeTag++;

    // Attribute
    let attrs = node.attributes;
    if (!_.isEmpty(attrs)) {
        testAttrPrediction(node, parent, info.row, info.col);
        if (!storage.predictionSet.has('')) {
            let attrPreds = Array.from(storage.predictionSet);
            for (let i = 0; i < attrs.length; i++) {
                if (attrs[i].key === attrPreds[i]) {
                    acc.t1Attr++;
                    log('+1 Attr T1 ' + attrs[i].key);
                } else {
                    log('0 Attr T1 ' + attrs[i].key);
                }
                if (attrPreds.slice(0, 3).includes(attrs[i].key)) {
                    acc.t3Attr++;
                    log('+1 Attr T3 ' + attrs[i].key);
                } else {
                    log('0 Attr T3 ' + attrs[i].key);
                }
                if (attrPreds.slice(0, 5).includes(attrs[i].key)) {
                    acc.t5Attr++;
                    log('+1 Attr T5 ' + attrs[i].key);
                } else {
                    log('0 Attr T5 ' + attrs[i].key);
                }
                acc.predAttr++;
                acc.wholeAttr++;
            }
        } else {
            acc.wholeAttr++;
        }
    }

    // Value
    for (let i = 0; i < attrs.length; i++) if (attrs[i].value === null) attrs.splice(i--, 1);
    if (!_.isEmpty(attrs)) {
        for (let i = 0; i < attrs.length; i++) {
            let attr = attrs[i].key;
            testValPrediction(node, parent, info.row, info.col, attr);
            if (!storage.predictionSet.has('')) {
                let valPreds = Array.from(storage.predictionSet);
                for (let i = 0; i < attrs.length; i++) {
                    if (attrs[i].value === valPreds[i]) {
                        acc.t1Val++;
                        log('+1 Val T1 ' + attrs[i].key + "," + attrs[i].value);
                    } else {
                        log('0 Val T1 ' + attrs[i].key + "," + attrs[i].value);
                    }
                    if (valPreds.slice(0, 3).includes(attrs[i].value)) {
                        acc.t3Val++;
                        log('+1 Val T3 ' + attrs[i].key + "," + attrs[i].value);
                    } else {
                        log('0 Val T3 ' + attrs[i].key + "," + attrs[i].value);
                    }
                    if (valPreds.slice(0, 5).includes(attrs[i].value)) {
                        acc.t5Val++;
                        log('+1 Val T5 ' + attrs[i].key + "," + attrs[i].value);
                    } else {
                        log('0 Val T5 ' + attrs[i].key + "," + attrs[i].value);
                    }
                    acc.predVal++;
                    acc.wholeVal++;
                }
            } else {
                acc.wholeVal++;
            }
        }

        log('---------------------------');
    }

}

function extractInfo(node, parent) {
    let tag = node.tagName;
    let attrs = node.attributes;
    let parentTag = parent.tagName ? parent.tagName : '';
    let parentAttr = '', parentVal = '';
    if (parent.attributes && parent.attributes.length > 0) {    // Only one pair
        parentAttr = parent.attributes[0].key;
        parentVal = parent.attributes[0].value;
    }
    let row = node.position.start.line;
    let col = node.position.start.column;
    return {tag:tag, attrs:attrs, parentTag:parentTag, parentAttr:parentAttr, parentVal:parentVal, row:row, col:col};
}

function testTagPrediction(node, parent, row, col) {
    let parentEntity = parent.children ? parent.children : parent;
    let nodeIndex = parentEntity.indexOf(node);

    parentEntity.splice(nodeIndex, 1);
    makeEdit(row, col, '<');
    storage.aceEditor.gotoLine(row + 1, col + 1);

    handleKey('<', storage.aceEditor, null);

    parentEntity.splice(nodeIndex, 0, node);
    storage.aceEditor.setValue(fileText, -1);
    storage.aceEditor.gotoLine(row + 1, col);
}

function testAttrPrediction(node, parent, row, col) {
    let parentEntity = parent.children ? parent.children : parent;
    let nodeIndex = parentEntity.indexOf(node);
    let tag = node.tagName;

    parentEntity.splice(nodeIndex, 1);
    makeEdit(row, col, '<' + tag + ' ');
    storage.aceEditor.gotoLine(row + 1, col + 1 + tag.length + 1);

    handleKey(' ', storage.aceEditor, null);

    parentEntity.splice(nodeIndex, 0, node);
    storage.aceEditor.setValue(fileText, -1);
    storage.aceEditor.gotoLine(row + 1, col);
}

function testValPrediction(node, parent, row, col, attr) {
    let parentEntity = parent.children ? parent.children : parent;
    let nodeIndex = parentEntity.indexOf(node);
    let tag = node.tagName;

    parentEntity.splice(nodeIndex, 1);
    makeEdit(row, col, '<' + tag + ' ' + attr + ' ');
    storage.aceEditor.gotoLine(row + 1, col + 1 + tag.length + 1 + attr.length + 1);

    handleKey(' ', storage.aceEditor, null);

    parentEntity.splice(nodeIndex, 0, node);
    storage.aceEditor.setValue(fileText, -1);
    storage.aceEditor.gotoLine(row + 1, col);
}

function makeEdit(row, col, edit) {
    let lines = himalaya.stringify(flexibleAST).split("\n");
    lines[row] = lines[row].substring(0, col) + edit + lines[row].substring(col);
    storage.aceEditor.setValue(lines.join("\n"), -1);
}