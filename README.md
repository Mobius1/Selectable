# Selectable
UI Selectable plugin without the bloat of jQuery and jQuery UI

[Demo](http://codepen.io/Mobius1/full/qRxaqQ/)

## Install

### Bower
```
Coming soon...
```

### npm
```
Coming soon...
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
	 * The container element to append the helper (lasso) to
	 * @type {string or HTMLElement}
	 */
	appendTo: ".my-container", // or document.querySelector(".my-container")

	/**
	 * The elements that can be selected (CSS3 selector)
	 * @type {string} "fit" (lasso overlaps the item entirely) or "touch" (lasso overlaps the item by any amount).
	 */
	tolerance: "touch",
	
	/**
	 * Recalculate coords of selectees on selection. Disable if you have a shit-ton of items.
	 * @type {boolean}
	 */
	autoRefresh: true,
	
	/**
	 * Style the border and background Color of the helper element (lasso).
	 * @type {boolean}
	 */	
	helper: {
		border: '1px solid #3498db',
		backgroundColor: 'rgba(52, 152, 219, 0.2)',
	}	
});
```

## Events

* `selectable.down` fires on mousedown
* `selectable.drag` fires when dragging the lasso
* `selectable.up` fires on mouse up
* `selectable.selected` fires on each element selected

```javascript
selectable.on('selectable.XXXX', function(params) {
	// Do something when selectable.XXXX fires
});
```

Copyright © 2017 Karl Saunders | BSD & MIT license
