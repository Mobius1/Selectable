/*!
 *
 * Selectable
 * Copyright (c) 2017 Karl Saunders (http://mobius.ovh)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.13.3
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

    var _version = "0.13.3";

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
    var Selectable = function(options) {

        /**
         * Default configuration properties
         * @type {Object}
         */
        var defaultConfig = {
            filter: ".ui-selectable",
            tolerance: "touch",

            appendTo: document.body,

            toggle: false,
            autoRefresh: true,

            throttle: 50,

            autoScroll: {
                threshold: 0,
                increment: 20,
            },

            ignore: false,

            lasso: {
                border: '1px dotted #000',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
            },

            keys: ['shiftKey', 'ctrlKey', 'metaKey'],

            classes: {
                lasso: "ui-lasso",
                selected: "ui-selected",
                container: "ui-container",
                selecting: "ui-selecting",
                selectable: "ui-selectable",
                unselecting: "ui-unselecting"
            }
        };

        this.axes = ["x", "y"];
        this.axes1 = {x: "x1", y: "y1"};
        this.axes2 = {x: "x2", y: "y2"};        

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
            var that = this, o = this.config;

            // Is auto-scroll enabled?
            this.autoscroll = isObject(o.autoScroll);

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

            if (_touch) { o.toggle = false; }

            this.events = {};

            ["start", "touchstart", "drag", "end", "keyup", "keydown"].forEach(event => {
                this.events[event] = this[event].bind(this);
            });

            this.events.recalculate = throttle(this.recalculate, o.throttle, this);

            if (this.autoscroll) {
                this.events.scroll = this.onScroll.bind(this);
            }

            this.setContainer();
            this.update();
            this.enable();

            setTimeout(function() { that.emit("selectable.init"); }, 10);
        },

        /**
         * Update instance
         * @return {Void}
         */
        update: function() {
            var o = this.config.classes,
                x = this.bodyContainer ? window.pageXOffset : this.container.scrollLeft,
                y = this.bodyContainer ? window.pageYOffset : this.container.scrollTop,
                w = this.container.scrollWidth,
                h = this.container.scrollHeight;

            this.rect = rect(this.container);

            this.scroll = { x, y,
                max: { x: w - this.container.clientWidth, y: h - this.container.clientHeight }
            };

            this.items = [];

            for (var el of this.nodes) {
                classList.add(el, o.selectable);

                this.items.push({
                    node: el,
                    rect: rect(el),
                    startselected: false,
                    selected: classList.contains(el, o.selected),
                    selecting: classList.contains(el, o.selecting),
                    unselecting: classList.contains(el, o.unselecting)
                });
            }

            this.emit("selectable.update", this.items);
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

        /**
         * Add instance event listeners
         * @return {Void}
         */
        bind: function() {
            var e = this.events;

            this.unbind();

            if (_touch) {
                this.on(this.container, "touchstart", e.touchstart);
                this.on(document, "touchend", e.end);
                this.on(document, "touchcancel", e.end);

                if (this.lasso !== false) {
                    this.on(document, "touchmove", e.drag);
                }
            } else {
                this.on(this.container, 'mousedown', e.start);

                this.on(document, 'mouseup', e.end);
                this.on(document, 'keydown', e.keydown);
                this.on(document, 'keyup', e.keyup);

                if (this.lasso !== false) {
                    this.on(document, 'mousemove', e.drag);
                }
            }

            if (this.autoscroll) {
                this.on(this.bodyContainer ? window : this.container, "scroll", e.scroll);
            }

            this.on(window, 'resize', e.recalculate);
            this.on(window, 'scroll', e.recalculate);
        },

        /**
         * Remove instance event listeners
         * @return {Void}
         */
        unbind: function() {
            var e = this.events;

            this.off(this.container, 'mousedown', e.start);
            this.off(document, 'mousemove', e.drag);
            this.off(document, 'mouseup', e.end);
            this.off(document, 'keydown', e.keydown);
            this.off(document, 'keyup', e.keyup);

            if (this.autoscroll) {
                this.off(this.bodyContainer ? window : this.container, "scroll", e.scroll);
            }

            // Mobile
            this.off(this.container, "touchstart", e.start);
            this.off(document, "touchend", e.end);
            this.off(document, "touchcancel", e.end);
            this.off(document, "touchmove", e.drag);

            this.off(window, 'resize', e.recalculate);
            this.off(window, 'scroll', e.recalculate);
        },

        /**
         * touchstart event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        touchstart: function(e) {
            this.off(this.container, "mousedown", this.events.start);

            this.start(e);
        },

        /**
         * mousedown / touchstart event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        start: function(e) {
            var that = this,
                o = this.config,
                target = e.target,
                touch = e.type === "touchstart",
                w = window,
                originalEl,
                cmd = isCmdKey(e) && (this.canCtrl || this.canMeta),
                sft = (this.canShift && isShiftKey(e));

            if (!this.container.contains(target) || e.which === 3 || e.button > 0) return;

            // check for ignored descendants
            if (this.config.ignore) {
                var stop = false;
                var ignore = this.config.ignore;

                if (!Array.isArray(ignore)) {
                    ignore = [ignore];
                }

                for (var i = 0; i < ignore.length; i++) {
                    var ancestor = target.closest(ignore[i]);

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
            var node = closest(target, function(el) {
                return el === that.container || classList.contains(el, o.classes.selectable);
            });

            if (!node || o.disabled) return false;

            // allow form inputs to be receive focus
            if (['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'OPTION'].indexOf(target.tagName) === -1) {
                e.preventDefault();
            }

            this.dragging = true;

            this.origin = {
                x: (touch ? e.touches[0].pageX : e.pageX) + (this.bodyContainer ? 0 : this.scroll.x),
                y: (touch ? e.touches[0].pageY : e.pageY) + (this.bodyContainer ? 0 : this.scroll.y),
                scroll: {
                    x: this.scroll.x,
                    y: this.scroll.y
                }
            };

            if (this.lasso) {
                this.container.appendChild(this.lasso);
            }

            if (node !== this.container) {
                classList.add(node, o.classes.selecting);
            }

            if (o.autoRefresh) {
                this.update();
            }

            if (sft && this.startEl) {

                var items = this.items,
                    currentIndex = this.getNodes().indexOf(node),
                    lastIndex = this.getNodes().indexOf(this.startEl),
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

                    var unselect = (touch || o.toggle || cmd) ? isCurrentNode : !isCurrentNode && !sft;

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
            }

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
            var mouse = { x: evt.pageX, y: evt.pageY };

            if (o.disabled || !this.dragging || (isShiftKey(e) && this.canShift)) return;

            var tmp,
                w = window,
                evt = (e.type === "touchmove" ? e.touches[0] : e);

            this.current = {
                x1: this.origin.x,
                y1: this.origin.y,
                x2: mouse.x + (this.bodyContainer ? 0 : this.scroll.x),
                y2: mouse.y + (this.bodyContainer ? 0 : this.scroll.y),
            };

            // flip lasso
            for ( var axis of this.axes ) {
                if (this.current[this.axes1[axis]] > this.current[this.axes2[axis]]) {
                    tmp = this.current[this.axes2[axis]];
                    this.current[this.axes2[axis]] = this.current[this.axes1[axis]];
                    this.current[this.axes1[axis]] = tmp;
                }
            }

            /* highlight */
            for (var item in this.items) {
                this.highlight(item, isCmdKey(e) && (this.canCtrl || this.canMeta));
            };

            this.coords = {
                x1: this.current.x1,
                x2: (this.current.x2) - (this.current.x1),
                y1: this.current.y1,
                y2: (this.current.y2) - (this.current.y1),
            };

            if (!this.bodyContainer) {
                this.coords.x1 -= this.rect.x1;
                this.coords.y1 -= this.rect.y1;
            }

            // auto scroll
            if (this.autoscroll) {
                var as = this.config.autoScroll;
                var i = as.increment;
                var t = as.threshold;
                var inc = { x: 0, y: 0 };

                if (this.bodyContainer) {
                    mouse.x -= this.scroll.x;
                    mouse.y -= this.scroll.y;
                }

                // check if we need to scroll
                for ( var axis of this.axes ) {
                    if (mouse[axis] >= this.rect[this.axes2[axis]] - t && this.scroll[axis] < this.scroll.max[axis]) {
                        inc[axis] = i;
                    } else if (mouse[axis] <= this.rect[this.axes1[axis]] + t && this.scroll[axis] > 0) {
                        inc[axis] = -i;
                    }
                }

                // scroll the container
                if (this.bodyContainer) {
                    window.scrollBy(inc.x, inc.y);
                } else {
                    this.container.scrollTop += inc.y;
                    this.container.scrollLeft += inc.x;
                }
            }

            if (this.lasso) {
                // stop lasso causing overflow
                if (!this.bodyContainer && !this.config.autoScroll.lassoOverflow) {
                    for ( var axis of this.axes ) {
                        var max = this.rect[this.axes1[axis]] + this.scroll.size[axis];
                        if (mouse[axis] >= max && this.scroll[axis] >= this.scroll.max[axis]) {
                            var off = this.origin[axis] - this.rect[this.axes1[axis]] - this.scroll[axis];
                            this.coords[this.axes1[axis]] = this.origin[axis] - this.rect[this.axes1[axis]];
                            this.coords[this.axes2[axis]] = max - off - this.rect[this.axes1[axis]];
                        }
        
                        if (mouse[axis] <= this.rect[this.axes1[axis]] && this.scroll[axis] <= 0) {
                            this.coords[this.axes1[axis]] = 0;
                            this.coords[this.axes2[axis]] = this.origin[axis] - this.rect[this.axes1[axis]];
                        }
                    }
                }
    
                // style the lasso
                css(this.lasso, {
                    left: this.coords.x1,
                    top: this.coords.y1,
                    width: this.coords.x2,
                    height: this.coords.y2,
                    opacity: 1,
                });
            }

            this.emit('selectable.drag', e, this.coords);
        },

        /**
         * mouseup / touchend event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        end: function(e) {
            if (!this.dragging) return;

            this.dragging = false;
            this.stopY = false;

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

            // loop over items and check their state
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];

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
            }

            this.emit('selectable.end', e, selected, unselected);
        },

        /**
         * keydown event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        keydown: function(e) {
            var o = this.config.keys;
            this.cmdDown = isCmdKey(e) && (this.canCtrl || this.canMeta);

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
            var o = this.config.keys;
            this.cmdDown = isCmdKey(e) && (this.canCtrl || this.canMeta);
        },

        /**
         * scroll event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        onScroll: function(e) {
            this.scroll.x = this.bodyContainer ? window.pageXOffset : this.container.scrollLeft;
            this.scroll.y = this.bodyContainer ? window.pageYOffset : this.container.scrollTop;

            for (var i = 0; i < this.items.length; i++) {
                this.items[i].rect = rect(this.items[i].node);
            }
        },

        /**
         * Highlight an item
         * @param  {Object} item   The item
         * @return {Void}
         */
        highlight: function(item, cmd) {
            var o = this.config,
                cls = o.classes,
                el = item.node,
                r = item.rect,
                c = this.current,
                s = this.scroll,
                cl = classList,
                over = false;

            var x = s.x;
            var y = s.y;

            if (this.bodyContainer) {
                x = 0;
                y = 0;
            }

            if (o.tolerance === "touch") {
                over = !(r.x1 + x > c.x2 || (r.x2 + x < c.x1 ||
                    (r.y1 + y > c.y2 || r.y2 + y < c.y1)));
            } else if (o.tolerance === "fit") {
                over = r.x1 + x > c.x1 && (r.x2 + x < c.x2 &&
                    (r.y1 + y > c.y1 && r.y2 + y < c.y2));
            }

            if (over) {
                if (item.selected && !o.toggle) {
                    cl.remove(el, cls.selected);
                    item.selected = false;
                }
                if (item.unselecting && (!o.toggle || o.toggle && o.toggle !== "drag")) {
                    cl.remove(el, cls.unselecting);
                    item.unselecting = false;
                }
                if (!item.selecting) {
                    cl.add(el, cls.selecting);
                    item.selecting = true;
                }
            } else {
                if (item.selecting) {
                    if (cmd && item.startselected) {
                        cl.remove(el, cls.selecting);
                        item.selecting = false;

                        cl.add(el, cls.selected);
                        item.selected = true;
                    } else {
                        cl.remove(el, cls.selecting);
                        item.selecting = false;

                        if (item.startselected && !o.toggle) {
                            cl.add(el, cls.unselecting);
                            item.unselecting = true;
                        }
                    }
                }
                if (el.selected) {
                    if (!cmd) {
                        if (!item.startselected) {
                            cl.remove(el, cls.selected);
                            item.selected = false;

                            cl.add(el, cls.unselecting);
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

            classList.add(this.container, o.classes.container);

            if (old) {
                classList.remove(old, o.classes.container);
            }

            this.bodyContainer = this.container === document.body;

            if (isCollection(o.filter)) {
                this.nodes = [].slice.call(o.filter);
            } else if (typeof o.filter === "string") {
                this.nodes = [].slice.call(this.container.querySelectorAll(o.filter));
            }

            if (this.autoscroll) {
                var style = css(this.container);

                if (style.position === "static" && !this.bodyContainer) {
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
                for (var i = 0; i < item.length; i++) {
                    this.unselect(item[i]);
                }

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
            var els = this.nodes;
            if (isCollection(node)) {
                for (var i = 0; i < node.length; i++) {
                    if (els.indexOf(node[i]) < 0 && node[i] instanceof Element) {
                        els.push(node[i]);
                    }
                }
            } else {
                if (els.indexOf(node) < 0 && node instanceof Element) {
                    els.push(node);
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
            for (var i = 0; i < this.nodes.length; i++) {
                this.items[i].rect = rect(this.nodes[i]);
            }
            this.emit('selectable.recalculate');
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
                    this.unselect(item);
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
         * Enable instance
         * @return {Boolean}
         */
        enable: function() {
            if (!this.enabled) {
                var keys = this.config.keys;
                this.enabled = true;
                this.canShift = keys.indexOf("shiftKey") >= 0;
                this.canCtrl = keys.indexOf("ctrlKey") >= 0;
                this.canMeta = keys.indexOf("metaKey") >= 0;

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
                var keys = this.config.keys;
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
            this.listeners = false;
            this.remove(this.items);
        }
    };

    return Selectable;
});