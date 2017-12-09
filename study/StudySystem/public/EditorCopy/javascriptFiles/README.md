### This directory contains all local JavaScript files that forms the HTML editor and some JavaScript files that allows the editor to be tested.
	   

|Files      					 						|Contents
|:------------------------------------------------------|:------------------------------------------------------------------|
|editor.js 												| This is where the editor is created, it also makes the calls to different functions that are incharge of tokenazing the HTML and creating the autocompletes. In order to test the editor in the backend, this file contains a snppet code that creates an instance of the autocomplete. This snippet is not only requiered to test the editor using node.js.
|														|								     								|
|createTable.js 										| This creates a table using Maps that contains all all the elements that the user has written.
|														|								     								|
|attributesTokenization.js  							| This contains the function that tokenizes the attributes of the users HTML code and creates a list of attributes to use on the outocompletes.
|														|								     								|
|groupTokenization.js 									| TODO: This will tokenize the users HTML code and create a list of group/block of elements to use on the autocompletes.
|														|								     								|
|elementTokenization.js  								| This contains the function that tokenizes the attributes of the users HTML code and creates a list of elements to use on the outocompletes.
|														|								     								|
|RunEditor.js 											| This uses Node.js and jsdom to run the editor on the backend and perform the study of the editor to test its performance. Currently, it only test attributes using the function testAttributes(fileTrain, fileTest, answers, dom).
|								     					|																	|
|testAttributes.js  									| This performs the attribute testing by comparing the attribute testing set with the attribute answer file.
|								     					|																	|
|PrecisionRecall.js  									| This contains the function that evaluates the performance of the editor using the metric Precision and Recall at K. Precision is defined as fraction of retrieved documents that are relevant, Recall is defined as fraction of relevant documents that are successfully retrieved. Precision and Recall at K are used to evaluate systems that work with ordered ranked items (in this case, the autocompletes). The formula used to calculate the Recision and Recall at K are the following: <br />&emsp;&emsp; - p = # relevant words / # of words up to k <br />&emsp;&emsp; - r = # relevant words / # of all words <br />More information about precision and recall can be found here:<br />&emsp;&emsp; - https://en.wikipedia.org/wiki/Precision_and_recall <br />More information about precision and recall at K can be found here:<br />&emsp;&emsp; - http://sdsawtelle.github.io/blog/output/mean-average-precision-MAP-for-recommender-systems.html <br />&emsp;&emsp; - https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html.
|								     					|																	|
|EvaluateTest.js  									    | This performs the evaluation of the study by collecting all the precisions and recall and calculating their average according to the html source file they belong to. It also creates a graph with the resulting data.
