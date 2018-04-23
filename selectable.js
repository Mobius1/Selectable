/*!
 *
 * Selectable
 * Copyright (c) 2017 Karl Saunders (http://mobius.ovh)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.10.7
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

    var _version = "0.10.7";

    /**
     * Check for touch screen
     * @type {Boolean}
     */
    var _touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

    /**
     * Check for classList support
     * @type {Boolean}
     */
    var _supports = 'classList' in document.documentElement;

    /**
     * Default configuration properties
     * @type {Object}
     */
    var defaultConfig = {
        toggle: false,
        autoRefresh: true,

        throttle: 50,

        appendTo: document.body,

        filter: ".ui-selectable",
        tolerance: "touch",

        autoScroll: {
            offset: 40,
            increment: 10,
        },

        lasso: {
            border: '1px dotted #000',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
        },

        classes: {
            lasso: "ui-lasso",
            selected: "ui-selected",
            container: "ui-container",
            selecting: "ui-selecting",
            selectable: "ui-selectable",
            unselecting: "ui-unselecting"
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
    var on = function(el, type, callback, scope) {
        el.addEventListener(type, callback, false);
    };

    /**
     * Remove event listener
     * @param  {Object}   el       HTMLElement
     * @param  {String}   type     Event type
     * @param  {Function} callback Event callback
     * @return {Void}
     */
    var off = function(el, type, callback) {
        el.removeEventListener(type, callback);
    };

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
     * Check is item array or array-like
     * @param  {Mixed} arr
     * @return {Boolean}
     */
    var isCollection = function(arr) {
        return Array.isArray(arr) || arr instanceof HTMLCollection || arr instanceof NodeList;
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
    var css = function(el, obj) {
        var style = el.style;
        if (el) {
            if (obj === undefined) {
                return window.getComputedStyle(el);
            } else {
                if (isObject(obj)) {
                    each(obj, function(val, prop) {
                        if (!(prop in style)) {
                            prop = "-webkit-" + prop;
                        }
                        el.style[prop] = val + (typeof val === "string" ? "" : prop === "opacity" ? "" : "px");
                    });
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
     * @param  {Number} wait
     * @param  {Boolean} now
     * @return {Function}
     */
    var throttle = function(fn, limit, context) {
        var wait;
        return function() {
            context = context || this;
            if (!wait) {
                fn.apply(context, arguments);
                wait = true;
                return setTimeout(function() {
                    wait = false;
                }, limit);
            }
        };
    };

    /**
     * classList shim
     * @type {Object}
     */
    var classList = {
        /**
         * Add a class name to a node
         * @param {Object} node Element node
         * @param {String} a Class name
         */
        add: function(node, name) {
            if (_supports) {
                node.classList.add(name);
            } else {
                if (!classList.contains(node, name)) {
                    node.className = node.className.trim() + " " + name;
                }
            }
        },

        /**
         * Remove a class name from a node
         * @param {Object} node Element node
         * @param {String} name Class name
         */
        remove: function(node, name) {
            if (_supports) {
                node.classList.remove(name);
            } else {
                if (classList.contains(node, name)) {
                    node.className = node.className.replace(
                        new RegExp("(^|\\s)" + name.split(" ").join("|") + "(\\s|$)", "gi"),
                        " "
                    );
                }
            }
        },

        /**
         * Check a node has class name
         * @param {Object} node Element node
         * @param {String} name Class name
         */
        contains: function(node, name) {
            if (node)
                return _supports ?
                    node.classList.contains(name) :
                    !!node.className &&
                    !!node.className.match(new RegExp("(\\s|^)" + name + "(\\s|$)"));
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

    /* SELECTABLE */
    function Selectable(options) {
        this.version = _version;
        this.config = extend(defaultConfig, options);
        this.init();
    }

    Selectable.prototype = {
        /**
         * Init instance
         * @return {void}
         */
        init: function() {
            var that = this,
                o = this.config;

            // Is auto-scroll enabled?
            this.autoscroll = isObject(o.autoScroll);

            // Scroll data for auto-scroll
            this.data = {
                x: 0,
                y: 0,
                right: 0,
                left: 0,
                down: 0,
                up: 0
            };

            this.lasso = false;

            if (o.lasso && isObject(o.lasso)) {
                /* lasso */
                this.lasso = document.createElement('div');
                this.lasso.className = o.classes.lasso;

                css(this.lasso, extend({
                    position: "fixed",
                    opacity: 0, // border will show even at zero width / height
                }, o.lasso));
            }

            if (_touch) {
                o.toggle = false;
            }

            this.events = {
                start: this.start.bind(this),
                touchstart: this.touchstart.bind(this),
                drag: this.drag.bind(this),
                end: this.end.bind(this),
                keyup: this.keyup.bind(this),
                keydown: this.keydown.bind(this),
                recalculate: throttle(this.recalculate, o.throttle, this)
            };

            if (this.autoscroll) {
                this.events.scroll = throttle(this.scroll, o.throttle, this);
            }

            this.setContainer();

            this.update();

            this.enable();

            setTimeout(function() {
                that.emit("selectable.init");
            }, 10);
        },

        /**
         * Update instance
         * @return {Void}
         */
        update: function() {
            var o = this.config.classes,
                c = classList.contains;

            this.size = {
                rect: rect(this.container),
                x: this.container.scrollLeft,
                y: this.container.scrollTop,
                w: this.container.scrollWidth,
                h: this.container.scrollHeight
            };

            this.items = [];

            each(this.nodes, function(el, i) {
                classList.add(el, o.selectable);

                this.items[i] = {
                    node: el,
                    rect: rect(el),
                    startselected: false,
                    selected: c(el, o.selected),
                    selecting: c(el, o.selecting),
                    unselecting: c(el, o.unselecting)
                };
            }, this);

            this.emit("selectable.update", this.items);
        },

        /**
         * Add instance event listeners
         * @return {Void}
         */
        bind: function() {
            var e = this.events;

            // Attach event listeners
            on(this.container, 'mousedown', e.start);

            on(document, 'mouseup', e.end);
            on(document, 'keydown', e.keydown);
            on(document, 'keyup', e.keyup);

            if (this.autoscroll) {
                on(this.container, "scroll", e.scroll);
            }

            // Mobile
            on(this.container, "touchstart", e.touchstart);
            on(document, "touchend", e.end);
            on(document, "touchcancel", e.end);

            if (this.lasso !== false) {
                on(document, "touchmove", e.drag);
                on(document, 'mousemove', e.drag);
            }

            on(window, 'resize', e.recalculate);
            on(window, 'scroll', e.recalculate);
        },

        /**
         * Remove instance event listeners
         * @return {Void}
         */
        unbind: function() {
            var e = this.events;

            off(this.container, 'mousedown', e.start);
            off(document, 'mousemove', e.drag);
            off(document, 'mouseup', e.end);
            off(document, 'keydown', e.keydown);
            off(document, 'keyup', e.keyup);

            if (this.autoscroll) {
                off(this.container, "scroll", e.scroll);
            }

            // Mobile
            off(this.container, "touchstart", e.start);
            off(document, "touchend", e.end);
            off(document, "touchcancel", e.end);
            off(document, "touchmove", e.drag);

            off(window, 'resize', e.recalculate);
            off(window, 'scroll', e.recalculate);
        },

        /**
         * touchstart event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        touchstart: function(e) {
            off(this.container, "mousedown", this.events.start);

            this.start(e);
        },

        /**
         * mousedown / touchstart event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        start: function(e) {
            if (!this.container.contains(e.target) || e.button > 0) return;

            var that = this,
                o = this.config,
                originalEl;

            // selectable nodes may have child elements
            // so let's get the closest selectable node
            var node = closest(e.target, function(el) {
                return el === that.container || classList.contains(el, o.classes.selectable);
            });

            if (!node || o.disabled) return false;

            // allow form inputs to be receive focus
            if (['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'OPTION'].indexOf(e.target.tagName) === -1) {
                e.preventDefault();
            }

            var touch = e.type === "touchstart";

            this.dragging = true;

            this.origin = {
                x: touch ? e.touches[0].pageX : e.pageX,
                y: touch ? e.touches[0].pageY : e.pageY,
            };

            if (this.autoscroll) {
                this.origin.scroll = {
                    x: this.container.scrollLeft,
                    y: this.container.scrollTop,
                };
            }

            if (this.lasso) {
                this.container.appendChild(this.lasso);
            }

            if (node !== this.container) {
                classList.add(node, o.classes.selecting);
            }

            if (o.autoRefresh) {
                this.update();
            }

            if (isShiftKey(e) && this.startEl) {

                var items = this.items,
                    currentIndex = this.getNodes().indexOf(node),
                    lastIndex = this.getNodes().indexOf(this.startEl),
                    step = currentIndex < lastIndex ? 1 : -1;

                while ((currentIndex+=step) && currentIndex !== lastIndex) {
                    items[currentIndex].selecting = true;
                }
            }

            each(this.items, function(item) {
                var el = item.node,
                    isCurrentNode = el === node;
                if (item.selected) {

                    item.startselected = true;

                    var unselect = false;

                    if (touch || o.toggle || isCmdKey(e)) {
                        unselect = isCurrentNode;
                    } else {
                        unselect = !isCurrentNode && !isShiftKey(e);
                    }

                    if (unselect) {
                        classList.remove(el, o.classes.selected);
                        item.selected = false;

                        classList.add(el, o.classes.unselecting);
                        item.unselecting = true;
                    }
                }
                if (isCurrentNode) {
                    originalEl = item;
                }
            });

            this.startEl = node;

            this.emit('selectable.start', e, originalEl);
        },

        /**
         * mousmove / touchmove event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        drag: function(e) {
            var o = this.config;

            if (o.disabled || !this.dragging || isShiftKey(e)) return;

            var that = this,
                c,
                tmp,
                t = e.type === "touchmove";

            this.offset = c = {
                x1: this.origin.x,
                y1: this.origin.y,
                x2: t ? e.touches[0].pageX : e.pageX,
                y2: t ? e.touches[0].pageY : e.pageY,
                scroll: {
                    x: 0,
                    y: 0
                }
            };

            if (this.autoscroll) {
                c.scroll = {
                    x: this.container.scrollLeft,
                    y: this.container.scrollTop,
                };

                this.scrolling = {
                    x: 0,
                    y: 0
                };

                this.autoScroll(e);
            }

            if (c.x1 > c.x2) {
                tmp = c.x2;
                c.x2 = c.x1;
                c.x1 = tmp;
            }
            if (c.y1 > c.y2) {
                tmp = c.y2;
                c.y2 = c.y1;
                c.y1 = tmp;
            }

            /* highlight */
            each(this.items, function(item) {
                that.highlight(item, isCmdKey(e));
            });

            var coords = {
                x1: c.x1 + this.data.right,
                x2: (c.x2 + this.data.left) - (c.x1 + this.data.right),
                y1: c.y1 + this.data.down,
                y2: (c.y2 + this.data.up) - (c.y1 + this.data.down),
            };

            if (this.lasso) {
                this.updateHelper(coords);
            }

            this.emit('selectable.drag', e, coords);
        },

        /**
         * mouseup / touchend event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        end: function(e) {
            if (!this.dragging) return;

            this.dragging = false;

            var that = this,
                o = that.config,
                node = e.target,
                endEl,
                selected = [],
                unselected = [],
                evt = e.type === "touchend" ? e.touches[0] || e.changedTouches[0] : e;

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
            }

            // now let's get the closest valid selectable node
            endEl = closest(node, function(el) {
                return classList.contains(el, o.classes.selectable);
            });

            this.data.right = 0;
            this.data.left = 0;
            this.data.down = 0;
            this.data.up = 0;

            // loop over items and check their state
            each(this.items, function(item) {

                // If we've mousedown'd and mouseup'd on the same selected item
                // toggling it's state to unselected won't work if we've dragged even
                // a small amount. This can happen if we're moving between items quickly
                // while the mouse button is down. We can fix that here.
                if (o.toggle && item.node === endEl && item.node === that.startEl) {
                    if (item.selecting && item.startselected) {
                        item.unselecting = true;
                        item.selecting = false;
                    }
                }

                // item was marked for unselect
                if (item.unselecting) {
                    unselected.push(item);
                    this.unselect(item);
                }

                // item was marked for select
                if (item.selecting) {
                    selected.push(item);
                    this.select(item);
                }
            }, this);

            this.emit('selectable.end', e, selected, unselected);
        },

        /**
         * keydown event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        keydown: function(e) {
            this.cmdDown = isCmdKey(e);
            this.shiftDown = isShiftKey(e);

            if (this.cmdDown) {
                var code = e.code || e.keyCode;
                if (code == 65 || code == 97) {
                    e.preventDefault();
                    this.selectAll();
                }
            }
        },

        /**
         * keyup event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        keyup: function(e) {
            this.cmdDown = isCmdKey(e);
            this.shiftDown = isShiftKey(e);
        },

        /**
         * scroll event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        scroll: function(e) {
            each(this.items, function(item) {
                item.rect = rect(item.node);
            });
        },

        /**
         * Update the lasso dimensions
         * @param  {Object} coords Dimensions
         * @return {Void}
         */
        updateHelper: function(coords) {
            var style = {
                opacity: 1,
                left: coords.x1,
                width: coords.x2,
                top: coords.y1,
                height: coords.y2
            };

            if (this.autoscroll) {
                style = extend(style, {
                    zIndex: 0,
                    position: "absolute",
                    left: coords.x1 - this.size.rect.x1 + this.offset.scroll.x,
                    top: coords.y1 - this.size.rect.y1 + this.offset.scroll.y,
                });
            }

            css(this.lasso, style);
        },

        /**
         * Auto scroll
         * @param  {Object} e Event interface
         * @return {Void}
         */
        autoScroll: function(e) {
            var o = this.config.autoScroll,
                r = this.size.rect,
                l = this.offset.scroll.x,
                t = this.offset.scroll.y,
                w = this.size.w,
                h = this.size.h,
                x = 0,
                y = 0,
                nl = l,
                nt = t;

            // Check we're not scrolled all the way to the top or bottom
            if (t > 0 || t < h - r.height) {
                // Check we're in the auto-scroll trigger zone
                if (e.pageY >= r.y2 - o.offset || e.pageY <= r.y1 + o.offset) {
                    if (e.pageY >= r.y2 - o.offset) { // scrolling down
                        y = o.increment;

                        this.scrolling.y = 1;
                    } else if (e.pageY <= r.y1 + o.offset) { // scrolling up
                        y = -o.increment;

                        this.scrolling.y = -1;
                    }

                    nt += y;

                    // scroll the container and store the new position
                    this.container.scrollTop = this.offset.scroll.y = nt;
                }
            }

            // Check we're not scrolled all the way to the left or right
            if (l > 0 || l < w - r.width) {
                // Check we're in the auto-scroll trigger zone
                if (e.pageX >= r.x2 - o.offset || e.pageX <= r.x1 + o.offset) {
                    if (e.pageX >= r.x2 - o.offset) { // scrolling right
                        x = o.increment;

                        this.scrolling.x = 1;
                    } else if (e.pageX <= r.x1 + o.offset) { // scrolling left
                        x = -o.increment;

                        this.scrolling.x = -1;
                    }

                    nl += x;

                    // scroll the container and store the new position
                    this.container.scrollLeft = this.offset.scroll.x = nl;
                }
            }

            this.data.x = (this.origin.scroll.x - this.offset.scroll.x);
            this.data.y = (this.origin.scroll.y - this.offset.scroll.y);

            if (this.scrolling.x > 0) {
                this.data.right = this.data.x;
            } else if (this.scrolling.x < 0) {
                this.data.left = this.data.x;
            }

            if (this.scrolling.y > 0) {
                this.data.down = this.data.y;
            } else if (this.scrolling.y < 0) {
                this.data.up = this.data.y;
            }
        },

        /**
         * Highlight an item
         * @param  {Object} item   The item
         * @return {Void}
         */
        highlight: function(item, cmd) {
            var offset = this.offset,
                o = this.config,
                cls = o.classes,
                el = item.node,
                r = item.rect,
                d = this.data,
                over = false;

            if (o.tolerance == "touch") {
                over = !(r.x1 > offset.x2 + d.left || (r.x2 < offset.x1 + d.right ||
                    (r.y1 > offset.y2 + d.up || r.y2 < offset.y1 + d.down)));
            } else if (o.tolerance == "fit") {
                over = r.x1 > offset.x1 + d.right && (r.x2 < offset.x2 + d.left &&
                    (r.y1 > offset.y1 + d.down && r.y2 < offset.y2 + d.up));
            }

            if (over) {
                if (item.selected && !o.toggle) {
                    classList.remove(el, cls.selected);
                    item.selected = false;
                }
                if (item.unselecting && (!o.toggle || o.toggle && o.toggle !== "drag")) {
                    classList.remove(el, cls.unselecting);
                    item.unselecting = false;
                }
                if (!item.selecting) {
                    classList.add(el, cls.selecting);
                    item.selecting = true;
                }
            } else {
                if (item.selecting) {
                    if (cmd && item.startselected) {
                        classList.remove(el, cls.selecting);
                        item.selecting = false;

                        classList.add(el, cls.selected);
                        item.selected = true;
                    } else {
                        classList.remove(el, cls.selecting);
                        item.selecting = false;

                        if (item.startselected && !o.toggle) {
                            classList.add(el, cls.unselecting);
                            item.unselecting = true;
                        }
                    }
                }
                if (el.selected) {
                    if (!cmd) {
                        if (!item.startselected) {
                            classList.remove(el, cls.selected);
                            item.selected = false;

                            classList.add(el, cls.unselecting);
                            item.unselecting = true;
                        }
                    }
                }
            }
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

            classList.add(this.container, this.config.classes.container);

            if (old) {
                classList.remove(old, this.config.classes.container);
            }

            if (isCollection(o.filter)) {
                this.nodes = [].slice.call(o.filter);
            } else if (typeof o.filter === "string") {
                this.nodes = [].slice.call(this.container.querySelectorAll(o.filter));
            }

            if (this.autoscroll) {
                var style = css(this.container);

                if (style.position === "static") {
                    css(this.container, {
                        position: "relative"
                    });
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
                each(item, function(itm) {
                    this.select(itm);
                }, this);

                return this.getSelectedItems();
            }

            item = this.get(item);

            if (item) {
                // toggle item if already selected
                if (this.config.toggle && this.config.toggle === "drag" && !all && item.selected && !this.cmdDown) {
                    return this.unselect(item);
                }

                var el = item.node,
                    o = this.config.classes;

                classList.remove(el, o.selecting);
                classList.add(el, o.selected);

                item.selecting = false;
                item.selected = true;
                item.startselected = true;

                this.emit('selectable.select', item);

                return item;
            }

            return false;
        },

        /**
         * Unselect an item
         * @param  {Object} item
         * @return {Boolean}
         */
        unselect: function(item) {

            if (isCollection(item)) {
                each(item, function(itm) {
                    this.unselect(itm);
                }, this);

                return this.getSelectedItems();
            }

            item = this.get(item);

            if (item) {
                var el = item.node,
                    o = this.config.classes;

                item.selecting = false;
                item.selected = false;
                item.unselecting = false;
                item.startselected = false;

                classList.remove(el, o.unselecting);
                classList.remove(el, o.selecting);
                classList.remove(el, o.selected);

                this.emit('selectable.unselect', item);

                return item;
            }

            return false;
        },

        /**
         * Add a node to the instance
         * @param {Object} node HTMLElement
         * * @return {Void}
         */
        add: function(node) {
            if (isCollection(node)) {
                each(node, function(el) {
                    if (this.nodes.indexOf(el) < 0 && el instanceof Element) {
                        this.nodes.push(el);
                    }
                }, this);
            } else {
                if (this.nodes.indexOf(node) < 0 && node instanceof Element) {
                    this.nodes.push(node);
                }
            }

            this.update();
        },

        /**
         * Remove an item from the instance so it's unselectable
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
                    rm(el, o.unselecting);
                    rm(el, o.selecting);
                    rm(el, o.selected);

                    this.nodes.splice(this.nodes.indexOf(item.node), 1);
                }

                if (!stop) {
                    this.update();
                }

                return true;
            }

            return false;
        },

        /**
         * Update item coords
         * @return {Void}
         */
        recalculate: function() {
            each(this.nodes, function(el, i) {
                this.items[i].rect = rect(el);
            }, this);
            this.emit('selectable.recalculate');
        },

        /**
         * Select all items
         * @return {Void}
         */
        selectAll: function() {
            each(this.items, function(item) {
                this.select(item, true);
            }, this);
        },

        /**
         * Unselect all items
         * @return {Void}
         */
        clear: function() {
            for (var i = this.items.length - 1; i >= 0; i--) {
                this.unselect(this.items[i]);
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
                each(item, function(i) {
                    i = this.get(i);

                    if (i)
                        found.push(i);
                }, this);
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
        getSelectedItems: function() {
            return this.getItems().filter(function(item) {
                return item.selected;
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
         * Add custom event listener
         * @param  {String} event
         * @param  {Function} callback
         * @return {Void}
         */
        on: function(event, callback) {
            this.events = this.events || {};
            this.events[event] = this.events[event] || [];
            this.events[event].push(callback);
        },

        /**
         * Remove custom event listener
         * @param  {String} event
         * @param  {Function} callback
         * @return {Void}
         */
        off: function(event, callback) {
            this.events = this.events || {};
            if (event in this.events === false) return;
            this.events[event].splice(this.events[event].indexOf(callback), 1);
        },

        /**
         * Fire custom event
         * @param  {String} event
         * @return {Void}
         */
        emit: function(event) {
            this.events = this.events || {};
            if (event in this.events === false) return;
            for (var i = 0; i < this.events[event].length; i++) {
                this.events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        },

        /**
         * Enable instance
         * @return {Boolean}
         */
        enable: function() {
            if (!this.enabled) {
                this.enabled = true;

                this.bind();

                classList.add(this.container, this.config.classes.container);

                this.emit('selectable.enable');
            }

            return this.enabled;
        },

        /**
         * Disable instance
         * @return {Boolean}
         */
        disable: function() {
            if (this.enabled) {
                this.enabled = false;

                this.unbind();

                classList.remove(this.container, this.config.classes.container);

                this.emit('selectable.disable');
            }

            return this.enabled;
        },

        /**
         * Destroy instance
         * @return {void}
         */
        destroy: function() {
            this.disable();

            this.remove(this.items);

            each(this, function(val, prop) {
                if (prop !== "version" && prop !== "config") delete(this[prop]);
            }, this);
        }
    };

    return Selectable;
});