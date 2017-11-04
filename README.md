# Selectable
[![npm version](https://badge.fury.io/js/mobius1-selectable.svg)](https://badge.fury.io/js/mobius1-selectable) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Mobius1/Selectable/blob/master/LICENSE) [![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/Mobius1/Selectable.svg)](http://isitmaintained.com/project/Mobius1/Selectable "Average time to resolve an issue") [![Percentage of issues still open](http://isitmaintained.com/badge/open/Mobius1/Selectable.svg)](http://isitmaintained.com/project/Mobius1/Selectable "Percentage of issues still open") ![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js) ![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js?compression=gzip&label=gzipped)

Inspired by the jQuery UI Selectable plugin. Functionality and options are identical to the jQuery UI version with some additions and performance enhancements.

Selectable mimics the Windows file / directory behaviour, i.e. click and / or drag to select items, hold CTRL to select multiple or hold SHIFT to select consecutive groups of items.

Works in most modern deskop and mobile browsers including IE9+ as well a touchscreen devices.

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
    node: HTMLElement, // the element
    rect: DOMRect, // the element's bounding rects
    startselected: Boolean,
    selected: Boolean, // is the item currently selected
    selecting: Boolean, // is the item currently being selected
    unselecting: Boolean // is the item currently being deselected
}
```

| Method               | Effect                                                                                                                                                               |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `destroy()`          | [See Docs](https://github.com/Mobius1/Selectable/wiki/destroy())                                                                             |
| `init()`             | [See Docs](https://github.com/Mobius1/Selectable/wiki/init())                                                                                                                            |
| `disable()`          | [See Docs](https://github.com/Mobius1/Selectable/wiki/disable())                                                                        |
| `enable()`           | [See Docs](https://github.com/Mobius1/Selectable/wiki/enable())                                                                                                                                                 |
| `update()`           | Updates the instance. Can be used if new items are added or old ones removed. All item coords are updated as well.                                                   |
| `recalculate()`      | [See Docs](https://github.com/Mobius1/Selectable/wiki/recalculate())  |
| `select(items)`      | [See Docs](https://github.com/Mobius1/Selectable/wiki/select())                                                                                                                                                  |
| `unselect(items)`    | [See Docs](https://github.com/Mobius1/Selectable/wiki/unselect())                                                                                                                                                  |
| `selectAll()`        | [See Docs](https://github.com/Mobius1/Selectable/wiki/selectAll())                                                                                                                                               |
| `clear()`            | [See Docs](https://github.com/Mobius1/Selectable/wiki/clear())                                                                                                                                          |
| `add(node)`          | [See Docs](https://github.com/Mobius1/Selectable/wiki/add())                                                                                                                                         |
| `remove(items)`      | [See Docs](https://github.com/Mobius1/Selectable/wiki/remove())                                                                                                                                            |
| `getItem(items)`     | [See Docs](https://github.com/Mobius1/Selectable/wiki/getItem())                                                                                                                             |
| `getItems()`         | Returns an `Array` of all items.                                                                                                                                     |
| `getNodes()`         | Returns an `Array` of all `HTMLElement` nodes.                                                                                                                       |
| `getSelectedItems()` | Returns an `Array` of selected items.                                                                                                                                |
| `getSelectedNodes()` | Returns an `Array` of selected `HTMLElement` nodes.                                                                                                                  |


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
|`selectable.start` | on mousedown / touchstart (within container) | `element` - the item that was clicked on |
|`selectable.drag` | when dragging the lasso | `coords` - the coords of the lasso
|`selectable.end` | on mouseup / touchend (within container) | `items` - the current selection of item(s)
|`selectable.select` | when an item is selected | `item` - the selected item |
|`selectable.unselect` | when an item is unselected | `item` - the unselected item
|`selectable.update` | when the instance is updated |
|`selectable.recalculate` | when the item coords are recalculated |

---

Copyright © 2017 Karl Saunders | BSD & MIT license