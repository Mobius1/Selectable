const container = document.getElementById("container-demo");
const ul = container.firstElementChild;

const selectable = new Selectable({
	appendTo: ul,
	autoScroll: {
		increment: 10,
		threshold: 0
	},
	lasso: {
		borderColor: "#fff",
		backgroundColor: "rgba(255, 255, 255, 0.2)"
    },
    maxSelectable: 10
});


const frag = document.createDocumentFragment();
for ( let i = 0; i < 40; i++ ) {
	const li = document.createElement("li");
	li.classList.add("ui-selectable");
	frag.appendChild(li);
}
ul.appendChild(frag);

selectable.add(ul.children);