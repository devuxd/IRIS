### This directory contains all information related to a pilot study created to evaluated the HTML editor's functionality.


|Directory      					                              |Contents
|:------------------------------------------------------		  |:------------------------------------------------------------------ |
|ConstraintInteractions					                          | This contains a java project that creates a training data set, 
																	multiple testing data sets from the source code of 100 websites    
																	and answers for each of thouse testing data sets.   	     
|							                                      |								                                       |
|ConstraintInteractions/src/websitesHTML/          		      	  | This contains the source code of over 100 websites collected from 
																	https://moz.com/top500.                                            
|							                                      |								                                       |
|StudySystem							                          | This contains the engine that runs the the study using Node.js.	   |				
|	                                       						  |																	   |
|StudySystem/node_modules										  |	Contains all the libraries for Node.js							   |
|	                                       						  |																	   |
|StudySystem/public/EditorCopy									  |	Contains a copy of all the files that creates the editor, used to
																	test the editor in the engine.
|																  |						   											   |
|StudySystem/TestInputFiles	                                      |	Contains all the training, testing, and answers to use as input for
																	the engine to test the editor. It also contains a Readme file  that
																	explains the format and template of each testing set and its answers. 
																																	   |
|																								   

|Files      					 	                              |Contents
|:------------------------------------------------------		  |:------------------------------------------------------------------ |
|jsoup-1.10.3.jar   					                          |This is a HTML parser library used to extract and manipulate the							                                                  				data gathered from the websites source code. https://jsoup.org/
|							                                      |								                                       |
|moz.html 						                                  | This is the source code of the website https://moz.com/top500. The 							                                             				 source code contains the URLs to the top 500 websites ranked by the 							                                           				 number of linking root domains.
|							                                      |								                                       |
|script.sh 						                                  | This is a bash script that reads all the URLs from the source code on 								                                            		moz.com. It uses cURL to retrieve the websites of these URLs and 							                                               				saves 200 of these websites source code as HTML files.
|							                                      |								                                       |
|ConstraintInteractions/TrainingSet.txt			            	  | This is a text file containing the Training Set that will be used to 							                                           				 train the system that will test the editor's performance. The data 							                                             			 from this file has been collected from the source code of 100 								                                                				websites.					
|							                                      |								                                       |
|ConstraintInteractions/AttrTestingSet.txt			        	  | This is a text file containing the Testing Set that will be used to  							                                           				test the HTML editor's performance for attributes. The data from 
																	this file has been collected from the source code of 100 websites.
|ConstraintInteractions/AttrAnswerSet.txt			        	  | This is a text file containing the answers of the AttrTestingSet.txt.
|							                                      |								                                       |				
|ConstraintInteractions/GroupTestingSet.txt			        	  | This is a text file containing the Testing Set that will be used to  							                                           				test the HTML editor's performance for elements group. The data from 
																	this file has been collected from the source code of 100 websites.
|ConstraintInteractions/GroupAnswerSet.txt			        	  | This is a text file containing the answers of the GroupTestingSet.txt.
|													
|							                                      |								                                       |
|ConstraintInteractions/src/SeparateData.java  		      		  | This is the java program that will create the Training and Testing 							                                             				data sets.
|StudySystem/index.js						                      | Runs the engine to test the editor.
|							                                      |								                                       |

