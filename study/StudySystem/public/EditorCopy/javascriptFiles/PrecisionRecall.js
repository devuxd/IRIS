/*
 * COMPUTES PRECISION AND RECALL AT K = 20.
 * FORMULA USED IS P = # RELEVANT WORDS / # OF WORDS UP TO K
 *                 R = # RELEVANT WORDS / # OF ALL WORDS
 * MORE DETAILS ABOUT THIS METRIC CAN BE FOUND ON THE
 * README FILE OF THIS DIRECTORY.
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
      values = values.replace(/,/g, " ");
      attrOutput.push(["Precision:, "+values+","+tempPrecision]);
      attrOutput.push(["Recall:, "+values+","+tempRecall]);

      tempPrecision = [];
      tempRecall = [];
      relevant = 0;
    }
    return attrOutput;
  }
}