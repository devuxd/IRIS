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
				doc[i].select("script, style, #comment").remove();// Removing scripts comments and styles.
				doc[i].select("[style]").removeAttr("style");
				doc[i].select("[comment]").removeAttr("comment");
				Elements body = doc[i].getElementsByTag("body");// Getting just the body of the html file.
				Elements elements = body.select("*");// All elements on html file.
				int lineNumber = 1;// To count total lines.
				int lineToRemove = (int) (elements.size() / (elements.size() * .06));// 0.07 of elements(with their
				// child) will be for testing.
				attrTestingSetWriter.write(doc[i].baseUri().replaceAll(".*http", "") + "\n");
				attrAnswerWriter.write(doc[i].baseUri().replaceAll(".*http", "") + "\n");

				groupTestingSetWriter.write(doc[i].baseUri().replaceAll(".*http", "") + "\n");
				groupAnswerWriter.write(doc[i].baseUri().replaceAll(".*http", "") + "\n");

				// To create testing sets with answers of attributes set.
				for (Element element : elements) {
					if (lineNumber++ % lineToRemove == 0) {
						if (maxChild(element)) {
							// Creates testing set and answers for attributes.
							createAttrTesting_AnswerSets(element);
							// Creates testing set and answers for groups of elements.
							createGroupTesting_AnswerSets(element);
						}
					}
				}
				attrlineCounter = 1;
				grouplineCounter = 1;
				attrAnswerWriter.write(diviser);
				attrTestingSetWriter.write(diviser);
				groupAnswerWriter.write(diviser);
				groupTestingSetWriter.write(diviser);
				System.out.println("Testing set and Answers for file " + doc[i].baseUri().replaceAll(".*http", "")
						+ " has been created.");
				// To create the training set.
				createTrainingSet(body, i);
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

	/*
	 * Recursive function that makes sure every child of the element does not have
	 * more than 3 children. This is to shorten the testing set data.
	 */public boolean maxChild(Element elements) {
		if (elements.children().size() > 3)
			return false;
		for (Element el : elements.children()) {
			if (el.children().size() > 2)
				return false;
			if (el.children().size() >= 1)
				if (!maxChild(el))
					return false;
		}
		return true;
	}

	/*
	 * Helper function that helps get the training set data to add each child of the
	 * html body.
	 */public void getTraingData(Element child) {
		String tag = child.nodeName();
		if (!tag.equals("scirpt")) {
			fileHtml += child.toString();
		}
	}

	// Getting all html files using jsoup.
	public Document[] readFiles() throws Exception {
		String htmlDir = "websitesHTML";
		Document[] allHtml = new Document[100];
		File dir = new File(htmlDir);
		File[] htmlFiles = dir.listFiles();
		int i = 0;
		for (File html : htmlFiles) {
			if (i == 100)
				break;
			if (html.isFile()) {
				allHtml[i++] = Jsoup.parse(html, "UTF-8", html.getAbsolutePath());
			}
		}
		return allHtml;
	}

	// Creating the Training Set
	public void createTrainingSet(Elements body, int i) throws Exception {
		// Getting all data for the training set.
		body.forEach((child) -> getTraingData(child));
		trainingSetWriter.newLine();
		trainingSetWriter.write(doc[i].baseUri().replaceAll(".*http", "") + "\n");
		trainingSetWriter.write(fileHtml + "\n");
		trainingSetWriter.write(diviser);
		System.out.println("Training set for file " + doc[i].baseUri().replaceAll(".*http", "") + " has been created.");
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
				attrTestingSetWriter.write(attrlineCounter + " attr key: " + attr.getKey());
				attrAnswerWriter.write(attrlineCounter++ + " attr value: " + attr.getValue());
			}
		} else if (element.attributes().size() > 5) {
			attrTestingSetWriter.newLine();
			attrAnswerWriter.newLine();
			attrTestingSetWriter.write(attrlineCounter + " Element tag: <" + element.nodeName());
			attrAnswerWriter.write(attrlineCounter++ + " Element: " + element.toString()
													.replaceAll("<", "").replaceAll(element.nodeName(), ""));
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
