# Selectable
[![npm](https://img.shields.io/npm/dt/selectable%2Ejs.svg)](https://www.npmjs.com/package/selectable%2Ejs)
[![npm version](https://badge.fury.io/js/selectable%2Ejs.svg)](https://badge.fury.io/js/selectable%2Ejs)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Mobius1/Selectable/blob/master/LICENSE)
[![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/Mobius1/Selectable.svg)](http://isitmaintained.com/project/Mobius1/Selectable "Average time to resolve an issue")
[![Percentage of issues still open](http://isitmaintained.com/badge/open/Mobius1/Selectable.svg)](http://isitmaintained.com/project/Mobius1/Selectable "Percentage of issues still open")
![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js) ![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js?compression=gzip&label=gzipped)

Inspired by the jQuery UI Selectable plugin. Functionality and options are identical to the jQuery UI version with some additions and performance enhancements.

Selectable mimics the Windows file / directory behaviour, i.e. click and / or drag to select items, hold CTRL to select multiple or hold SHIFT to select consecutive groups of items.

* No dependencies
* Lightweight
* IE9+
* Touch enabled

**Selectable is still in active development and therefore the API is in constant flux until `v1.0.0`. Check back regularly for any changes and make sure you have the latest version installed.**

## [Demo](http://codepen.io/Mobius1/debug/qRxaqQ/) | [Documentation](https://github.com/Mobius1/Selectable/wiki) | [Changelog](https://github.com/Mobius1/Selectable/releases)

---

## Demos

* [Tables](https://codepen.io/Mobius1/pen/XzXyVw)
* [Toggle enabled](https://codepen.io/Mobius1/pen/jamBzV/)
* [Advanced Usage](https://s.codepen.io/Mobius1/debug/OOXPwo)

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

[See Options](https://github.com/Mobius1/Selectable/wiki/Options)

---

## Public Methods

[See Public Methods](https://github.com/Mobius1/Selectable/wiki/Public-Methods)

---

## Events

[See Events](https://github.com/Mobius1/Selectable/wiki/events)

---

Copyright © 2017 Karl Saunders | BSD & MIT license
