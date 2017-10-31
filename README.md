# Selectable [![npm version](https://badge.fury.io/js/mobius1-selectable.svg)](https://badge.fury.io/js/mobius1-selectable) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Mobius1/Selectable/blob/master/LICENSE)
This is a conversion of the jQuery UI Selectable plugin with all dependencies removed. Functionality and options are identical to the jQuery UI version with some additions.

Selectable mimics the Windows file / directory behaviour, i.e. click and / or drag to select items, hold CTRL to select multiple or hold SHIFT to select consecutive groups of items.

[Demo](http://codepen.io/Mobius1/full/qRxaqQ/)

## Install

### Bower
```
bower install mobius1-selectable --save
```

### npm
```
npm install mobius1-selectable --save
```

## Quick Start

Include the JS file:

```html
<script type="text/javascript" src="path/to/selectable.min.js"></script>
```

Initialise the plugin

```javascript
new Selectable({
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
	 * Recalculate coords of the items. Disable if you have a shit-ton of items.
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

```javascript
// Intitialise Selectable
var selectable = new Selectable(options);

// Listen for the 'selectable.XXXX' event
selectable.on('selectable.XXXX', function() {
    // Do something when 'selectable.XXXX' fires
});
```

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
