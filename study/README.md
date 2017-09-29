##This directory contains all information related to a pilot study created to evaluated the HTML editor's functionality.


###Directory      					 		###Contents
--------------------------------			-----------------------------------------------------------------
* ConstraintInteractions					This contains a java project that creates a training data set and 
											a testing data set from the source code of 100 websites.

* ConstraintInteractions/websitesHtml/      This contains the source code of over 100 websites collected from
											[https://moz.com/top500](https://moz.com/top500).


###Files      					 	   	 	###Contents
--------------------------------			------------------------------------------------------------------
* jsoup-1.10.3.jar   						This is a HTML parser library used to extract and manipulate the 
											data gathered from the websites source code.

* moz.html 									This is the source code of the website [https://moz.com/top500](https://moz.com/top500).
											The source code contains the URLs to the top 500 websites ranked
											by the number of linking root domains.

* script.sh 								This is a bash script that reads all the URLs from the source code
											on moz.com. It uses cURL to retrieve the websites of these URLs and 
											saves 200 of these websites source code as HTML files.

* ConstraintInteractions/TrainingSet.txt	This is a text file containing the Training Set that will be used to
											train the system that will test the editor's performance. 
											The data from this file has been collected from the source code of 
											100 websites.											

* ConstraintInteractions/TestingSet.txt		This is a text file containing the Testing Set that will be used to
											test the HTML editor's performance. The data from this file	has 
											been collected from the source code of 100 websites.

* ConstraintInteractions/SeparateData.java  This is the java program that will create the Training and 
											Testing data sets.


