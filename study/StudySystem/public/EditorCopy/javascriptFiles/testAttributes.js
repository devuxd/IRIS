/*
 * THIS FUNCTION PERFORMS THE ATTRIBUTE TESTING BY COMPARING
 * THE ATTRTESTINGSET WITH THE ATTRANSWERS FILE. 
 * INPUTS ARE AND INDIVIDUAL HTML TRAIN FILE, TEST FILE,
 * ANSWER FILE, AND THE DOM OF THE EDITOR INSTANCE. 
*/
module.exports = {
    testAttributes: function testAttributes(fileTrain, fileTest, answers, dom, attrOutput, K, metric){
    //Getting all training and testing data.
      var linesTraining = fileTrain[1];
      var linesTesting = fileTest[1].split("\n");
      var answerList = answers[1].split("\n");
      var fileName = fileTrain[0];//Getting filename
      var answerLine = 0;
      var answer = [];
      var editorAnswer = [];

      attrOutput.push([" "]);
      attrOutput.push([fileName]);

      console.log(fileName);
      for(var line of linesTesting){//Through each testline to get all different autocompletes.
        if(typeof(line)!="undefined" && line!="" && line!=fileName){

          //Imputing the training and testing set to the editor.
          dom.window.document.editor.session.setValue(linesTraining+"\n"+line);
          //Simulating a keyup on the editor to get autocompletes.
          dom.window.document.editorSelector.keyup();
          //Contains the words that will be shown by the autocomplete.
          var rankedAutoComplete = dom.window.document.content;
          var outputtemp = "";

          answer.push(answerList[answerLine]);

          if(!rankedAutoComplete){
            attrOutput.push([line+", None"]);
            continue;
          }
          //This reads through the top 10 first answers of the autocompletes.
          console.time("Finding Editors Answer");
          for(var i in rankedAutoComplete){
            if(i > K) break;//only consider first 10 matches.
              if(outputtemp==""){
                 outputtemp+= line +": ,"+ rankedAutoComplete[i].value +" "
                                            + rankedAutoComplete[i].meta;
               } else {
                  outputtemp+= ","+ rankedAutoComplete[i].value +" "
                                  + rankedAutoComplete[i].meta;
              }
              editorAnswer.push(rankedAutoComplete[i].value);
          } 
          attrOutput.push([outputtemp]); 
          console.timeEnd("Finding Editors Answer");
        }answerLine++;
     }
     //To calculate precision and recall at K.
     console.time("Precision Recall");
     attrOutput = metric.precisionRecall(answer, editorAnswer, K, attrOutput);
     console.timeEnd("Precision Recall");
     return attrOutput;
  }
}