const container = document.getElementById("container-demo");
const ul = document.getElementById("demo-items");
const output = document.getElementById("output");

const selectable = new Selectable({
	appendTo: ul,
	lasso: {
		borderColor: "#fff",
		backgroundColor: "rgba(255, 255, 255, 0.2)"
	}
});


const frag = document.createDocumentFragment();
for ( let i = 0; i < 8; i++ ) {
	const li = document.createElement("li");
	li.classList.add("ui-selectable");

	frag.appendChild(li);
}
ul.appendChild(frag);

selectable.add(ul.children);

selectable.select([0,1,2,3]);

function setOutput(obj, clear) {
	console.log(obj)
	const tmp = document.createElement("div");
	tmp.appendChild(obj.node.cloneNode());

	obj.node = tmp.innerHTML.replace(/\"/g, "'");

	if ( clear ) {
		output.innerHTML = "";
	}

	const code = Prism.highlight(JSON.stringify(obj, null, 4), Prism.languages.javascript, 'javascript');

	output.innerHTML += `<pre><code class="language-js">${code}</code></pre>`;
}


document.getElementById("getSelectedItems").addEventListener("click", e => {
	const items = selectable.getSelectedItems();
	output.innerHTML = "";
	items.forEach(item => {
		const obj = JSON.parse(JSON.stringify(item));
		obj.node = item.node;
		setOutput(obj);
	});
}, false);