const container = document.getElementById("container-demo");
const ul = container.firstElementChild;

const selectable = new Selectable({
	appendTo: ul,
    lasso: {
        border: "2px dashed rgba(219, 10, 91, 1)",
        borderRadius: "10px",
        backgroundColor: "rgba(219, 10, 91, 0.4)"
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