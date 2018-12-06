const items = document.getElementById('items');

const SELECTABLE = new Selectable({
	filter: ".item",
	appendTo: items,
	ignore: ".handle" // ignore the handle used for sorting
});


const SORTABLE = Sortable.create(items, {
	animation: 200,
	handle: ".handle",
	onUpdate: function (evt) {
        // Selecting will still work, but shift + select will be broken due to the order difference.
        // So update the Selctable instance to reflect the new order.
		SELECTABLE.update();
	}
});