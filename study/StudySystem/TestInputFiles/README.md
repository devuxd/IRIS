### This directory contains the Training set, and different types of testing sets with a text file for an individual answers.
#### The following are templates for each testing set and it's answer file.


|Testing Attributes  					|Content Format
|:------------------------------------------------------|:------------------------------------------------------------------ |
| AttrTestingSet.text					|The first line contains the name of the html file. The rest of thelines contains either the description "attr key:" and the testing attributes type name without the value, or the description "Element tag:" and the tag of the element without the elements attributes. <br>Example:<br>faboutcom.html <br>1 attr key: class     <br>2 Element tag: <mask					                                               			  	 
|							|								     |
| AttrAnswers.text          		      		| The first line contains the name of the html file. The rest of the lines contains either the description "attr value:" and the testing attributes value without the type, or the description "Element:" and all of the attributes corresponding to the element on the same numbered line of the AttrTestingSet.text file. <br>Example:<br>aboutcom.html <br>1 attr value: primary-dash-nav-link <br>2 Element: id="related-mask-2" maskcontentunits="userSpaceOnUse" maskunits="objectBoundingBox" x="0" y="0" width="8" height="8" fill="white"> 
|
|							 |								     |
|							 |								     |

|Testing Groups of Elements      			|Content Format
|:------------------------------------------------------|:------------------------------------------------------------------ |
| GroupTestingSet.text					|The first line contains the name of the html file. The second line contains the description "Element no children:" and some elements of the html file without their children. <br>Example:<br> aboutcom.html <br>1 Element no children: \<div class="footer-col first">   
|							|								     |
| GroupAnswers.text          		      		| The first line contains the name of the html file. The second line contains the description "Element children:" and the children of the lements corresponding to element on the same line as in the GroupTestingSet.text file in the same line. <br>Example:<br>aboutcom.html <br>1 Element no children: \<div class="footer-col first">     
