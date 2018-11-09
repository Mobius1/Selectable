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

	if ( i % 2 === 0 ) {
		li.classList.add("odd");
	} else {
		li.classList.add("even");
	}

	frag.appendChild(li);
}
ul.appendChild(frag);

selectable.add(ul.children);

selectable.select([0,1,2,3]);

function setOutput(obj, clear) {
	const tmp = document.createElement("div");
	tmp.appendChild(obj.node.cloneNode());

	obj.node = tmp.innerHTML.replace(/\"/g, "'").replace(" highlight", "");

	if ( clear ) {
		output.innerHTML = "";
	}

	const code = Prism.highlight(JSON.stringify(obj, null, 4), Prism.languages.javascript, 'javascript');
	//.replace(/<span class=\"token string\">"([^\"]+)"<\/span>/g, "<span class='token string'><span class='token quotes'>\"</span>$1<span class='token quotes'>\"</span></span>")

	output.innerHTML += `<pre><code class="language-js">${code}</code></pre>`;
}

document.getElementById("getIndex").addEventListener("click", e => {
	const item = selectable.get(0);
	const obj = JSON.parse(JSON.stringify(item));
	obj.node = item.node;

	Array.from(ul.children).forEach(el => el.classList.toggle("highlight", el === item.node));

	setOutput(obj, true);
}, false);

document.getElementById("getIndexes").addEventListener("click", e => {
	const items = selectable.get([0,2,7]);

	output.innerHTML = "";

	Array.from(ul.children).forEach(el => el.classList.remove("highlight"));

	items.forEach(item => {
		const obj = JSON.parse(JSON.stringify(item));
		obj.node = item.node;
		item.node.classList.add("highlight");
		setOutput(obj);
	});
}, false);

document.getElementById("getOdd").addEventListener("click", e => {
	const items = selectable.get(document.querySelectorAll(".odd"));

	output.innerHTML = "";

	Array.from(ul.children).forEach(el => el.classList.remove("highlight"));

	items.forEach(item => {
		item.node.classList.add("highlight");
		const obj = JSON.parse(JSON.stringify(item));
		obj.node = item.node;
		setOutput(obj);
	});
}, false);

document.getElementById("getEven").addEventListener("click", e => {
	const items = selectable.get(document.querySelectorAll(".even"));

	output.innerHTML = "";

	Array.from(ul.children).forEach(el => el.classList.remove("highlight"));

	items.forEach(item => {
		item.node.classList.add("highlight");
		const obj = JSON.parse(JSON.stringify(item));
		obj.node = item.node;
		setOutput(obj);
	});
}, false);