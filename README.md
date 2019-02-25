![Selectable](selectable.png?raw=true "Selectable")

[![Maintenance](https://img.shields.io/maintenance/yes/2018.svg?style=?style=flat-square&logo=appveyor)](https://github.com/Mobius1/Selectable/)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/Mobius1/Selectable.svg?style=?style=flat-square&logo=appveyor)](https://codeclimate.com/github/Mobius1/Selectable/maintainability)
![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js?style=?style=flat-square&logo=appveyor) 
![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js?compression=gzip&label=gzipped&style=?style=flat-square&logo=appveyor)
[![npm](https://img.shields.io/npm/dt/selectable%2Ejs.svg?style=?style=flat-square&logo=appveyor)](https://www.npmjs.com/package/selectable%2Ejs)
[![](https://data.jsdelivr.com/v1/package/npm/selectable.js/badge)](https://www.jsdelivr.com/package/npm/selectable.js)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?style=?style=flat-square&logo=appveyor)](https://github.com/Mobius1/Selectable/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/release/Mobius1/Selectable.svg?style=?style=flat-square&logo=appveyor)](https://github.com/Mobius1/Selectable/releases)
[![npm](https://img.shields.io/npm/v/selectable.js.svg?style=?style=flat-square&logo=appveyor)](https://www.npmjs.com/package/selectable%2Ejs)
[![GitHub issues](https://img.shields.io/github/issues-raw/Mobius1/Selectable.svg?style=?style=flat-square&logo=appveyor)](https://github.com/Mobius1/Selectable)
[![GitHub issues](https://img.shields.io/github/issues-closed-raw/Mobius1/Selectable.svg?style=?style=flat-square&logo=appveyor)](https://github.com/Mobius1/Selectable)

Inspired by the jQuery UI Selectable plugin. Functionality and options are identical to the jQuery UI version with some additions and performance enhancements.

Selectable mimics the Windows file / directory behaviour, i.e. click and / or drag to select items, hold CTRL to select multiple or hold SHIFT to select consecutive groups of items.

* No dependencies
* Lightweight
* IE9+
* Touch enabled

**Selectable is still in active development and therefore the API is in constant flux until `v1.0.0`. Check back regularly for any changes and make sure you have the latest version installed.**

**Pull requests are welcome!**

## [Demo](http://codepen.io/Mobius1/pen/qRxaqQ/) | [Documentation](https://mobius1.github.io/Selectable) | [Changelog](https://github.com/Mobius1/Selectable/releases) | [Table Plugin](https://github.com/Mobius1/Selectable-Table-Plugin)

---

## Demos

* [Checkboxes](https://mobius1.github.io/Selectable/demos/checkboxes.html)
* [Table Plugin](https://codepen.io/Mobius1/pen/jamBzV/) (see [Mobius1/Selectable-Table-Plugin](https://github.com/Mobius1/Selectable-Table-Plugin))
* [Advanced Usage](https://s.codepen.io/Mobius1/pen/OOXPwo)

## Integration with other libs

* with [Dropzone](https://mobius1.github.io/Selectable/demos/dropzone.html) ([enyo/dropzone](https://github.com/enyo/dropzone))
* with [Sortable](https://mobius1.github.io/Selectable/demos/sortable.html) ([SortableJS/Sortable](https://github.com/SortableJS/Sortable))

---

## Install

### Bower
```
bower install selectable.js --save
```

### npm
```
npm install selectable.js --save
```

---

### Browser

Grab the file from one of the CDNs and include it in your page:

```
https://unpkg.com/selectable.js@latest/selectable.min.js
```
or

```
https://cdn.jsdelivr.net/npm/selectable.js@latest/selectable.min.js
```

You can replace `latest` with the required release number if needed.

---

### Default

This will create a new instance and add any element found in the DOM with the `"ui-selectable"` class name and make them selectable.

```javascript
const selectable = new Selectable();
```

### Custom filter

If you don't add the `"ui-selectable"` class name to your items then simply tell the instance what to look for instead with the [`filter`](https://github.com/Mobius1/Selectable/wiki/filter) option:

```javascript
const selectable = new Selectable({
   filter: ".my-classname"
});

// or

const selectable = new Selectable({
   filter: document.querySelectorAll(".my-classname")
});
```

### No items

If your document doesn't have any selectable items yet, e.g. they're added asynchronously via an ajax call, then simply create a new instance as normal, then use the [`add()`](https://github.com/Mobius1/Selectable/wiki/add()) method when they're available:

```javascript
const selectable = new Selectable();

// items added to DOM ...

// then...
selectable.add(items);
```

---

## Options

[See Options](https://mobius1.github.io/Selectable/options.html)

---

## Public Methods

[See Public Methods](https://mobius1.github.io/Selectable/public-methods.html)

---

## Events

[See Events](https://mobius1.github.io/Selectable/events.html)

---

Copyright © 2017 Karl Saunders | BSD & MIT license
