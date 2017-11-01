/*!
 *
 * Selectable
 * Copyright (c) 2017 Karl Saunders (http://mobius.ovh)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.0.7
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
        appendTo: "body",
        autoRefresh: true,
        filter: "*",
        tolerance: "touch",

        lasso: {
            border: '1px solid #3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
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
     * Emulate jQuery's css method
     * @param  {Object} el   HTMLElement
     * @param  {(Object|String)} prop Object of CSS properties and values or CSS propery string
     * @param  {Object} val CSS property value
     * @return {Object|Void}
     */
    var css = function(el, prop, val) {
        var style = el && el.style,
            isObj = isObject(prop);

        if (style) {
            if (val === void 0 && !isObj) {
                val = window.getComputedStyle(el, '');
                return prop === void 0 ? val : val[prop];
            } else {
                if (isObj) {
                    each(prop, function(v, p) {
                        if (!(p in style)) {
                            p = '-webkit-' + p;
                        }
                        style[p] = v + (typeof v === 'string' ? '' : p === "opacity" ? "" : "px");
                    });
                } else {
                    if (!(prop in style)) {
                        prop = '-webkit-' + prop;
                    }
                    style[prop] = val + (typeof val === 'string' ? '' : prop === "opacity" ? "" : "px");
                }
            }
        }
    }

    var debounce = function(a, b, c) {
        var d;
        return function() {
            var e = this,
                f = arguments,
                g = function() {
                    d = null, c || a.apply(e, f)
                },
                h = c && !d;
            clearTimeout(d), d = setTimeout(g, b), h && a.apply(e, f)
        }
    };

    var preventDefault = function(a) {
        return a = a || window.event, a.preventDefault ? a.preventDefault() : a.returnValue = !1
    };

    var isCmdKey = function(e) {
        return !!e.ctrlKey || !!e.metaKey
    };

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
        /* lasso */
        var lasso = document.createElement('div');
        lasso.className = 'ui-lasso';
        lasso.style.position = "fixed";

        each(this.config.lasso, function(val, prop) {
            lasso.style[prop] = val;
        });

        this.lasso = lasso;

        if (typeof this.config.appendTo === 'string' || this.config.appendTo instanceof String) {
            this.container = document.querySelector(this.config.appendTo);
        } else if (this.config.appendTo.nodeName) {
            this.container = this.config.appendTo;
        } else {
            this.container = document.body;
        }

        this.refresh();

        // Bind events
        this.events = {
            mousedown: this.mousedown.bind(this),
            mousemove: this.mousemove.bind(this),
            mouseup: this.mouseup.bind(this),
            update: debounce(this.update, 50).bind(this)
        };

        // Attach event listeners
        on(this.container, 'mousedown', this.events.mousedown);
        on(document, 'mousemove', this.events.mousemove);
        on(document, 'mouseup', this.events.mouseup);

        on(window, 'resize', this.events.update);
        on(window, 'scroll', this.events.update);
    };

    Selectable.prototype.refresh = function() {
        var that = this;
        this.nodes = this.container.querySelectorAll(this.config.filter);
        this.items = [];

        each(this.nodes, function(elem, i) {
            that.items[i] = {
                index: i,
                element: elem,
                rect: elem.getBoundingClientRect(),
                startselected: false,
                selected: elem.classList.contains("ui-selected"),
                selecting: elem.classList.contains("ui-selecting"),
                unselecting: elem.classList.contains("ui-unselecting")
            }

            elem.ondragstart = function(e) {
                preventDefault(e);
            }
        });
    };

    Selectable.prototype.mousedown = function(e) {
        preventDefault(e);
        var o = this.config,
            originalEl, tgt = e.target;
        var validEl = tgt.classList.contains(o.filter.replace('.', ''));

        this.container.appendChild(this.lasso);

        this.origin = {
            x: e.pageX,
            y: e.pageY,
        };

        if (o.disabled) {
            return;
        }

        if (validEl) {
            tgt.classList.add('ui-selecting');
        }

        if (o.autoRefresh) {
            this.refresh();
        }

        if (isShiftKey(e)) {
            var item = false;
            var items = [];
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].element === e.target) {
                    item = this.items[i];
                    break;
                }
            };

            var found = false;
            for (var i = item.index; i >= 0; i--) {
                if (this.items[i].selected) {
                    found = true;
                }

                if (found && !this.items[i].selected) {
                    break;
                }

                this.items[i].selecting = true;
            };
        }

        each(this.items, function(item) {
            var el = item.element;
            if (item.selected) {
                item.startselected = true;
                if (!isCmdKey(e) && !isShiftKey(e)) {
                    el.classList.remove("ui-selected");

                    item.selected = false;
                    el.classList.add("ui-unselecting");

                    item.unselecting = true;
                }
            }
            if (el === tgt) {
                originalEl = item;
            }
        });

        this.dragging = true;

        if (validEl) {
            this.emit('selectable.down', originalEl);
        }
    };

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
                over = !(item.rect.left > c.x2 || (item.rect.right < c.x1 || (item.rect.top > c.y2 || item.rect.bottom < c.y1)));
            } else if (o.tolerance == 'fit') {
                over = item.rect.left > c.x1 && (item.rect.right < c.x2 && (item.rect.top > c.y1 && item.rect.bottom < c.y2));
            }
            if (over) {
                if (item.selected) {
                    el.classList.remove("ui-selected");
                    item.selected = false;
                }
                if (item.unselecting) {
                    el.classList.remove("ui-unselecting");
                    item.unselecting = false;
                }
                if (!item.selecting) {
                    el.classList.add("ui-selecting");
                    item.selecting = true;
                }
            } else {
                if (item.selecting) {
                    if (isCmdKey(e) && item.startselected) {
                        el.classList.remove("ui-selecting");
                        item.selecting = false;

                        el.classList.add("ui-selected");
                        item.selected = true;
                    } else {
                        el.classList.remove("ui-selecting");
                        item.selecting = false;

                        if (item.startselected) {
                            el.classList.add("ui-unselecting");
                            item.unselecting = true;
                        }
                    }
                }
                if (el.selected) {
                    if (!isCmdKey(e)) {
                        if (!item.startselected) {
                            el.classList.remove("ui-selected");
                            item.selected = false;

                            el.classList.add("ui-unselecting");
                            item.unselecting = true;
                        }
                    }
                }
            }

        });

        this.emit('selectable.drag', c);
    };

    Selectable.prototype.mouseup = function(e) {
        if (this.dragging) {
            this.dragging = false;
        }

        if (!this.container.contains(e.target)) {
            return
        }

        var that = this;

        this.selectedItems = [];

        css(this.lasso, {
            left: 0,
            width: 0,
            top: 0,
            height: 0
        });

        each(this.items, function(item) {
            var el = item.element;

            if (item.unselecting) {
                el.classList.remove("ui-unselecting");
                item.unselecting = false;
                item.startselected = false;
            }

            if (item.selecting) {
                that.selectItem(item);
            }

            if (item.selected) {
                that.selectedItems.push(item);
                that.emit('selectable.selected', item);
            }
        });

        this.container.removeChild(this.lasso);

        this.emit('selectable.up', this.selectedItems);
    };

    Selectable.prototype.selectItem = function(item) {
        item.element.classList.remove("ui-selecting");
        item.element.classList.add("ui-selected")
        item.selecting = false;
        item.selected = item.startselected = true;
    };

    Selectable.prototype.update = function() {
        each(this.nodes, function(el, i) {
            this.items[i].rect = el.getBoundingClientRect();
        }, this);
    };

    /**
     * Destroy instance
     * @return {void}
     */
    Selectable.prototype.destroy = function() {

        each(this.items, function(item) {
            var el = item.element;

            el.classList.remove("ui-unselecting");
            el.classList.remove("ui-selecting");
            el.classList.remove("ui-selected");
        });

        off(this.container, 'mousedown', this.events.mousedown);
        off(document, 'mousemove', this.events.mousemove);
        off(document, 'mouseup', this.events.mouseup);

        off(window, 'resize', this.events.update);
        off(window, 'scroll', this.events.update);

    };

    return Selectable;
});