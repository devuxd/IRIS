/*
 * Computes precision and recall at K = 20.
 * formula used is p = # relevant words / # of words up to k
 *                 r = # relevant words / # of all words
 * More details about this metric can be found on the
 * readme file of this directory.
*/

module.exports = {
  precisionRecall: function precisionRecall(realValue, editorAnswer, K, attrOutput){
    var tempRecall = "", tempPrecision = "";
    var relevant = 0;
    var answer; 
    for(var values of realValue){
      for(var i=0; i<K; i++){
          answer = editorAnswer[i].replace(/.*= "/g, "");
          answer = answer.replace(/"/g,"");

          if(values.includes(answer)){
            relevant++;
          }
          if(tempRecall == "")
            tempRecall += relevant/K;
          else
            tempRecall += "," + (relevant/K);

          if(tempPrecision == "")
            tempPrecision +=  relevant/(i+1);
          else
            tempPrecision += "," + (relevant/(i+1));
      }
      //Adding results to the variable that will be use for the
      //scv output.
      attrOutput.push(["Precision:, "+values+","+tempPrecision]);
      attrOutput.push(["Recall:, "+values+","+tempRecall]);

      tempPrecision = [];
      tempRecall = [];
      relevant = 0;
    }
    return attrOutput;
  }
}