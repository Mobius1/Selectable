/*!
 *
 * Selectable
 * Copyright (c) 2017 Karl Saunders (http://mobius.ovh)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.15.2
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

    var startEl, endEl,
        autoscroll,
        scroll,
        touch,
        canShift,
        canCtrl,
        canMeta,
        cmdDown,
        bodyContainer,
        focused,
        boundingRect,
        origin, mouse,
        coords, current,
        dragging,
        offsetHeight, offsetWidth,
        clientHeight, clientWidth,
        scrollHeight, scrollWidth;

    /**
     * Check for classList support
     * @type {Boolean}
     */
    var _supports = 'classList' in document.documentElement;

    /**
     * Find the closest matching ancestor to a node
     * @param  {Object}   el HTMLElement
     * @param  {Function} fn Callback
     * @return {Object|Boolean}
     */
    var closest = function(el, fn) {
        return el && el !== document.documentElement && (fn(el) ? el : closest(el.parentNode, fn));
    };

    /**
     * Check is item is object
     * @return {Boolean}
     */
    var isObject = function(val) {
        return Object.prototype.toString.call(val) === "[object Object]";
    };

    /**
     * Check item is iterable
     * @param  {Mixed} arr
     * @return {Boolean}
     */
    var isCollection = function(arr) {
        return Array.isArray(arr) || arr instanceof HTMLCollection || arr instanceof NodeList;
    };

    /**
     * Check var is a number
     * @param  {Mixed} n
     * @return {Boolean}
     */
    var isNumber = function(n) {
        if ("isInteger" in Number) {
            return Number.isInteger(n);
        }
        return !isNaN(n);
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
     * Mass assign style properties
     * @param  {Object} t
     * @param  {(String|Object)} e
     * @param  {String|Object}
     */
    var css = function(el, obj) {
        var style = el.style;
        if (el) {
            if (obj === undefined) {
                return window.getComputedStyle(el);
            } else {
                if (isObject(obj)) {
                    for (var prop in obj) {
                        if (!(prop in style)) {
                            prop = "-webkit-" + prop;
                        }
                        el.style[prop] = obj[prop] + (typeof obj[prop] === "string" ? "" : prop === "opacity" ? "" : "px");
                    }
                }
            }
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
        };
    };

    /**
     * Returns a function, that, as long as it continues to be invoked, will not be triggered.
     * @param  {Function} fn
     * @param  {Number} lim
     * @param  {Boolean} now
     * @return {Function}
     */
    var throttle = function(fn, lim, context) {
        var wait;
        return function() {
            context = context || this;
            if (!wait) {
                fn.apply(context, arguments);
                wait = true;
                return setTimeout(function() {
                    wait = false;
                }, lim);
            }
        };
    };

    /**
     * classList shim
     * @type {Object}
     */
    var classList = {
        add: function(a, c) {
            _supports ? a.classList.add(c) : classList.contains(a, c) || (a.className = a.className.trim() + " " + c)
        },
        remove: function(a, c) {
            _supports ? a.classList.remove(c) : classList.contains(a, c) && (a.className = a.className.replace(new RegExp("(^|\\s)" + c.split(" ").join("|") +
                "(\\s|$)", "gi"), " "))
        },
        contains: function(a, c) {
            if (a) return _supports ? a.classList.contains(c) : !!a.className && !!a.className.match(new RegExp("(\\s|^)" + c + "(\\s|$)"))
        }
    };

    /**
     * Detect CTRL or META key press
     * @param  {Object}  e Event interface
     * @return {Boolean}
     */
    var isCmdKey = function(e) {
        return !!e.ctrlKey || !!e.metaKey;
    };

    /**
     * Detect SHIFT key press
     * @param  {Object}  e Event interface
     * @return {Boolean}
     */
    var isShiftKey = function(e) {
        return !!e.shiftKey;
    };

    var axes = ["x", "y"];
    var axes1 = {
        x: "x1",
        y: "y1"
    };
    var axes2 = {
        x: "x2",
        y: "y2"
    };

    /* SELECTABLE */
    var Selectable = function(options) {
        this.version = "0.15.2";
        this.v = this.version.split(".").map(s => parseInt(s, 10));
        touch =
            "ontouchstart" in window ||
            (window.DocumentTouch && document instanceof DocumentTouch);
        this.init(options);
    }

    Selectable.prototype = {

        /* ---------- PUBLIC METHODS ---------- */

        /**
         * Init instance
         * @return {void}
         */
        init: function(options) {
            var that = this;

            /**
             * Default configuration properties
             * @type {Object}
             */
            var selectableConfig = {
                filter: ".ui-selectable",
                tolerance: "touch",

                appendTo: document.body,

                toggle: false,
                autoRefresh: true,

                throttle: 50,

                autoScroll: {
                    threshold: 0,
                    increment: 10,
                },

                saveState: false,

                ignore: false,

                lasso: {
                    border: '1px dotted #000',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                },

                keys: ['shiftKey', 'ctrlKey', 'metaKey', ""],

                classes: {
                    lasso: "ui-lasso",
                    selected: "ui-selected",
                    container: "ui-container",
                    selecting: "ui-selecting",
                    selectable: "ui-selectable",
                    deselecting: "ui-deselecting"
                }
            };

            this.config = extend(selectableConfig, options);

            var o = this.config;

            // Is auto-scroll enabled?
            autoscroll = isObject(o.autoScroll);

            this.lasso = false;

            if (o.lasso && isObject(o.lasso)) {
                this.lasso = document.createElement('div');
                this.lasso.className = o.classes.lasso;

                css(this.lasso, extend({
                    position: "absolute",
                    boxSizing: "border-box",
                    opacity: 0, // border will show even at zero width / height
                }, o.lasso));
            }

            if (touch) {
                o.toggle = false;
            }

            this.events = {};

            // bind events
            ["_start", "_touchstart", "_drag", "_end", "_keyup", "_keydown", "_blur", "_focus"].forEach(event => {
                this.events[event] = this[event].bind(this);
            });

            this.events._refresh = throttle(this.refresh, o.throttle, this);

            if (autoscroll) {
                this.events._scroll = this._onScroll.bind(this);
            }

            this.setContainer();

            if (isCollection(o.filter)) {
                this.nodes = [].slice.call(o.filter);
            } else if (typeof o.filter === "string") {
                this.nodes = [].slice.call(this.container.querySelectorAll(o.filter));
            }

            // activate items
            this.nodes.forEach(node => {
                classList.add(node, o.classes.selectable);
            });

            this.update();
            this.enable();

            setTimeout(function() {
                if (o.saveState) {
                    that.state("save");
                }
                that.emit(that.v[1] < 15 ? "selectable.init" : "init");
            }, 10);
        },

        /**
         * Update instance
         * @return {Void}
         */
        update: function() {
            this._loadItems();

            this.refresh();

            this.emit(this.v[1] < 15 ? "selectable.update" : "update", this.items);
        },

        /**
         * Update item coords
         * @return {Void}
         */
        refresh: function() {
            var ww = window.innerWidth;
            var wh = window.innerHeight;
            var x = bodyContainer ? window.pageXOffset : this.container.scrollLeft;
            var y = bodyContainer ? window.pageYOffset : this.container.scrollTop;

            offsetWidth = this.container.offsetWidth;
            offsetHeight = this.container.offsetHeight;
            clientWidth = this.container.clientWidth;
            clientHeight = this.container.clientHeight;
            scrollWidth = this.container.scrollWidth;
            scrollHeight = this.container.scrollHeight;

            // get the parent container DOMRect
            boundingRect = rect(this.container);

            if (bodyContainer) {
                boundingRect.x2 = ww;
                boundingRect.y2 = wh;
            }

            // get the parent container scroll dimensions
            scroll = {
                x: x,
                y: y,
                max: {
                    x: scrollWidth - (bodyContainer ? ww : clientWidth),
                    y: scrollHeight - (bodyContainer ? wh : clientHeight)
                },
                size: {
                    x: clientWidth,
                    y: clientHeight
                },
                scrollable: {
                    x: scrollWidth > offsetWidth,
                    y: scrollHeight > offsetHeight
                }
            };

            for (var i = 0; i < this.nodes.length; i++) {
                this.items[i].rect = rect(this.nodes[i]);
            }
            this.emit(this.v[1] < 15 ? "selectable.refresh" : "refresh");
        },

        /**
         * Add instance event listeners
         * @return {Void}
         */
        bind: function() {
            var e = this.events;

            this.unbind();

            if (touch) {
                this.on(this.container, "touchstart", e._touchstart);
                this.on(document, "touchend", e._end);
                this.on(document, "touchcancel", e._end);

                if (this.lasso !== false) {
                    this.on(document, "touchmove", e._drag);
                }
            } else {
                this.on(this.container, "mousedown", e._start);

                this.on(document, "mouseup", e._end);
                this.on(document, "keydown", e._keydown);
                this.on(document, "keyup", e._keyup);

                this.on(this.container, "mouseenter", e._focus);
                this.on(this.container, "mouseleave", e._blur);

                if (this.lasso !== false) {
                    this.on(document, "mousemove", e._drag);
                }
            }

            if (autoscroll) {
                this.on(bodyContainer ? window : this.container, "scroll", e._scroll);
            }

            this.on(window, 'resize', e._refresh);
            this.on(window, 'scroll', e._refresh);
        },

        /**
         * Remove instance event listeners
         * @return {Void}
         */
        unbind: function() {
            var e = this.events;

            this.off(this.container, 'mousedown', e._start);
            this.off(document, 'mousemove', e._drag);
            this.off(document, 'mouseup', e._end);
            this.off(document, 'keydown', e._keydown);
            this.off(document, 'keyup', e._keyup);

            this.off(this.container, "mouseenter", e._focus);
            this.off(this.container, "mouseleave", e._blur);

            if (autoscroll) {
                this.off(bodyContainer ? window : this.container, "scroll", e._scroll);
            }

            // Mobile
            this.off(this.container, "touchstart", e._start);
            this.off(document, "touchend", e._end);
            this.off(document, "touchcancel", e._end);
            this.off(document, "touchmove", e._drag);

            this.off(window, 'resize', e._refresh);
            this.off(window, 'scroll', e._refresh);
        },

        /**
         * Set the container
         * @param {String|Object} container CSS3 selector string or HTMLElement
         */
        setContainer: function(container) {

            var o = this.config,
                old;

            if (this.container) {
                old = this.container;
                this.unbind();
            }

            container = container || o.appendTo;

            if (typeof container === 'string') {
                this.container = document.querySelector(container);
            } else if (container instanceof Element && container.nodeName) {
                this.container = container;
            }

            classList.add(this.container, o.classes.container);

            if (old) {
                classList.remove(old, o.classes.container);
            }

            bodyContainer = this.container === document.body;

            this._loadItems();

            if (autoscroll) {
                var style = css(this.container);

                if (style.position === "static" && !bodyContainer) {
                    this.container.style.position = "relative"
                }
            }

            this.bind();
        },

        /**
         * Select an item
         * @param  {Object} item
         * @return {Boolean}
         */
        select: function(item, all) {

            if (isCollection(item)) {
                for (var i = 0; i < item.length; i++) {
                    this.select(item[i]);
                }

                return this.getSelectedItems();
            }

            item = this.get(item);

            if (item) {
                // toggle item if already selected
                if (this.config.toggle && this.config.toggle === "drag" && !all && item.selected && !cmdDown) {
                    return this.deselect(item);
                }

                var el = item.node,
                    o = this.config.classes;

                classList.remove(el, o.selecting);
                classList.add(el, o.selected);

                item.selecting = false;
                item.selected = true;
                item.startselected = true;

                this.emit(this.v[1] < 15 ? "selectable.select" : "selecteditem", item);

                return item;
            }

            return false;
        },

        /**
         * Unselect an item
         * @param  {Object} item
         * @return {Boolean}
         */
        deselect: function(item) {

            if (isCollection(item)) {
                for (var i = 0; i < item.length; i++) {
                    this.deselect(item[i]);
                }

                return this.getSelectedItems();
            }

            item = this.get(item);

            if (item) {
                var el = item.node,
                    o = this.config.classes;

                item.selecting = false;
                item.selected = false;
                item.deselecting = false;
                item.startselected = false;

                classList.remove(el, o.deselecting);
                classList.remove(el, o.selecting);
                classList.remove(el, o.selected);

                this.emit(this.v[1] < 15 ? "selectable.deselect" : "deselecteditem", item);

                return item;
            }

            return false;
        },

        /**
         * Toggle an item
         * @param  {Object} item
         * @return {Boolean}
         */
        toggle: function(item) {
            var test = this.get(item);

            if (test) {
                if (!isCollection(test)) {
                    test = [test];
                }

                for (var i = 0; i < test.length; i++) {
                    if (test[i].selected) {
                        this.deselect(test[i]);
                    } else {
                        this.select(test[i]);
                    }
                }
            }
        },

        /**
         * Add a node to the instance
         * @param {Object} node HTMLElement
         * * @return {Void}
         */
        add: function(node) {
            var els = [];

            if (!isCollection(node)) {
                node = [node];
            }

            for (var i = 0; i < node.length; i++) {
                if (this.nodes.indexOf(node[i]) < 0 && node[i] instanceof Element) {
                    els.push(node[i]);
                    classList.add(node[i], this.config.classes.selectable);
                }
            }

            this.nodes = this.nodes.concat(els);

            this.update();

            // emit "addeditem" for each new item
            for (var i = 0; i < els.length; i++) {
                this.emit("addeditem", this.get(els[i]));
            }
        },

        /**
         * Remove an item from the instance so it's deselectable
         * @param  {Mixed} item index, node or object
         * @return {Boolean}
         */
        remove: function(item, stop) {
            item = this.get(item);

            if (item) {
                if (isCollection(item)) {
                    for (var i = item.length - 1; i >= 0; i--) {
                        this.remove(item[i], i > 0);
                    }
                } else {
                    var el = item.node,
                        o = this.config.classes,
                        rm = classList.remove;

                    rm(el, o.selectable);
                    rm(el, o.deselecting);
                    rm(el, o.selecting);
                    rm(el, o.selected);

                    this.nodes.splice(this.nodes.indexOf(item.node), 1);

                    // emit "removeditem"
                    this.emit("removeditem", item);
                }

                if (!stop) {
                    this.update();
                }

                return true;
            }

            return false;
        },

        /**
         * Select all items
         * @return {Void}
         */
        selectAll: function() {
            for (var i = 0; i < this.items.length; i++) {
                this.select(this.items[i], true);
            }
        },

        /**
         * Select all items
         * @return {Void}
         */
        invert: function() {
            var items = this.getItems();

            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                if (item.selected) {
                    this.deselect(item);
                } else {
                    this.select(item);
                }
            }
        },

        /**
         * Unselect all items
         * @return {Void}
         */
        clear: function() {
            for (var i = this.items.length - 1; i >= 0; i--) {
                this.deselect(this.items[i]);
            }
        },

        /**
         * Get an item
         * @return {Object|Boolean}
         */
        get: function(item) {
            var found = false;

            if (isCollection(item)) {
                found = [];

                for (var i = 0; i < item.length; i++) {
                    var itm = this.get(item[i]);

                    if (itm) {
                        found.push(itm);
                    }
                }
            } else {
                // item is an index
                if (!isNaN(item)) {
                    if (this.items.indexOf(this.items[item]) >= 0) {
                        found = this.items[item];
                    }
                }
                // item is a node
                else if (item instanceof Element) {
                    found = this.items[this.nodes.indexOf(item)];
                }
                // item is an item
                else if (isObject(item) && this.items.indexOf(item) >= 0) {
                    found = item;
                }
            }
            return found;
        },

        /**
         * Get all items
         * @return {Array}
         */
        getItems: function() {
            return this.items;
        },

        /**
         * Get all nodes
         * @return {Array}
         */
        getNodes: function() {
            return this.nodes;
        },

        /**
         * Get all selected items
         * @return {Array}
         */
        getSelectedItems: function(invert) {
            return this.getItems().filter(function(item) {
                return invert ? !item.selected : item.selected;
            });
        },

        /**
         * Get all selected nodes
         * @return {Array}
         */
        getSelectedNodes: function() {
            return this.getSelectedItems().map(function(item) {
                return item.node;
            });
        },

        /**
         * State method
         * @param  {String} type
         * @return {Array}
         */
        state: function(type) {
            var changed = false;
            var emit = false;
            switch (type) {
                case "save":
                    this.states = this.states || [];
                    this.states.push(this.getSelectedNodes());

                    // check we're at max saves limit
                    if (isNumber(this.config.saveState)) {
                        if (this.states.length > this.config.saveState) {
                            this.states.shift();
                        }
                    }

                    // move the current state index to the last element
                    this.currentState = this.states.length - 1;
                    emit = true;
                    break;
                case "undo":
                    // decrement the current save state
                    if (this.currentState > 0) {
                        this.currentState--;
                        changed = true;
                        emit = true;
                    }
                    break;
                case "redo":
                    // increment the current save state
                    if (this.currentState < this.states.length - 1) {
                        this.currentState++;
                        changed = true;
                        emit = true;
                    }
                    break;
                case "clear":
                    this.states = [];
                    this.currentState = false;
                    break;
            }

            // check if the state changed
            if (changed) {
                // clear the current selection
                this.clear();

                // select the items in the saved state
                this.select(this.states[this.currentState]);
            }

            // check if we need to emit the event
            if (emit) {
                this.emit((this.v[1] < 15 ? "selectable.state." : "state.") + type, this.states[this.currentState], this.states);
            }
        },

        /**
         * Enable instance
         * @return {Boolean}
         */
        enable: function() {
            if (!this.enabled) {
                var keys = this.config.keys;
                this.enabled = true;
                canShift = keys.indexOf("shiftKey") >= 0;
                canCtrl = keys.indexOf("ctrlKey") >= 0;
                canMeta = keys.indexOf("metaKey") >= 0;

                this.bind();

                classList.add(this.container, this.config.classes.container);

                this.emit(this.v[1] < 15 ? "selectable.enable" : "enabled");
            }

            return this.enabled;
        },

        /**
         * Disable instance
         * @return {Boolean}
         */
        disable: function() {
            if (this.enabled) {
                var keys = this.config.keys;
                this.enabled = false;

                this.unbind();

                classList.remove(this.container, this.config.classes.container);

                this.emit(this.v[1] < 15 ? "selectable.disable" : "disabled");
            }

            return this.enabled;
        },

        /**
         * Destroy instance
         * @return {void}
         */
        destroy: function() {
            this.disable();
            this.listeners = false;
            this.clear();
            this.state("clear");
            this.remove(this.items);
        },

        /**
         * Add custom event listener
         * @param  {String} event
         * @param  {Function} callback
         * @return {Void}
         */
        on: function(listener, fn, capture) {
            if (typeof listener === "string") {
                this.listeners = this.listeners || {};
                this.listeners[listener] = this.listeners[listener] || [];
                this.listeners[listener].push(fn);
            } else {
                arguments[0].addEventListener(arguments[1], arguments[2], false);
            }
        },

        /**
         * Remove custom listener listener
         * @param  {String} listener
         * @param  {Function} callback
         * @return {Void}
         */
        off: function(listener, fn) {
            if (typeof listener === "string") {
                this.listeners = this.listeners || {};
                if (listener in this.listeners === false) return;
                this.listeners[listener].splice(this.listeners[listener].indexOf(fn), 1);
            } else {
                arguments[0].removeEventListener(arguments[1], arguments[2]);
            }
        },

        /**
         * Fire custom listener
         * @param  {String} listener
         * @return {Void}
         */
        emit: function(listener) {
            this.listeners = this.listeners || {};
            if (listener in this.listeners === false) return;
            for (var i = 0; i < this.listeners[listener].length; i++) {
                this.listeners[listener][i].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        },


        /* ---------- PRIVATE METHODS ---------- */

        /**
         * touchstart event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _touchstart: function(e) {
            this.off(this.container, "mousedown", this.events.start);

            this._start(e);
        },

        /**
         * mousedown / touchstart event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _start: function(e) {
            var that = this,
                evt = this._getEvent(e),
                o = this.config,
                originalEl,
                cmd = isCmdKey(e) && (canCtrl || canMeta),
                shift = (canShift && isShiftKey(e));

            if (!this.container.contains(e.target) || e.which === 3 || e.button > 0 || o.disabled) return;

            // check if the parent container is scrollable and 
            // prevent deselection when clicking on the scrollbars
            if (scroll.scrollable.y && evt.pageX > boundingRect.x1 + scroll.size.x || scroll.scrollable.x && evt.pageY > boundingRect.y1 + scroll.size.y) {
                return false;
            }

            // check for ignored descendants
            if (this.config.ignore) {
                var stop = false;
                var ignore = this.config.ignore;

                if (!Array.isArray(ignore)) {
                    ignore = [ignore];
                }

                for (var i = 0; i < ignore.length; i++) {
                    var ancestor = e.target.closest(ignore[i]);

                    if (ancestor) {
                        stop = true;
                        break;
                    }
                }

                if (stop) {
                    return false;
                }
            }

            // selectable nodes may have child elements
            // so let's get the closest selectable node
            var node = closest(e.target, function(el) {
                return el === that.container || classList.contains(el, o.classes.selectable);
            });

            if (!node) return false;

            // allow form inputs to be receive focus
            if (['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'OPTION'].indexOf(e.target.tagName) === -1) {
                e.preventDefault();
            }

            dragging = true;

            origin = {
                x: (evt.pageX) + (bodyContainer ? 0 : scroll.x),
                y: (evt.pageY) + (bodyContainer ? 0 : scroll.y),
                scroll: {
                    x: scroll.x,
                    y: scroll.y
                }
            };

            if (this.lasso) {
                this.container.appendChild(this.lasso);
            }

            if (node !== this.container) {
                var item = this.get(node);
                item.selecting = true;
                classList.add(node, o.classes.selecting);
            }

            if (o.autoRefresh) {
                this.refresh();
            }

            if (shift && startEl) {

                var items = this.items,
                    currentIndex = this.getNodes().indexOf(node),
                    lastIndex = this.getNodes().indexOf(startEl),
                    step = currentIndex < lastIndex ? 1 : -1;

                while ((currentIndex += step) && currentIndex !== lastIndex) {
                    items[currentIndex].selecting = true;
                }
            }

            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i],
                    el = item.node,
                    isCurrentNode = el === node;
                if (item.selected) {

                    item.startselected = true;

                    var deselect = (touch || o.toggle || cmd) ? isCurrentNode : !isCurrentNode && !shift;

                    if (deselect) {
                        classList.remove(el, o.classes.selected);
                        item.selected = false;

                        classList.add(el, o.classes.deselecting);
                        item.deselecting = true;
                    }
                }
                if (isCurrentNode) {
                    originalEl = item;
                }
            }

            startEl = node;

            this.emit(this.v[1] < 15 ? "selectable.start" : "start", e, originalEl);
        },

        /**
         * mousmove / touchmove event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _drag: function(e) {
            var o = this.config;
            if (o.disabled || !dragging || (isShiftKey(e) && canShift)) return;

            let tmp;
            var evt = this._getEvent(e);
            var cmd = isCmdKey(e) && (canCtrl || canMeta);

            mouse = {
                x: evt.pageX,
                y: evt.pageY
            };

            current = {
                x1: origin.x,
                y1: origin.y,
                x2: mouse.x + (bodyContainer ? 0 : scroll.x),
                y2: mouse.y + (bodyContainer ? 0 : scroll.y)
            };

            // flip lasso
            for (var i = 0; i < axes.length; i++) {
                var axis = axes[i];
                if (current[axes1[axis]] > current[axes2[axis]]) {
                    tmp = current[axes2[axis]];
                    current[axes2[axis]] = current[axes1[axis]];
                    current[axes1[axis]] = tmp;
                }
            }

            /* highlight */
            for (var i = 0; i < this.items.length; i++) {
                this._highlight(this.items[i], isCmdKey(e) && (canCtrl || canMeta));
            }

            // lasso coordinates
            coords = {
                x1: current.x1,
                x2: current.x2 - current.x1,
                y1: current.y1,
                y2: current.y2 - current.y1
            };

            // auto scroll
            if (autoscroll) {
                // subtract the parent container's position
                if (!bodyContainer) {
                    coords.x1 -= boundingRect.x1;
                    coords.y1 -= boundingRect.y1;
                }
                this._autoScroll();
            }

            // lasso
            if (this.lasso) {
                // stop lasso causing overflow
                if (!bodyContainer && autoscroll && !this.config.autoScroll.lassoOverflow) {
                    this._limitLasso();
                }

                // style the lasso
                css(this.lasso, {
                    left: coords.x1,
                    top: coords.y1,
                    width: coords.x2,
                    height: coords.y2,
                    opacity: 1
                });
            }

            // emit the "drag" event
            this.emit(this.v[1] < 15 ? "selectable.drag" : "drag", e, coords);
        },

        /**
         * mouseup / touchend event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _end: function(e) {
            if (!dragging) return;

            dragging = false;

            var that = this,
                o = that.config,
                node = e.target,
                evt = this._getEvent(e),
                endEl,
                selected = [],
                deselected = [];

            // remove the lasso
            if (this.lasso && this.container.contains(this.lasso)) {
                this.container.removeChild(this.lasso);
            }

            if (this.lasso) {
                // Reset the lasso
                css(this.lasso, {
                    opacity: 0,
                    left: 0,
                    width: 0,
                    top: 0,
                    height: 0
                });

                // the lasso was the event.target so let's get the actual
                // node below the pointer
                node = document.elementFromPoint(evt.pageX, evt.pageY);

                if (!node) {
                    node = this.container;
                }
            }

            // now let's get the closest valid selectable node
            endEl = closest(node, function(el) {
                return classList.contains(el, o.classes.selectable);
            });

            // loop over items and check their state
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];

                // If we've mousedown'd and mouseup'd on the same selected item
                // toggling it's state to deselected won't work if we've dragged even
                // a small amount. This can happen if we're moving between items quickly
                // while the mouse button is down. We can fix that here.
                if (o.toggle && item.node === endEl && item.node === startEl) {
                    if (item.selecting && item.startselected) {
                        item.deselecting = true;
                        item.selecting = false;
                    }
                }

                // item was marked for deselect
                if (item.deselecting) {
                    deselected.push(item);
                    this.deselect(item);
                }

                // item was marked for select
                if (item.selecting) {
                    selected.push(item);
                    this.select(item);
                }
            }

            if (o.saveState) {
                this.state("save");
            }

            this.emit(this.v[1] < 15 ? "selectable.end" : "end", e, selected, deselected);
        },

        /**
         * keydown event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _keydown: function(e) {
            cmdDown = isCmdKey(e) && (canCtrl || canMeta);

            var code = false;
            if (e.key !== undefined) {
                code = e.key;
            } else if (e.keyCode !== undefined) {
                code = e.keyCode;
            }

            if (code) {

                if (cmdDown && focused) {
                    // e.preventDefault();
                    switch (code) {
                        case 65:
                        case "a":
                        case "A":
                            this.selectAll();
                            break;
                        case 89:
                        case "y":
                        case "Y":
                            this.state("redo");
                            break;
                        case 90:
                        case "z":
                        case "Z":
                            this.state("undo");
                            break;
                    }
                } else {
                    switch (code) {
                        case 32:
                        case " ":
                            this.toggle(document.activeElement);
                            break;
                    }
                }
            }
        },

        /**
         * keyup event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _keyup: function(e) {
            cmdDown = isCmdKey(e) && (canCtrl || canMeta);
        },

        /**
         * scroll event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _onScroll: function(e) {
            scroll.x = bodyContainer ? window.pageXOffset : this.container.scrollLeft;
            scroll.y = bodyContainer ? window.pageYOffset : this.container.scrollTop;

            for (var i = 0; i < this.items.length; i++) {
                this.items[i].rect = rect(this.items[i].node);
            }
        },

        /**
         * Load items from the given filter
         * @return {void}
         */
        _loadItems: function() {
            var o = this.config;

            this.nodes = [].slice.call(this.container.querySelectorAll("." + o.classes.selectable));
            this.items = [];

            if (this.nodes.length) {
                for (var i = 0; i < this.nodes.length; i++) {
                    var el = this.nodes[i];
                    classList.add(el, o.classes.selectable);

                    this.items.push({
                        node: el,
                        rect: rect(el),
                        startselected: false,
                        selected: classList.contains(el, o.classes.selected),
                        selecting: classList.contains(el, o.classes.selecting),
                        deselecting: classList.contains(el, o.classes.deselecting)
                    });
                }
            }
        },

        /**
         * Get event
         * @return {Object}
         */
        _getEvent: function(e) {
            if (touch) {
                if (e.type === "touchend") {
                    return e.changedTouches[0];
                }
                return e.touches[0];
            }
            return e;
        },

        /**
         * Scroll container
         * @return {Void}
         */
        _autoScroll: function() {
            var as = this.config.autoScroll;
            var i = as.increment;
            var t = as.threshold;
            var inc = {
                x: 0,
                y: 0
            };

            if (bodyContainer) {
                mouse.x -= scroll.x;
                mouse.y -= scroll.y;
            }

            // check if we need to scroll
            for (var n = 0; n < axes.length; n++) {
                var axis = axes[n];
                if (
                    mouse[axis] >= boundingRect[axes2[axis]] - t &&
                    scroll[axis] < scroll.max[axis]
                ) {
                    inc[axis] = i;
                } else if (
                    mouse[axis] <= boundingRect[axes1[axis]] + t &&
                    scroll[axis] > 0
                ) {
                    inc[axis] = -i;
                }
            }

            // scroll the container
            if (bodyContainer) {
                window.scrollBy(inc.x, inc.y);
            } else {
                this.container.scrollTop += inc.y;
                this.container.scrollLeft += inc.x;
            }
        },

        /**
         * Limit lasso to container boundaries
         * @return {Void}
         */
        _limitLasso: function() {
            for (var i = 0; i < axes.length; i++) {
                var axis = axes[i];
                var max = boundingRect[axes1[axis]] + scroll.size[axis];
                if (mouse[axis] >= max && scroll[axis] >= scroll.max[axis]) {
                    var off = origin[axis] - boundingRect[axes1[axis]] - scroll[axis];
                    coords[axes1[axis]] = origin[axis] - boundingRect[axes1[axis]];
                    coords[axes2[axis]] = max - off - boundingRect[axes1[axis]];
                }

                if (
                    mouse[axis] <= boundingRect[axes1[axis]] &&
                    scroll[axis] <= 0
                ) {
                    coords[axes1[axis]] = 0;
                    coords[axes2[axis]] = origin[axis] - boundingRect[axes1[axis]];
                }
            }
        },

        /**
         * Highlight an item for selection based on lasso position
         * @param  {Object} item
         * @return {Void}
         */
        _highlight: function(item, cmd) {
            var o = this.config,
                el = item.node,
                over = false;

            var x = bodyContainer ? 0 : scroll.x;
            var y = bodyContainer ? 0 : scroll.y;

            if (o.tolerance === "touch") {
                over = !(item.rect.x1 + x > current.x2 || (item.rect.x2 + x < current.x1 ||
                    (item.rect.y1 + y > current.y2 || item.rect.y2 + y < current.y1)));
            } else if (o.tolerance === "fit") {
                over = item.rect.x1 + x > current.x1 && (item.rect.x2 + x < current.x2 &&
                    (item.rect.y1 + y > current.y1 && item.rect.y2 + y < current.y2));
            }

            if (over) {
                if (item.selected && !o.toggle) {
                    classList.remove(el, o.classes.selected);
                    item.selected = false;
                }
                if (item.deselecting && (!o.toggle || o.toggle && o.toggle !== "drag")) {
                    classList.remove(el, o.classes.deselecting);
                    item.deselecting = false;
                }
                if (!item.selecting) {
                    classList.add(el, o.classes.selecting);
                    item.selecting = true;
                }
            } else {
                if (item.selecting) {
                    classList.remove(el, o.classes.selecting);
                    item.selecting = false;
                    if (cmd && item.startselected) {
                        classList.add(el, o.classes.selected);
                        item.selected = true;
                    } else {
                        if (item.startselected && !o.toggle) {
                            classList.add(el, o.classes.deselecting);
                            item.deselecting = true;
                        }
                    }
                }
                if (el.selected) {
                    if (!cmd) {
                        if (!item.startselected) {
                            classList.remove(el, o.classes.selected);
                            item.selected = false;

                            classList.add(el, o.classes.deselecting);
                            item.deselecting = true;
                        }
                    }
                }
            }
        },

        /**
         * mouseenter event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _focus: function(e) {
            focused = true;
            classList.add(this.container, "ui-focused");
        },

        /**
         * mouseleave event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _blur: function(e) {
            focused = false;
            classList.remove(this.container, "ui-focused");
        }
    };

    return Selectable;
});