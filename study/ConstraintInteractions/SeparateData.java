import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

/*
 * This program creates a training set and testing set from 100 web-sites html source code.
 * It also creates an answer for the testing set.
 * */
public class SeparateData {
	
	private BufferedWriter trainingSetWriter = null;
	private BufferedWriter attrTestingSetWriter = null;
	private BufferedWriter attrAnswerWriter = null;
	private BufferedWriter groupAnswerWriter = null;
	private BufferedWriter groupTestingSetWriter = null;
	
	private String fileHtml;
	private Document doc[] = null;
	private int attrlineCounter = 1;
	private int grouplineCounter = 1;
	
	// To know when the training and testing data of a specific html page has ended.
	private String diviser = "\n\n\n#######################################################"
			+ "#######################################################\n";

	public void createSets() {
		try {
			doc = readFiles();
			trainingSetWriter = new BufferedWriter(new FileWriter("TrainingSet.text"));

			attrTestingSetWriter = new BufferedWriter(new FileWriter("AttrTestingSet.text"));
			attrAnswerWriter = new BufferedWriter(new FileWriter("AttrAnswers.text"));

			groupTestingSetWriter = new BufferedWriter(new FileWriter("GroupTestingSet.text"));
			groupAnswerWriter = new BufferedWriter(new FileWriter("GroupsAnswers.text"));

			for (int i = 0; i < doc.length; i++) {
				// Using jsoup to parse the html code.
				fileHtml = "";
				// Preprocessing the html file.
				doc[i].select("script, style, #comment").remove();// Removing scripts comments and styles.
				doc[i].select("[style]").removeAttr("style");
				doc[i].select("[comment]").removeAttr("comment");
				Elements body = doc[i].getElementsByTag("body");// Getting just the body of the html file.
				Elements elements = body.select("*");// All elements on html file.
				int elementToRemove = (int) (elements.size() / (elements.size() * .3));// 0.2 of elements(with their
																						// child) will be for testing.
				// Adding the name of the html file to the training and testing data.
				String filename = doc[i].baseUri().replaceAll(".*http", "");
				attrTestingSetWriter.write(filename + "\n");
				attrAnswerWriter.write(filename + "\n");

				groupTestingSetWriter.write(filename + "\n");
				groupAnswerWriter.write(filename + "\n");

				trainingSetWriter.write(filename + "\n");

				// To create testing and training data with testing answers.
				int elementCounter = 0;
				for (Element element : elements) {
					size = 0;
					if(!element.tagName().equals("body")) {
						size(element);// Gets the size of the element.
						if (elementCounter <= 500) {// Only up to 800 elements total (including children).
							elementCounter += size;// Counts all elements.
							// To create the training set.
							createTrainingSet(element);
							if (elementCounter++ % elementToRemove == 0) {
								if (maxChild(element)) {
									// Creates testing set and answers for attributes.
									createAttrTesting_AnswerSets(element);
									// Creates testing set and answers for groups of elements.
									createGroupTesting_AnswerSets(element);
								}
							}
						}
					}
					elementCounter++;
				}
				attrlineCounter = 1;
				grouplineCounter = 1;

				trainingSetWriter.write(diviser);
				System.out.println(
						"Training set for file " + doc[i].baseUri().replaceAll(".*http", "") + " has been created.");

				attrAnswerWriter.write(diviser);
				attrTestingSetWriter.write(diviser);
				groupAnswerWriter.write(diviser);
				groupTestingSetWriter.write(diviser);
				System.out.println("Testing set and Answers for file " + doc[i].baseUri().replaceAll(".*http", "")
						+ " has been created.");
			}
			trainingSetWriter.close();
			attrTestingSetWriter.close();
			attrAnswerWriter.close();
			groupTestingSetWriter.close();
			groupAnswerWriter.close();

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	int size;

	/*
	 * Recursive function that makes sure every to get the size of an element.
	 */public boolean size(Element elements) {
		if (elements.children().size() == 0)
			return false;
		for (Element el : elements.children()) {
			size++;
			size(el);
		}
		return true;
	}

	/*
	 * Recursive function that makes sure every child of the element does not have
	 * more than 8 children. This is to shorten the testing set data.
	 */public boolean maxChild(Element elements) {
		if (elements.children().size() > 10)
			return false;
		for (Element el : elements.children()) {
			if (el.children().size() > 10)
				return false;
			if (el.children().size() >= 1)
				if (!maxChild(el))
					return false;
		}
		return true;
	}

	// Getting all html files using jsoup.
	public Document[] readFiles() throws Exception {
		String htmlDir = "websitesHTML";
		Document[] allHtml = new Document[100];
		File dir = new File(htmlDir);
		File[] htmlFiles = dir.listFiles();
		int i = 0;
		for (File html : htmlFiles) {
			if (i == 100)// Only testing 100 html files.
				break;
			if (html.isFile()) {
				allHtml[i++] = Jsoup.parse(html, "UTF-8", html.getAbsolutePath());
			}
		}
		return allHtml;
	}

	// Creating the Training Set
	public void createTrainingSet(Element element) throws Exception {
		trainingSetWriter.newLine();
		trainingSetWriter.write(element.toString());
	}

	/*
	 * This creates a testing set and a answer file for testing the how well the
	 * editor can recommend attributes of an element, or attribute values for a
	 * specific attribute type.
	 */public void createAttrTesting_AnswerSets(Element element) throws Exception {
		if (element.attributes().size() <= 5) {
			for (Attribute attr : element.attributes()) {
				attrTestingSetWriter.newLine();
				attrAnswerWriter.newLine();
				attrTestingSetWriter.write(attrlineCounter + " attr key: <" + element.tagName() + " " + attr.getKey());
				attrAnswerWriter.write(attrlineCounter++ + " attr value: " + attr.getValue());
			}
		} else if (element.attributes().size() > 5) {
			attrTestingSetWriter.newLine();
			attrAnswerWriter.newLine();
			attrTestingSetWriter.write(attrlineCounter + " Element tag: <" + element.nodeName());
			attrAnswerWriter.write(attrlineCounter++ + " Element: "
					+ element.toString().replaceAll("<", "").replaceAll(element.nodeName(), ""));
		}
		if (element != null && element.parent() != null) {
			element.remove();
		}
	}

	/*
	 * This creates a testing set and a answer file for testing how well the editor
	 * can recommend the children for an element.
	 */public void createGroupTesting_AnswerSets(Element element) throws Exception {
		if (element.children().size() > 1) {
			groupTestingSetWriter.newLine();
			groupAnswerWriter.newLine();
			groupAnswerWriter.write(grouplineCounter + " Element children: " + element.children().toString() + "\n");
			element.children().remove();
			String elementString = element.toString().replaceAll("</.*>", "").replaceAll("\n", "") + "\n";
			groupTestingSetWriter.write(grouplineCounter++ + " Element no children: " + elementString);
		}
		if (element != null && element.parent() != null) {
			element.remove();
		}
	}

	public static void main(String[] args) {
		SeparateData sd = new SeparateData();
		sd.createSets();
	}
}
