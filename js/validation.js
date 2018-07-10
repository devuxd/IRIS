

function handleFiles(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.addEventListener('load', function (e) {
        handleFileText(e.target.result);
    });
    reader.readAsText(file);
}

function handleFileText(fileText) {
    storage.aceEditor.setValue(fileText, -1);
}

