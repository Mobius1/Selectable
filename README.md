# Selectable
[![npm version](https://badge.fury.io/js/selectable%2Ejs.svg)](https://badge.fury.io/js/selectable%2Ejs) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Mobius1/Selectable/blob/master/LICENSE) [![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/Mobius1/Selectable.svg)](http://isitmaintained.com/project/Mobius1/Selectable "Average time to resolve an issue") [![Percentage of issues still open](http://isitmaintained.com/badge/open/Mobius1/Selectable.svg)](http://isitmaintained.com/project/Mobius1/Selectable "Percentage of issues still open") ![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js) ![](http://img.badgesize.io/Mobius1/Selectable/master/selectable.min.js?compression=gzip&label=gzipped)

### ⚠️ Package name has been changed from `mobius1-selectable` to `selectable.js` ⚠️

Inspired by the jQuery UI Selectable plugin. Functionality and options are identical to the jQuery UI version with some additions and performance enhancements.

Selectable mimics the Windows file / directory behaviour, i.e. click and / or drag to select items, hold CTRL to select multiple or hold SHIFT to select consecutive groups of items.

* No dependencies
* 3kb gzipped
* IE9+
* Touch enabled

**Selectable is still in active development and therefore the API is in constant flux until `v1.0.0`. Check back regularly for any changes and make sure you have the latest version installed.**

## [Demo](http://codepen.io/Mobius1/debug/qRxaqQ/) | [Documentation](https://github.com/Mobius1/Selectable/wiki) | [Changelog](https://github.com/Mobius1/Selectable/releases)

---

## Demos

* [Tables](https://codepen.io/Mobius1/pen/XzXyVw)
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

Initialise the plugin:

```javascript
const selectable = new Selectable(options);
```
---

## Options

[See Documentation](https://github.com/Mobius1/Selectable/wiki/Options)

---

## Public Methods

[See Documentation](https://github.com/Mobius1/Selectable/wiki/Public-Methods)

---

## Events

[See Documentation](https://github.com/Mobius1/Selectable/wiki/events)

---

Copyright © 2017 Karl Saunders | BSD & MIT license
