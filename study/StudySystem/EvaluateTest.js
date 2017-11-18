module.exports = {
  precisionRecall: function eval(fileName){
  	var fs = require('fs');
	fileList =  fs.readFileSync(__dirname +"/"+fileName).toString().split("\n");
	for(var line of fileList){
		
	}
  }
}