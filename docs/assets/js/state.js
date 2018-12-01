const container = document.getElementById("container-demo");
const ul = container.firstElementChild;

const selectable = new Selectable({
    appendTo: ul,
    saveState: 10,
	lasso: {
		borderColor: "#fff",
		backgroundColor: "rgba(255, 255, 255, 0.2)"
	}
});



ul.innerHTML = `<li class="ui-selectable">1</li>
    <li class="ui-selectable alt">2</li>
    <li class="ui-selectable">3</li>
    <li class="ui-selectable alt">4</li>
    <li class="ui-selectable">5</li>
    <li class="ui-selectable alt">6</li>
    <li class="ui-selectable">7</li>
    <li class="ui-selectable alt">8</li>`;

selectable.add(ul.children);