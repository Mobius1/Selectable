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

selectable.select([0,2,4,6]);

function setOutput(obj, clear) {
	if ( clear ) {
		output.innerHTML = "";
	}

	const els = [];
	obj.forEach((el, i) => {
		const tmp = document.createElement("div");
		tmp.appendChild(el.cloneNode());		
		els.push(tmp.innerHTML.replace(/\"/g, "'"));
	});


	const code = Prism.highlight(`[\n\t"${els.join("\",\n\t\"")}"\n]`, Prism.languages.javascript, 'javascript');

	output.innerHTML += `<pre><code class="language-js">${code}</code></pre>`;
}


document.getElementById("getNodes").addEventListener("click", e => {
	setOutput(selectable.getNodes(), true);
}, false);

