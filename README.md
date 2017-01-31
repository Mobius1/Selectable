# Selectable
UI Selectable plugin without the bloat of jQuery and jQuery UI. Functionality and options are identical to the jQuery UI version with some additions.

[Demo](http://codepen.io/Mobius1/full/qRxaqQ/)

## Install

### Bower
```
bower install mobius1-selectable
```

### npm
```
npm install mobius1-selectable
```

## Quick Start

Add the js file at the bottom of your document's body

```html
<script type="text/javascript" src="path/to/selectable.min.js"></script>
```

Initialise the plugin

```javascript
const selectable = new Selectable({
	/**
	 * The elements that can be selected (CSS3 selector)
	 * @type {string}
	 */
	filter: ".some-class",
	
	/**
	 * The container element to append the lasso to
	 * @type {string or HTMLElement}
	 */
	appendTo: ".my-container", // or document.querySelector(".my-container")

	/**
	 * How far the lasso overlaps an element before it is highlighted
	 * "fit" (lasso overlaps the item entirely) or "touch" (lasso overlaps the item by any amount).
	 * @type {string}
	 */
	tolerance: "touch",
	
	/**
	 * Recalculate coords of selectees on selection. Disable if you have a shit-ton of items.
	 * @type {boolean}
	 */
	autoRefresh: true,
	
	/**
	 * Style the lasso.
	 * @type {object}
	 */	
	lasso: {
		border: '1px solid #3498db',
		backgroundColor: 'rgba(52, 152, 219, 0.2)',
	}	
});
```

## Events

* `selectable.down` fires on mousedown (within container)
* `selectable.drag` fires when dragging the lasso
* `selectable.up` fires on mouse up (within container)
* `selectable.selected` fires on each element selected

```javascript
/**
 * @param item - the first item selected
 * @return {object}
 */	
selectable.on('selectable.down', function(item) {
	// Do something when selectable.down fires
});

/**
 * @param coords - lasso coords (x1, x2, y1, y2) 
 * @return {object}
 */	
selectable.on('selectable.drag', function(coords) {
	// Do something when selectable.drag fires
});

/**
 * @param selectedItems - returns an array of selected items (objects)
 * @return {array}
 */	
selectable.on('selectable.up', function(selectedItems) {
	// Do something when selectable.up fires
});

/**
 * @param item - the selected item (fires for each item that is selected)
 * @return {object}
 */	
selectable.on('selectable.selected', function(item) {
	// Do something when selectable.selected fires
});
```

Note that items returned by these events are objects of the following format: 

```javascript
{
    element: HTMLElement, // the element
    rect: DOMRect object, // the element's bounding rects
    startselected: boolean,
    selected: boolean, // is the item currently selected
    selecting: boolean, // is the item currently being selected
    unselecting: boolean // is the item currently being deselected
}
```

Copyright © 2017 Karl Saunders | BSD & MIT license
