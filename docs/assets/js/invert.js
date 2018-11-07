const container = document.getElementById("container-demo");
const ul = container.firstElementChild;

const selectable = new Selectable({
	appendTo: ul,
	lasso: {
		borderColor: "#fff",
		backgroundColor: "rgba(255, 255, 255, 0.2)"
	}
});


const frag = document.createDocumentFragment();
for ( let i = 0; i < 32; i++ ) {
	const li = document.createElement("li");
	li.classList.add("ui-selectable");
	frag.appendChild(li);
}
ul.appendChild(frag);

selectable.add(ul.children);
selectable.select([9,10,11,12,13,14,17,18,19,20,21,22]);