const container = document.getElementById("container-demo");
const ul = container.firstElementChild;
const frag = document.createDocumentFragment();


for ( let i = 0; i < 8; i++ ) {
	const li = document.createElement("li");
	li.className = "ui-selectable";

	if ( i > 3 ) {
		li.className = "orphan";
	}

	frag.appendChild(li);
}

ul.appendChild(frag);

const selectable = new Selectable({
	appendTo: ul,
	lasso: {
		borderColor: "#fff",
		backgroundColor: "rgba(255, 255, 255, 0.2)"
	}
});