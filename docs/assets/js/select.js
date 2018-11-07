const container = document.getElementById("container-demo");
const ul = container.firstElementChild;

const selectable = new Selectable({
	appendTo: ul,
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

// demo 2
const container2 = document.getElementById("container-demo2");
const ul2 = container2.firstElementChild;

const selectable2 = new Selectable({
	appendTo: ul2,
	lasso: {
		borderColor: "#fff",
		backgroundColor: "rgba(255, 255, 255, 0.2)"
	}
});



ul2.innerHTML = `
	<li class="ui-selectable">1</li>
    <li></li>
    <li></li>
    <li class="ui-selectable">2</li>
    <li class="ui-selectable">3</li>
    <li class="ui-selectable">4</li>
    <li></li>
    <li class="ui-selectable">5</li>`;

selectable2.add(ul2.querySelectorAll('.ui-selectable'));