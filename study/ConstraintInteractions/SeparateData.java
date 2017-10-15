import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class SeparateData {
	BufferedWriter trainingSetWriter = null;
	BufferedWriter testingSetWriter = null;
	BufferedWriter answerBW = null;
	String fileHtml;
	Document doc[] = null;
	int lineCounter = 1;
	public void createTrainingSet(){
		try {			
			doc = readFiles();
			trainingSetWriter = new BufferedWriter(new FileWriter("TrainingSet.text"));
			testingSetWriter = new BufferedWriter(new FileWriter("TestingSet.text"));
			answerBW = new BufferedWriter(new FileWriter("TestAnswers.text"));
			for (int i=0; i<doc.length; i++) {
				fileHtml = "";
				doc[i].select("script, style, #comment").remove();//Removing scripts comments and styles.
				doc[i].select("#comment").remove();
				doc[i].select("[style]").removeAttr("style");
				doc[i].select("[comment]").removeAttr("comment");
				Elements body = doc[i].getElementsByTag("body");//Getting just the body of the html file.
				
				Elements elements = body.select("*");//All elements on html file.
				int lineNumber = 1;//To count total lines.
				int lineToRemove = (int) (elements.size()/(elements.size()*.06));//0.07 of elements(with their child) will be for testing.
				
			/* Getting all data for the testing set and testing set answer.
			 * Creates a file containing the testing set and another containing
			 * answers of the testing set.
			 * The answers contain the rest of the code that should be presented
			 * to the user as an auto-complete list.
			 */ testingSetWriter.write(lineCounter+" "+doc[i].baseUri().replaceAll(".*http", ""));
				answerBW.write(lineCounter+++" "+doc[i].baseUri().replaceAll(".*http", ""));
				for (Element element : elements) {
					if(lineNumber++%lineToRemove==0) {
						if(maxChild(element)) {
							if(element.attributes().size()<=5) {
								for(Attribute attr : element.attributes()) {
									testingSetWriter.newLine();
									answerBW.newLine();
									testingSetWriter.write(lineCounter +" attr key: "+attr.getKey());
									answerBW.write(lineCounter++ +" attr: "+attr.toString());
								}
							} if(element.attributes().size()>5) {
								testingSetWriter.newLine();
								answerBW.newLine();
								testingSetWriter.write(lineCounter+" Element tag: <"+element.nodeName());
								answerBW.write(lineCounter++ +" Element: "+element.toString());
							} if(element.children().size()>1) {
								testingSetWriter.newLine();
								answerBW.newLine();
								answerBW.write(lineCounter+" Element children: "+element.children().toString());
								element.children().remove();
								String elementString  = element.toString()
										.replaceAll("</.*>", "").replaceAll("\n", "");
								testingSetWriter.write(lineCounter++ +" Element no children: "+elementString);
							} if (element != null && element.parent() != null) {  
								element.remove();
							}
						}
					}
				}
				lineCounter = 1;
				answerBW.write("\n\n\n###################################################################################");
				testingSetWriter.write("\n\n\n###################################################################################");
				testingSetWriter.newLine();
				answerBW.newLine();
				
				//Getting all data for the training set.
				body.forEach((child)->getTraininsData(child));
				trainingSetWriter.newLine();
				trainingSetWriter.write(doc[i].baseUri().replaceAll(".*http", ""));
				trainingSetWriter.newLine();
				trainingSetWriter.write(fileHtml);
				trainingSetWriter.newLine();
				trainingSetWriter.write("\n\n\n###################################################################################");
			}
			trainingSetWriter.close();
			testingSetWriter.close();
			answerBW.close();
			System.out.println("Training and testing sets created.");
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	/*  Recursive function that makes sure every child
	 * of the element does not have more than 3 children.
	 * This is to shorten the testing set data.
	*/public boolean maxChild(Element elements) {
		if(elements.children().size()>3)
			return false;
		for(Element el:elements.children()){
			if(el.children().size()>3)
				return false;
			if(el.children().size()>1)
				if(!maxChild(el))
					return false;
		}
		return true;
	}
	//Function to help get training set data, add each child of body.
	public void getTraininsData(Element child) {
		String tag = child.nodeName();
		if(!tag.equals("scirpt")) {
			fileHtml+=child.toString();
		}
	}
	//Getting all html files.
	public Document[] readFiles() throws Exception{
	 	String htmlDir = "websitesHTML";
	 	Document [] allHtml = new Document[100];
        File dir = new File(htmlDir);
        File[] htmlFiles = dir.listFiles();
		int i=0;
        for (File html : htmlFiles) {
        		if(i==100)break;
            if(html.isFile()) {
	            allHtml[i++] = Jsoup.parse(html, "UTF-8", html.getAbsolutePath());
            } 
        }  
        return allHtml;
	 }
	public static void main(String[] args) {
		SeparateData sd = new SeparateData();
		sd.createTrainingSet();
	}
}