/*
*
* Builds Decision Tree from AST-generated Training Table
* according to the type of code the user needs completed:
* Tag, Attribute or Value.
*
*/
function getDT() {
    storage.trainingTable = _(storage.trainingTable);
    if (storage.predictionCase == PREDICTION_CASE.ATTRIBUTE){
        return id3(storage.trainingTable,'attr',['tag', 'parentTag', 'parentAttr/Val']);
    } else if (storage.predictionCase == PREDICTION_CASE.VALUE){
        return id3(storage.trainingTable,'val',['tag', 'attr', 'parentTag', 'parentAttr/Val']);
    } else if (storage.predictionCase == PREDICTION_CASE.TAG){
        return id3(storage.trainingTable,'tag',['parentTag', 'parentAttr/Val']);
    }
}
