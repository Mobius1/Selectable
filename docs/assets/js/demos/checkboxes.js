const SELECTABLE = new Selectable({
	filter: ".item",
	ignore: "input",
	appendTo: "#items",
	toggle: true
});

const inputs = [...document.querySelectorAll("input")];

for ( const input of inputs ) {
	const item = input.closest(".item");
	
	// trigger selection / deselection on checkbox change
	input.onchange = e => {
		input.checked ? SELECTABLE.select(item) : SELECTABLE.deselect(item);
	}
	
	// select items already checked
	if ( input.checked ) {
		SELECTABLE.select(item);
	}
}

// check the checkbox when item is selected
SELECTABLE.on("selecteditem", (item) => {
	item.node.querySelector("input").checked = true;
});

// uncheck the checkbox when item is deselected
SELECTABLE.on("deselecteditem", (item) => {
	item.node.querySelector("input").checked = false;
});