const container = document.getElementById("container-demo");
const ul = container.firstElementChild;

const selectable = new Selectable({
	appendTo: ul,
	toggle: true,
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