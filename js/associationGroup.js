/**
 * Currently working on this one. Does not work as intended yet. This will use
 * the association rule to create rules that will help populate the
 * auto-complete.
 * @return {void}
 */
function associationRule() {
	// Getting the body of the programmers html code.
	page.codePreviewBody.html(page.codeEditor.getValue());
	var elements = page.codePreviewBody.find("*");
	var support, total = elements.length;
	const minsup = 0.5;
	var frequent = [];
	var elementList = [];
	for (var element of elements) {
		elementList.push(element.tagName); //Will only start working with tags.
	}

	hierarchySearch(elementList, support, total, minsup, frequent, 1);
}


/**
 * TODO: Figure out what this does and fill in this documentation. Possibly
 * refactor to use less arguments, if possible.
 * @param elementList {}
 * @param support {}
 * @param total {}
 * @param minsup {}
 * @param frequent {}
 * @param nth {}
 * @return {void}
 */
function hierarchySearch(elementList, support, total, minsup, frequent, nth) {
	var hierachy, current = 0, ith = 0, path = [];
	for (var element of elementList) {
		hierachy = element.split(" ");
		if (hierachy.length > 1)
			console.log("More child");

		support = $("iframe#output").contents().find(element).length / total;
		if (support >= minsup) {
			frequent.push(element);
		}
	}
	elementList = [];
	ith++;
	for (var freq of frequent) {
		var temp = ithPath($("iframe#output").contents().find(freq), current, ith, path);
		elementList.push(temp);
	}
}


/**
 * TODO: Figure out what this does and document it. If it's not used, delete it.
 * @return {void}
 */
function ithPath(element, current, ith, path) {
	if (current == ith) return;
	// path.push(element.tagName);
	// ithPath(element.firstChild, current++, ith, path);
}