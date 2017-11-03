# Selectable
[![npm version](https://badge.fury.io/js/mobius1-selectable.svg)](https://badge.fury.io/js/mobius1-selectable) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Mobius1/Selectable/blob/master/LICENSE) [![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/Mobius1/Selectable.svg)](http://isitmaintained.com/project/Mobius1/Selectable "Average time to resolve an issue") [![Percentage of issues still open](http://isitmaintained.com/badge/open/Mobius1/Selectable.svg)](http://isitmaintained.com/project/Mobius1/Selectable "Percentage of issues still open") ![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js) ![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js?compression=gzip&label=gzipped)

Inspired by the jQuery UI Selectable plugin. Functionality and options are identical to the jQuery UI version with some additions and performance enhancements.

Selectable mimics the Windows file / directory behaviour, i.e. click and / or drag to select items, hold CTRL to select multiple or hold SHIFT to select consecutive groups of items.

Works in most modern browsers including IE9+.

**Selectable is still in active development and therefore the API is in constant flux until `v1.0.0`. Check back regularly for any changes and make sure you have the latest version installed.**

## [Demo](http://codepen.io/Mobius1/debug/qRxaqQ/) | [Changelog](https://github.com/Mobius1/Selectable/releases)

---

## Demos

[Tables](https://codepen.io/Mobius1/pen/XzXyVw)


---

## Install

### Bower
```
bower install mobius1-selectable --save
```

### npm
```
npm install mobius1-selectable --save
```

---

### Browser

Grab the file from one of the CDNs and include it in your page:

```
https://unpkg.com/mobius1-selectable@latest/selectable.min.js
```
or

```
https://cdn.jsdelivr.net/npm/mobius1-selectable@latest/selectable.min.js
```

You can replace `latest` with the required release number if needed.

---

Initialise the plugin:

```javascript
const selectable = new Selectable(options);
```
---

## Options

By default the instance will look for any nodes with the `".ui-selectable"` class. You can redefine this with the `filter` option.

| Option        | Type                 | Default            | Effect                                                                                                                                                          |
|---------------|----------------------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filter`      | `string` or `array`  | `".ui-selectable"` | The elements that can be selected. You can pass either a CSS3 selector string or a collection of nodes.                                                         |
| `appendTo`    | `string` or `object` | `document.body`    | The container element to append the lasso to.                                                                                                                   |
| `tolerance`   | `string`             | `touch`            | How far the lasso overlaps an element before it's highlighted. `"fit"` (lasso overlaps the item entirely) or `"touch"` (lasso overlaps the item by any amount). |
| `autoRefresh` | `boolean`            | `true`             | Recalculate the coords of the items. Set to false if you know the selectable items won't move or change size.                                                   |
| `lasso`       | `object`             |                    | Style the lasso. Must be an object of valid CSS declarations. [Demo](https://codepen.io/Mobius1/pen/yPYzwq)                                                     |

---

## Public Methods


Items returned by the instance are objects of the following format:

```javascript
{
    element: HTMLElement, // the element
    index: Number, // the position of the item in the list
    rect: DOMRect Object, // the element's bounding rects
    startselected: Boolean,
    selected: Boolean, // is the item currently selected
    selecting: Boolean, // is the item currently being selected
    unselecting: Boolean // is the item currently being deselected
}
```

| Method               | Args     |   Return   | Effect                                                                                                                                                               |
|----------------------|----------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `destroy()`          |          |            | Destroy the instance. This will return the DOM to it's initial state before initialsing.                                                                             |
| `init()`             |          |            | Initialise the instance after destroying.                                                                                                                            |
| `disable()`          |          |            | Disable the instance. Removes all event listeners to prevent further selection / deselection.                                                                        |
| `enable()`           |          |            | Enable the instance.                                                                                                                                                 |
| `update()`           |          |            | Updates the instance. Can be used if new items are added or old ones removed. All item coords are updated as well.                                                   |
| `recalculate()`      |          |            | Recalculates the coords for all valid items. If the dimensions of the item / items change then call this method otherwise the lasso will not select items correctly. |
| `select()`           | `Mixed`  | `Mixed`    | Select an item or items. You can pass a `Number` representing the index of the item, a reference to the `HTMLElement` node, the `Object` as it appears in the `items` array or an `Array` of numbers / nodes / objects.                                                                                                                                                  |
| `unselect()`         | `Mixed`  | `Mixed`    | Same as `select()`, but the item or items are unselected.                                                                                                                                                  |
| `selectAll()`        |          |            | Select all valid items.                                                                                                                                              |
| `clear()`            |          |            | Deselects all valid items.                                                                                                                                           |
| `getItem()`          | `Mixed`  | `Object`   | Returns a reference to the item if found or `false` if not. You can pass the same mixed argument as with `select()` and `unselect()`.                                                                                                                            |
| `getItems()`         |          | `Array`    | Returns an `Array` of all items.                                                                                                                                     |
| `getNodes()`         |          | `Array`    | Returns an `Array` of all `HTMLElement` nodes.                                                                                                                       |
| `getSelectedItems()` |          | `Array`    | Returns an `Array` of selected items.                                                                                                                                |
| `getSelectedNodes()` |          | `Array`    | Returns an `Array` of selected `HTMLElement` nodes.                                                                                                                  |


---

## Events

```javascript
// Intitialise Selectable
const selectable = new Selectable(options);

// Listen for the 'selectable.XXXX' event
selectable.on('selectable.XXXX', function(/* params */) {
    // Do something when 'selectable.XXXX' fires
});
```

| Name | Fired   | Params |
|---|---|---|
|`selectable.init` | when the instance is ready |
|`selectable.enable` | when the instance is enabled |
|`selectable.disable` | when the instance is disabled |
|`selectable.mousedown` | on mousedown (within container) | `element` - the item that was clicked on |
|`selectable.mousemove` | when dragging the lasso | `coords` - the coords of the lasso
|`selectable.mouseup` | on mouse up (within container) | `items` - the current selection of item(s)
|`selectable.select` | when an item is selected | `item` - the selected item |
|`selectable.unselect` | when an item is unselected | `item` - the unselected item
|`selectable.update` | when the instance is updated |
|`selectable.recalculate` | when the item coords are recalculated |

---

Copyright © 2017 Karl Saunders | BSD & MIT license