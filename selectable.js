/*!
 *
 * Selectable
 * Copyright (c) 2017 Karl Saunders (http://mobius.ovh)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.3.1
 *
 */
(function(root, factory) {
    var plugin = "Selectable";

    if (typeof exports === "object") {
        module.exports = factory(plugin);
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root[plugin] = factory(plugin);
    }
})(typeof global !== 'undefined' ? global : this.window || this.global, function() {
    "use strict";

    /**
     * Default configuration properties
     * @type {Object}
     */
    var defaultConfig = {
        appendTo: document.body,
        autoRefresh: true,
        filter: ".ui-selectable",
        tolerance: "touch",

        lasso: {
            border: '1px dotted #3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
        },

        classes: {
            container: "ui-container",
            selectable: "ui-selectable",
            selecting: "ui-selecting",
            unselecting: "ui-unselecting",
            selected: "ui-selected",
        }
    };

    /**
     * Attach removable event listener
     * @param  {Object}   el       HTMLElement
     * @param  {String}   type     Event type
     * @param  {Function} callback Event callback
     * @param  {Object}   scope    Function scope
     * @return {Void}
     */
    function on(el, type, callback, scope) {
        el.addEventListener(type, callback, false);
    }

    /**
     * Remove event listener
     * @param  {Object}   el       HTMLElement
     * @param  {String}   type     Event type
     * @param  {Function} callback Event callback
     * @return {Void}
     */
    function off(el, type, callback) {
        el.removeEventListener(type, callback);
    }

    var closest = function(el, fn) {
        return el && el !== document.body && (fn(el) ? el : closest(el.parentNode, fn));
    };

    /**
     * Check is item is object
     * @return {Boolean}
     */
    var isObject = function(val) {
        return Object.prototype.toString.call(val) === "[object Object]";
    };

    /**
     * Merge objects (reccursive)
     * @param  {Object} r
     * @param  {Object} t
     * @return {Object}
     */
    var extend = function(src, props) {
        for (var prop in props) {
            if (props.hasOwnProperty(prop)) {
                var val = props[prop];
                if (val && isObject(val)) {
                    src[prop] = src[prop] || {};
                    extend(src[prop], val);
                } else {
                    src[prop] = val;
                }
            }
        }
        return src;
    };

    /**
     * Iterator helper
     * @param  {(Array|Object)}   arr     Any object, array or array-like collection.
     * @param  {Function}         fn      Callback
     * @param  {Object}           scope   Change the value of this
     * @return {Void}
     */
    var each = function(arr, fn, scope) {
        var n;
        if (isObject(arr)) {
            for (n in arr) {
                if (Object.prototype.hasOwnProperty.call(arr, n)) {
                    fn.call(scope, arr[n], n);
                }
            }
        } else {
            for (n = 0; n < arr.length; n++) {
                fn.call(scope, arr[n], n);
            }
        }
    };

    /**
     * Mass assign style properties
     * @param  {Object} t
     * @param  {(String|Object)} e
     * @param  {String|Object}
     */
    var css = function(i, t, e) {
        var n = i && i.style,
            o = isObject(t);
        if (n) {
            if (void 0 === e && !o) return e = window.getComputedStyle(i, ""), void 0 === t ? e : e[t];
            o ? each(t, function(i, t) {
                t in n || (t = "-webkit-" + t), n[t] = i + ("string" == typeof i ? "" : "opacity" === t ? "" : "px")
            }) : (t in n || (t = "-webkit-" + t), n[t] = e + ("string" == typeof e ? "" : "opacity" === t ? "" : "px"))
        }
    };

    /**
     * Get an element's DOMRect relative to the document instead of the viewport.
     * @param  {Object} t   HTMLElement
     * @param  {Boolean} e  Include margins
     * @return {Object}     Formatted DOMRect copy
     */
    var rect = function(e) {
        var w = window,
            o = e.getBoundingClientRect(),
            b = document.documentElement || document.body.parentNode || document.body,
            d = (void 0 !== w.pageXOffset) ? w.pageXOffset : b.scrollLeft,
            n = (void 0 !== w.pageYOffset) ? w.pageYOffset : b.scrollTop;
        return {
            x1: o.left + d,
            x2: o.left + o.width + d,
            y1: o.top + n,
            y2: o.top + o.height + n,
            height: o.height,
            width: o.width
        }
    };

    /**
     * Returns a function, that, as long as it continues to be invoked, will not be triggered.
     * @param  {Function} fn
     * @param  {Number} wait
     * @param  {Boolean} now
     * @return {Function}
     */
    var debounce = function(n, t, u) {
        var e;
        return function() {
            var i = this,
                o = arguments,
                a = u && !e;
            clearTimeout(e), e = setTimeout(function() {
                e = null, u || n.apply(i, o)
            }, t), a && n.apply(i, o)
        }
    }

    /**
     * classList shim
     * @type {Object}
     */
    var classList = {
        add: function(s, a) {
            if (s.classList) {
                s.classList.add(a);
            } else {
                if (!classList.contains(s, a)) {
                    s.className = s.className.trim() + " " + a;
                }
            }
        },
        remove: function(s, a) {
            if (s.classList) {
                s.classList.remove(a);
            } else {
                if (classList.contains(s, a)) {
                    s.className = s.className.replace(
                        new RegExp("(^|\\s)" + a.split(" ").join("|") + "(\\s|$)", "gi"),
                        " "
                    );
                }
            }
        },
        contains: function(s, a) {
            if (s)
                return s.classList ?
                    s.classList.contains(a) :
                    !!s.className &&
                    !!s.className.match(new RegExp("(\\s|^)" + a + "(\\s|$)"));
        }
    };

    /**
     * Detect CTRL or META key press
     * @param  {Object}  e Event interface
     * @return {Boolean}
     */
    var isCmdKey = function(e) {
        return !!e.ctrlKey || !!e.metaKey
    };

    /**
     * Detect SHIFT key press
     * @param  {Object}  e Event interface
     * @return {Boolean}
     */
    var isShiftKey = function(e) {
        return !!e.shiftKey;
    };

    /* EMITTER */
    var Emitter = function() {};
    Emitter.prototype = {
        on: function(a, b) {
            this._events = this._events || {}, this._events[a] = this._events[a] || [], this._events[a].push(b)
        },
        off: function(a, b) {
            this._events = this._events || {}, a in this._events != !1 && this._events[a].splice(this._events[a].indexOf(b), 1)
        },
        emit: function(a) {
            if (this._events = this._events || {}, a in this._events != !1) {
                for (var b = 0; b < this._events[a].length; b++) {
                    this._events[a][b].apply(this, Array.prototype.slice.call(arguments, 1))
                }
            }
        }
    };

    Emitter.mixin = function(a) {
        var b = ["on", "off", "emit"],
            c = b.length;
        for (; c--;) "function" == typeof a ? a.prototype[b[c]] = Emitter.prototype[b[c]] : a[b[c]] = Emitter.prototype[b[c]];
        return a
    };

    /* SELECTABLE */
    function Selectable(options) {

        this.config = extend(defaultConfig, options);

        /* Enable emitter */
        Emitter.mixin(this);

        this.init();
    };

    /**
     * Init instance
     * @return {void}
     */
    Selectable.prototype.init = function() {
        var o = this.config;
        /* lasso */
        this.lasso = document.createElement('div');
        this.lasso.className = 'ui-lasso';

        css(this.lasso, extend({
            position: "fixed",
            opacity: 0, // border will show even at zero width / height
        }, o.lasso));

        if (typeof o.appendTo === 'string') {
            this.container = document.querySelector(o.appendTo);
        } else if (o.appendTo.nodeName) {
            this.container = o.appendTo;
        }

        this.update();

        this.enable()
    };

    /**
     * Update instance
     * @return {Void}
     */
    Selectable.prototype.update = function() {
        var that = this,
            o = this.config;

        if (o.filter instanceof NodeList || o.filter instanceof HTMLCollection) {
            this.nodes = o.filter;
        } else if (typeof o.filter === "string") {
            this.nodes = this.container.querySelectorAll(o.filter);
        }

        this.items = [];

        each(this.nodes, function(el, i) {
            classList.add(el, o.classes.selectable);
            that.items[i] = {
                index: i,
                element: el,
                rect: rect(el),
                startselected: false,
                selected: classList.contains(el, o.classes.selected),
                selecting: classList.contains(el, o.classes.selecting),
                unselecting: classList.contains(el, o.classes.unselecting)
            }
        });
    };

    /**
     * mousedown event listener
     * @param  {Object} e
     * @return {Void}
     */
    Selectable.prototype.mousedown = function(e) {
        e.preventDefault();

        var o = this.config,
            originalEl;
        var node = closest(e.target, function(el) {
            return classList.contains(el, o.classes.selectable);
        });

        this.container.appendChild(this.lasso);

        this.origin = {
            x: e.pageX,
            y: e.pageY,
        };

        if (o.disabled) {
            return;
        }

        if (node) {
            classList.add(node, o.classes.selecting);
        }

        if (o.autoRefresh) {
            this.update();
        }

        if (isShiftKey(e)) {
            var found = false;

            // Look back over the items until we find the on we've clicked
            for (var i = this.items.length - 1; i >= 0; i--) {
                // found the item we clicked
                if (this.items[i].element === node) {
                    found = true;
                }

                // found a selected item so stop
                if (found && this.items[i].selected) {
                    break;
                }

                // continue selecting items until we find a selected item
                // or the first item if there aren't any
                if (found) {
                    this.items[i].selecting = true;
                }
            }
        }

        each(this.items, function(item) {
            var el = item.element;
            if (item.selected && el !== node) {
                item.startselected = true;
                if (!isCmdKey(e) && !isShiftKey(e)) {
                    classList.remove(el, o.classes.selected);
                    item.selected = false;

                    classList.add(el, o.classes.unselecting);
                    item.unselecting = true;
                }
            }
            if (el === node) {
                originalEl = item;
            }
        });

        this.dragging = true;

        if (node) {
            this.emit('selectable.down', originalEl);
        }
    };

    /**
     * mousemove event listener
     * @param  {Object} e
     * @return {Void}
     */
    Selectable.prototype.mousemove = function(e) {
        if (!this.dragging) return;

        var o = this.config;
        if (o.disabled) {
            return;
        }

        var tmp;
        var c = {
            x1: this.origin.x,
            y1: this.origin.y,
            x2: e.pageX,
            y2: e.pageY,
        };

        if (c.x1 > c.x2) {
            tmp = c.x2, c.x2 = c.x1, c.x1 = tmp;
        }
        if (c.y1 > c.y2) {
            tmp = c.y2, c.y2 = c.y1, c.y1 = tmp;
        }

        css(this.lasso, {
            opacity: 1,
            left: c.x1,
            width: c.x2 - c.x1,
            top: c.y1,
            height: c.y2 - c.y1
        });

        /* highlight */
        each(this.items, function(item) {
            var el = item.element;
            var over = false;
            if (o.tolerance == 'touch') {
                over = !(item.rect.x1 > c.x2 || (item.rect.x2 < c.x1 || (item.rect.y1 > c.y2 || item.rect.y2 < c.y1)));
            } else if (o.tolerance == 'fit') {
                over = item.rect.x1 > c.x1 && (item.rect.x2 < c.x2 && (item.rect.y1 > c.y1 && item.rect.y2 < c.y2));
            }
            if (over) {
                if (item.selected) {
                    classList.remove(el, o.classes.selected);
                    item.selected = false;
                }
                if (item.unselecting) {
                    classList.remove(el, o.classes.unselecting);
                    item.unselecting = false;
                }
                if (!item.selecting) {
                    classList.add(el, o.classes.selecting);
                    item.selecting = true;
                }
            } else {
                if (item.selecting) {
                    if (isCmdKey(e) && item.startselected) {
                        classList.remove(el, o.classes.selecting);
                        item.selecting = false;

                        classList.add(el, o.classes.selected);
                        item.selected = true;
                    } else {
                        classList.remove(el, o.classes.selecting);
                        item.selecting = false;

                        if (item.startselected) {
                            classList.add(el, o.classes.unselecting);
                            item.unselecting = true;
                        }
                    }
                }
                if (el.selected) {
                    if (!isCmdKey(e)) {
                        if (!item.startselected) {
                            classList.remove(el, o.classes.selected);
                            item.selected = false;

                            classList.add(el, o.classes.unselecting);
                            item.unselecting = true;
                        }
                    }
                }
            }

        });

        this.emit('selectable.drag', c);
    };

    /**
     * mouseup event listener
     * @param  {Object} e
     * @return {Void}
     */
    Selectable.prototype.mouseup = function(e) {
        if (this.dragging) {
            this.dragging = false;
        }

        if (!this.container.contains(e.target)) {
            return
        }

        var that = this;

        css(this.lasso, {
            opacity: 0,
            left: 0,
            width: 0,
            top: 0,
            height: 0
        });

        each(this.items, function(item) {
            var el = item.element;

            if (item.unselecting) {
                that.deselectItem(item);
            }

            if (item.selecting) {
                that.selectItem(item);
            }
        });

        this.container.removeChild(this.lasso);

        this.emit('selectable.up', this.getSelectedItems());
    };

    /**
     * Select an item
     * @param  {Object} item
     * @return {Boolean}
     */
    Selectable.prototype.selectItem = function(item) {
        if (this.items.indexOf(item) >= 0) {
            var el = item.element,
                o = this.config.classes;

            classList.remove(el, o.selecting);
            classList.add(el, o.selected);

            item.selecting = false;
            item.selected = true;
            item.startselected = true;

            return this.emit('selectable.selected', item);
        }

        return false;
    };

    /**
     * Deselect an item
     * @param  {Object} item
     * @return {Boolean}
     */
    Selectable.prototype.deselectItem = function(item) {
        if (this.items.indexOf(item) >= 0) {
            var el = item.element,
                o = this.config.classes;

            item.selecting = false;
            item.selected = false;
            item.unselecting = false;
            item.startselected = false;

            classList.remove(el, o.unselecting);
            classList.remove(el, o.selecting);
            classList.remove(el, o.selected);

            return this.emit('selectable.deselected', item);
        }

        return false;
    };

    /**
     * Update item coords
     * @return {Void}
     */
    Selectable.prototype.recalculate = function() {
        each(this.nodes, function(el, i) {
            this.items[i].rect = rect(el);
        }, this);
    };

    /**
     * Select all items
     * @return {Void}
     */
    Selectable.prototype.selectAll = function() {
        each(this.items, function(item) {
            this.selectItem(item);
        }, this);
    };

    /**
     * Deselect all items
     * @return {Void}
     */
    Selectable.prototype.clear = function() {
        for (var i = this.items.length - 1; i >= 0; i--) {
            this.deselectItem(this.items[i]);
        };
    };

    /**
     * Get all items
     * @return {Array}
     */
    Selectable.prototype.getItems = function() {
        return this.items;
    };

    /**
     * Get all nodes
     * @return {Array}
     */
    Selectable.prototype.getNodes = function() {
        return this.items.map(function(item) {
            return item.element;
        });
    };

    /**
     * Get all selected items
     * @return {Array}
     */
    Selectable.prototype.getSelectedItems = function() {
        return this.getItems().filter(function(item) {
            return item.selected;
        });
    };

    /**
     * Get all selected nodes
     * @return {Array}
     */
    Selectable.prototype.getSelectedNodes = function() {
        return this.getSelectedItems().map(function(item) {
            return item.element;
        });
    };

    /**
     * Enable instance
     * @return {Boolean}
     */
    Selectable.prototype.enable = function() {
        if (!this.enabled) {
            this.enabled = true;

            // Bind events
            var e = {
                mousedown: this.mousedown.bind(this),
                mousemove: this.mousemove.bind(this),
                mouseup: this.mouseup.bind(this),
                recalculate: debounce(this.recalculate, 50).bind(this)
            };

            // Attach event listeners
            on(this.container, 'mousedown', e.mousedown);
            on(document, 'mousemove', e.mousemove);
            on(document, 'mouseup', e.mouseup);

            on(window, 'resize', e.recalculate);
            on(window, 'scroll', e.recalculate);

            this.events = e;

            classList.add(this.container, this.config.classes.container);
        }

        return this.enabled;
    };

    /**
     * Disable instance
     * @return {Boolean}
     */
    Selectable.prototype.disable = function() {
        if (this.enabled) {
            var e = this.events;
            this.enabled = false;

            off(this.container, 'mousedown', e.mousedown);
            off(document, 'mousemove', e.mousemove);
            off(document, 'mouseup', e.mouseup);

            off(window, 'resize', e.recalculate);
            off(window, 'scroll', e.recalculate);

            classList.remove(this.container, this.config.classes.container);
        }

        return this.enabled;
    };

    /**
     * Destroy instance
     * @return {void}
     */
    Selectable.prototype.destroy = function() {
        var o = this.config.classes;

        each(this.items, function(item) {
            var el = item.element;
            classList.remove(el, o.unselecting);
            classList.remove(el, o.selecting);
            classList.remove(el, o.selected);
        });

        this.disable();
    };

    return Selectable;
});