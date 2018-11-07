const container = document.getElementById("demo-ignore");
const ul = container.firstElementChild;

const selectable = new Selectable({
	appendTo: ul,
	ignore: ".form-control",
	lasso: {
		borderColor: "#0054D1",
		backgroundColor: "rgba(0, 84, 209, 0.2)"
	}
});


const frag = document.createDocumentFragment();
for ( let i = 0; i < 4; i++ ) {
	const li = document.createElement("li");

	li.innerHTML = `<p>All elements below will NOT trigger selection. I will, though.</p>
					<input type="text" class="form-control form-control-sm" placeholder="Start typing...">
					<input type="range" class="form-control form-control-sm">
					<label class="form-control form-control-sm" for="check-${i+1}"><input type="checkbox" id="check-${i+1}"/> Check me</label>
					<select class="form-control form-control-sm">
						<option value="">Select me</option>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
					</select>
					<button type="button" class="btn btn-light btn-sm form-control form-control-sm">Click me</button>`;

	frag.appendChild(li);
}
ul.appendChild(frag);

selectable.add(ul.children);