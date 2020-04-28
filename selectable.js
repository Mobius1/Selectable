/*!
 *
 * Selectable
 * Copyright (c) 2017 Karl Saunders (http://mobius.ovh)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.17.5
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
     * Check for classList support
     * @type {Boolean}
     */
    var _supports = 'classList' in document.documentElement;

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
    var _isCmdKey = function(e) {
        return !!e.ctrlKey || !!e.metaKey;
    };

    /**
     * Detect SHIFT key press
     * @param  {Object}  e Event interface
     * @return {Boolean}
     */
    var _isShiftKey = function(e) {
        return !!e.shiftKey;
    };

    var _axes = ["x", "y"];
    var _axes1 = {
        x: "x1",
        y: "y1"
    };
    var _axes2 = {
        x: "x2",
        y: "y2"
    };

    /* SELECTABLE */
    var Selectable = function(options) {
        this.version = "0.17.5";
        this.v = this.version.split(".").map(s => parseInt(s, 10));
        this.touch =
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

                touch: true,
                toggleTouch: true,

                toggle: false,
                autoRefresh: true,

                throttle: 50,

                lassoSelect: "normal",

                autoScroll: {
                    threshold: 0,
                    increment: 10,
                },

                saveState: false,

                ignore: false,

                maxSelectable: false,

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

            this.config = _extend(selectableConfig, options);

            this.origin = {
                x: 0,
                y: 0
            };

            this.mouse = {
                x: 0,
                y: 0
            };

            var o = this.config;

            // Is auto-scroll enabled?
            this.autoscroll = isObject(o.autoScroll);

            this.lasso = false;

            if (o.lasso && isObject(o.lasso)) {
                this.lasso = document.createElement('div');
                this.lasso.className = o.classes.lasso;

                _css(this.lasso, _extend({
                    position: "absolute",
                    boxSizing: "border-box",
                    opacity: 0, // border will show even at zero width / height
                }, o.lasso));
            }

            if (this.touch) {
                o.toggle = o.toggleTouch;
            }

            if (!o.touch) {
                this.touch = false;
            }

            this.events = {};

            // bind events
            ["_start", "_touchstart", "_drag", "_end", "_keyup", "_keydown", "_blur", "_focus"].forEach(event => {
                this.events[event] = this[event].bind(this);
            });

            this.events._refresh = _throttle(this.refresh, o.throttle, this);

            if (this.autoscroll) {
                this.events._scroll = this._onScroll.bind(this);
            }

            this.setContainer();

            this.scroll = {
                x: this.bodyContainer ? window.pageXOffset : this.container.scrollLeft,
                y: this.bodyContainer ? window.pageYOffset : this.container.scrollTop
            };

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
            var x = this.bodyContainer ? window.pageXOffset : this.container.scrollLeft;
            var y = this.bodyContainer ? window.pageYOffset : this.container.scrollTop;

            this.offsetWidth = this.container.offsetWidth;
            this.offsetHeight = this.container.offsetHeight;
            this.clientWidth = this.container.clientWidth;
            this.clientHeight = this.container.clientHeight;
            this.scrollWidth = this.container.scrollWidth;
            this.scrollHeight = this.container.scrollHeight;

            // get the parent container DOMRect
            this.boundingRect = _rect(this.container);

            if (this.bodyContainer) {
                this.boundingRect.x2 = ww;
                this.boundingRect.y2 = wh;
            }

            // get the parent container scroll dimensions
            this.scroll = {
                x: x,
                y: y,
                max: {
                    x: this.scrollWidth - (this.bodyContainer ? ww : this.clientWidth),
                    y: this.scrollHeight - (this.bodyContainer ? wh : this.clientHeight)
                },
                size: {
                    x: this.clientWidth,
                    y: this.clientHeight
                },
                scrollable: {
                    x: this.scrollWidth > this.offsetWidth,
                    y: this.scrollHeight > this.offsetHeight
                }
            };

            for (var i = 0; i < this.nodes.length; i++) {
                this.items[i].rect = _rect(this.nodes[i]);
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

            if (this.touch) {
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

            if (this.autoscroll) {
                this.on(this.bodyContainer ? window : this.container, "scroll", e._scroll);
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

            if (this.autoscroll) {
                this.off(this.bodyContainer ? window : this.container, "scroll", e._scroll);
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

            this.bodyContainer = this.container === document.body;

            this._loadItems();

            if (this.autoscroll) {
                var style = _css(this.container);

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
        select: function(item, all, save) {
            var all = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var save = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
            if (isCollection(item)) {
                var count = this.getSelectedItems().length;
                for (var i = 0; i < item.length; i++) {
                    if (!!this.config.maxSelectable && count >= this.config.maxSelectable) {
                        break;
                    }

                    this.select(item[i], false, false);
                    count++;
                }

                if (save && this.config.saveState) {
                    this.state("save");
                }                

                return this.getSelectedItems();
            }

            item = this.get(item);

            if (item) {
                // toggle item if already selected
                if (this.config.toggle && this.config.toggle === "drag" && !all && item.selected && !this.cmdDown) {
                    return this.deselect(item, false);
                }

                var el = item.node,
                    o = this.config.classes;

                classList.remove(el, o.selecting);
                classList.add(el, o.selected);

                item.selecting = false;
                item.selected = true;
                item.startselected = true;

                if (save && this.config.saveState) {
                    this.state("save");
                }

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
        deselect: function(item, save) {

            if (isCollection(item)) {
                for (var i = 0; i < item.length; i++) {
                    this.deselect(item[i], false);
                }
                
                if (save && this.config.saveState) {
                    this.state("save");
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

                if (save && this.config.saveState) {
                    this.state("save");
                }

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
                        this.deselect(test[i], false);
                    } else {
                        this.select(test[i], false, false);
                    }
                }

                if ( this.config.saveState ) {
                    this.state("save");
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

            if (typeof node === "string") {
                node = [].slice.call(this.container.querySelectorAll(node));
            }

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
            if (!!this.config.maxSelectable && this.config.maxSelectable < this.items.length) {
                return this._maxReached();
            }

            for (var i = 0; i < this.items.length; i++) {
                this.select(this.items[i], true, false);
            }

            if (save && this.config.saveState) {
                this.state("save");
            }            
        },

        /**
         * Select all items
         * @return {Void}
         */
        invert: function() {
            var items = this.getItems();

            if (!!this.config.maxSelectable && this.config.maxSelectable < items.length) {
                return this._maxReached();
            }

            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                if (item.selected) {
                    this.deselect(item, false);
                } else {
                    this.select(item, false, false);
                }
            }

            if (this.config.saveState) {
                this.state("save");
            }            
        },

        /**
         * Unselect all items
         * @return {Void}
         */
        clear: function(save) {
            var save = arguments.length > 0 && arguments[0] !== undefined ? false : true;
            for (var i = this.items.length - 1; i >= 0; i--) {
                this.deselect(this.items[i], false);
            }

            if (save && this.config.saveState) {
                this.state("save");
            }            
        },

        /**
         * Get an item
         * @return {Object|Boolean}
         */
        get: function(item) {
            var found = false;

            if (typeof item === "string") {
                item = [].slice.call(this.container.querySelectorAll(item));
            }

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
                this.clear(false);

                // select the items in the saved state
                this.select(this.states[this.currentState], false, false);
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
                this.canShift = keys.indexOf("shiftKey") >= 0;
                this.canCtrl = keys.indexOf("ctrlKey") >= 0;
                this.canMeta = keys.indexOf("metaKey") >= 0;

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

        _maxReached: function() {
            return this.emit("maxitems");
        },

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
                cmd = _isCmdKey(e) && (this.canCtrl || this.canMeta),
                shift = (this.canShift && _isShiftKey(e)),
                count = this.getSelectedItems().length,
                max = o.maxSelectable;

            // max items reached and toggle is enabled or the cmd / shift key is down
            if (!!max && count >= max && (cmd || shift || o.toggle)) {
                return this._maxReached();
            }

            if (!this.container.contains(e.target) || e.which === 3 || e.button > 0 || o.disabled) return;

            // check if the parent container is scrollable and 
            // prevent deselection when clicking on the scrollbars
            if (this.scroll.scrollable.y && evt.pageX > this.boundingRect.x1 + this.scroll.size.x || this.scroll.scrollable.x && evt.pageY > this.boundingRect.y1 + this.scroll.size.y) {
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

            this.dragging = true;

            this.origin = {
                x: (evt.pageX) + (this.bodyContainer ? 0 : this.scroll.x),
                y: (evt.pageY) + (this.bodyContainer ? 0 : this.scroll.y),
                scroll: {
                    x: this.scroll.x,
                    y: this.scroll.y
                }
            };

            if (this.lasso) {
                this.container.appendChild(this.lasso);
            }

            if (node !== this.container) {
                var item = this.get(node);
                item.selecting = true;
                classList.add(node, o.classes.selecting);
            } else {
                // Fixes #32
                if (o.lassoSelect == 'sequential') {
                    node = getClosestNodeToPointer(evt, this.items)
                }
            }

            if (o.autoRefresh) {
                this.refresh();
            }

            if (shift && this.startEl) {

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

                    var deselect = (o.toggle || cmd) ? isCurrentNode : !isCurrentNode && !shift;

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

            this.startEl = node;

            this.emit(this.v[1] < 15 ? "selectable.start" : "start", e, originalEl);
        },

        /**
         * mousmove / touchmove event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _drag: function(e) {
            var o = this.config;
            if (o.disabled || !this.dragging || (_isShiftKey(e) && this.canShift)) return;

            let tmp;
            var evt = this._getEvent(e);
            var cmd = _isCmdKey(e) && (this.canCtrl || this.canMeta);

            this.mouse = {
                x: evt.pageX,
                y: evt.pageY
            };

            this.current = {
                x1: this.origin.x,
                y1: this.origin.y,
                x2: this.mouse.x + (this.bodyContainer ? 0 : this.scroll.x),
                y2: this.mouse.y + (this.bodyContainer ? 0 : this.scroll.y)
            };

            // flip lasso
            for (var i = 0; i < _axes.length; i++) {
                var axis = _axes[i];
                if (this.current[_axes1[axis]] > this.current[_axes2[axis]]) {
                    tmp = this.current[_axes2[axis]];
                    this.current[_axes2[axis]] = this.current[_axes1[axis]];
                    this.current[_axes1[axis]] = tmp;
                }
            }

            // lasso coordinates
            this.coords = {
                x1: this.current.x1,
                x2: this.current.x2 - this.current.x1,
                y1: this.current.y1,
                y2: this.current.y2 - this.current.y1
            };

            if (o.lassoSelect === "normal") {
                /* highlight */
                for (var i = 0; i < this.items.length; i++) {
                    this._highlight(this.items[i], _isCmdKey(e) && (this.canCtrl || this.canMeta), evt);
                }
            } else if (o.lassoSelect === "sequential") {
                this._sequentialSelect(evt);
            }

            // auto scroll
            if (this.autoscroll) {
                // subtract the parent container's position
                if (!this.bodyContainer) {
                    this.coords.x1 -= this.boundingRect.x1;
                    this.coords.y1 -= this.boundingRect.y1;
                }
                this._autoScroll();
            }

            // lasso
            if (this.lasso) {
                // stop lasso causing overflow
                if (!this.bodyContainer && this.autoscroll && !this.config.autoScroll.lassoOverflow) {
                    this._limitLasso();
                }

                // style the lasso
                _css(this.lasso, {
                    left: this.coords.x1,
                    top: this.coords.y1,
                    width: this.coords.x2,
                    height: this.coords.y2,
                    opacity: 1
                });
            }

            // emit the "drag" event
            this.emit(this.v[1] < 15 ? "selectable.drag" : "drag", e, this.coords);
        },

        /**
         * mouseup / touchend event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _end: function(e) {
            if (!this.dragging) return;

            this.dragging = false;

            var that = this,
                o = that.config,
                node = e.target,
                evt = this._getEvent(e),
                endEl,
                selected = [],
                deselected = [],
                count = this.getSelectedItems().length,
                max = o.maxSelectable;

            // remove the lasso
            if (this.lasso && this.container.contains(this.lasso)) {
                this.container.removeChild(this.lasso);
            }

            if (this.lasso) {
                // Reset the lasso
                _css(this.lasso, {
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

            var maxReached = false;

            // loop over items and check their state
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];

                // If we've mousedown'd and mouseup'd on the same selected item
                // toggling it's state to deselected won't work if we've dragged even
                // a small amount. This can happen if we're moving between items quickly
                // while the mouse button is down. We can fix that here.
                if (o.toggle && item.node === endEl && item.node === this.startEl) {
                    if (item.selecting && item.startselected) {
                        item.deselecting = true;
                        item.selecting = false;
                    }
                }

                // item was marked for deselect
                if (item.deselecting) {
                    deselected.push(item);
                    this.deselect(item, false);
                }

                // item was marked for select
                if (item.selecting) {
                    // max items reached
                    if (!!max && count + selected.length >= max) {
                        item.selecting = false;
                        classList.remove(item.node, o.classes.selecting);

                        maxReached = true;
                    } else {
                        selected.push(item);
                        this.select(item, false, false);
                    }
                }
            }

            if (o.saveState) {
                this.state("save");
            }

            this.emit(this.v[1] < 15 ? "selectable.end" : "end", e, selected, deselected);

            if (maxReached) {
                return this._maxReached();
            }
        },

        /**
         * keydown event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _keydown: function(e) {
            this.cmdDown = _isCmdKey(e) && (this.canCtrl || this.canMeta);

            var code = false;
            if (e.key !== undefined) {
                code = e.key;
            } else if (e.keyCode !== undefined) {
                code = e.keyCode;
            }

            if (code) {

                if (this.cmdDown && this.focused) {
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
            this.cmdDown = _isCmdKey(e) && (this.canCtrl || this.canMeta);
        },

        /**
         * scroll event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _onScroll: function(e) {
            this.scroll.x = this.bodyContainer ? window.pageXOffset : this.container.scrollLeft;
            this.scroll.y = this.bodyContainer ? window.pageYOffset : this.container.scrollTop;

            for (var i = 0; i < this.items.length; i++) {
                this.items[i].rect = _rect(this.items[i].node);
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

                    var item = {
                        node: el,
                        rect: _rect(el),
                        startselected: false,
                        selected: classList.contains(el, o.classes.selected),
                        selecting: classList.contains(el, o.classes.selecting),
                        deselecting: classList.contains(el, o.classes.deselecting),
                    };

                    var isTransformed = this._get2DTransformation(el);

                    if (isTransformed) {
                        var offset = _getOffset(el);

                        var trans = isTransformed.translate,
                            origin = isTransformed.origin,
                            scale = isTransformed.scale,
                            w = el.offsetWidth,
                            h = el.offsetHeight,
                            x = offset.left,
                            y = offset.top;

                        var orx = origin.x,
                            ory = origin.y;
                        var hx = (w / 2),
                            hy = (h / 2);
                        var cx = x + ((hx - orx) * scale) + orx,
                            cy = y + ((hy - ory) * scale) + ory;
                        var shx = hx * scale,
                            shy = hy * scale;

                        // rect coords
                        var p = [
                        {
                            x: cx - shx,
                            y: cy - shy
                        },
                        {
                            x: cx + shx,
                            y: cy - shy
                        },
                        {
                            x: cx + shx,
                            y: cy + shy
                        },
                        {
                            x: cx - shx,
                            y: cy + shy
                        }];

                        // rotate coords
                        for (var n = 0; n <= 3; n++) {
                            p[n] = _rotatePoint(p[n].x + trans.x, p[n].y + trans.y, x + orx + trans.x, y + ory + trans.y, isTransformed.angle);
                        }

                        item.transform = {
                            rect: p,
                        };

                    }

                    this.items.push(item);
                }
            }
        },

        /**
         * Get event
         * @return {Object}
         */
        _getEvent: function(e) {
            if (this.touch) {
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

            if (this.bodyContainer) {
                this.mouse.x -= this.scroll.x;
                this.mouse.y -= this.scroll.y;
            }

            // check if we need to scroll
            for (var n = 0; n < _axes.length; n++) {
                var axis = _axes[n];
                if (
                    this.mouse[axis] >= this.boundingRect[_axes2[axis]] - t &&
                    this.scroll[axis] < this.scroll.max[axis]
                ) {
                    inc[axis] = i;
                } else if (
                    this.mouse[axis] <= this.boundingRect[_axes1[axis]] + t &&
                    this.scroll[axis] > 0
                ) {
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
        },

        /**
         * Limit lasso to container boundaries
         * @return {Void}
         */
        _limitLasso: function() {
            for (var i = 0; i < _axes.length; i++) {
                var axis = _axes[i];
                var max = this.boundingRect[_axes1[axis]] + this.scroll.size[axis];
                if (this.mouse[axis] >= max && this.scroll[axis] >= this.scroll.max[axis]) {
                    var off = this.origin[axis] - this.boundingRect[_axes1[axis]] - this.scroll[axis];
                    this.coords[_axes1[axis]] = this.origin[axis] - this.boundingRect[_axes1[axis]];
                    this.coords[_axes2[axis]] = max - off - this.boundingRect[_axes1[axis]];
                }

                if (
                    this.mouse[axis] <= this.boundingRect[_axes1[axis]] &&
                    this.scroll[axis] <= 0
                ) {
                    this.coords[_axes1[axis]] = 0;
                    this.coords[_axes2[axis]] = this.origin[axis] - this.boundingRect[_axes1[axis]];
                }
            }
        },

        _sequentialSelect: function(e) {
            var c = this.config.classes,
                lastEl = document.elementFromPoint(e.pageX, e.pageY - window.pageYOffset),
                start, end, items;
            if (lastEl) {
                lastEl = lastEl.closest(`.${c.selectable}`);
                if (lastEl) {
                    if (this.mouse.y > this.origin.y) {
                        start = this.nodes.indexOf(this.startEl);
                        end = this.nodes.indexOf(lastEl);
                    } else if (this.mouse.y < this.origin.y) {
                        start = this.nodes.indexOf(lastEl);
                        end = this.nodes.indexOf(this.startEl);
                    }

                    for (var i = 0; i < this.items.length; i++) {
                        var item = this.items[i];
                        if (i >= start && i <= end) {
                            this._highlight(item, _isCmdKey(e) && (this.canCtrl || this.canMeta));
                        } else {
                            item.selecting = false;
                            item.node.classList.remove(c.selecting);
                        }
                    }
                }
            }
        },

        /**
         * Highlight an item for selection based on lasso position
         * @param  {Object} item
         * @return {Void}
         */
        _highlight: function(item, cmd, evt) {
            var o = this.config,
                el = item.node,
                over = false;

            var x = this.bodyContainer ? 0 : this.scroll.x;
            var y = this.bodyContainer ? 0 : this.scroll.y;

            if (o.lassoSelect === "normal") {
                if (o.tolerance === "touch") {

                    // element is 2d transformed so we need to do some more complex collision detection
                    if (item.transform) {

                        var a = [
                        {
                            x: this.origin.x,
                            y: this.origin.y
                        },
                        {
                            x: this.mouse.x + x,
                            y: this.origin.y
                        },
                        {
                            x: this.mouse.x + x,
                            y: this.mouse.y + y
                        },
                        {
                            x: this.origin.x,
                            y: this.mouse.y + y
                        }, ];

                        over = _rectsIntersecting(a, item.transform.rect);
                    } else {
                        // element has no 2d transform applied so just detect collision with the bounding box
                        over = !(item.rect.x1 + x > this.current.x2 || (item.rect.x2 + x < this.current.x1 ||
                            (item.rect.y1 + y > this.current.y2 || item.rect.y2 + y < this.current.y1)));
                    }
                } else if (o.tolerance === "fit") {
                    // this relies on detecting the bounding box of the element so
                    // both normal and 2d transformed elements will work								
                    over = item.rect.x1 + x > this.current.x1 && (item.rect.x2 + x < this.current.x2 &&
                        (item.rect.y1 + y > this.current.y1 && item.rect.y2 + y < this.current.y2));
                }
            } else {
                over = true;
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
            this.focused = true;
            classList.add(this.container, "ui-focused");
        },

        /**
         * mouseleave event listener
         * @param  {Object} e Event interface
         * @return {Void}
         */
        _blur: function(e) {
            this.focused = false;
            classList.remove(this.container, "ui-focused");
        },

        /**
         * Get an element's 2d transformation properties
         * @param  {Object} el HTMLElement
         * @return {Bool|Object}
         */
        _get2DTransformation: function(el) {
            var r = window.getComputedStyle(el, null),
                    trans = r.getPropertyValue("-webkit-transform") || r.getPropertyValue("-moz-transform") || r.getPropertyValue("-ms-transform") || r.getPropertyValue("-o-transform") || r.getPropertyValue("transform") || !1;
            if (trans && "none" !== trans) {
                var e = trans.split("(")[1].split(")")[0].split(", "),
                        a = parseFloat(e[0]),
                        n = parseFloat(e[1]),
                        l = Math.sqrt(a * a + n * n),
                        o = r.transformOrigin.split(" ").map(o => parseFloat(o));

                return {
                        angle: Math.round(Math.atan2(n, a) * (180 / Math.PI)),
                        scale: l,
                        origin: { x: parseFloat(o[0]), y: parseFloat(o[1]) },
                        translate: { x: parseFloat(e[4]), y: parseFloat(e[5]) }
                };
            }
            return !1	
        }
    };


    /* ---------- HELPER FUNCTIONS ---------- */
    
    /**
     * Get node closest to mouse pointer / touch position
     * @param {Object} ev 
     * @param {Array} items 
     */
    function getClosestNodeToPointer(ev, items) {
        let lens = [];

        items.forEach(item => {
            let len = Math.hypot(item.rect.x1-parseInt(ev.clientX), item.rect.y1-parseInt(ev.clientY));
            lens.push(parseInt(len));
        });

        let index = lens.indexOf(Math.min(...lens));

        return items[index].node;			
    }    

    /**
     * Find the closest matching ancestor to a node
     * @param  {Object}   el HTMLElement
     * @param  {Function} fn Callback
     * @return {Object|Boolean}
     */
    function closest(el, fn) {
        return el && el !== document.documentElement && (fn(el) ? el : closest(el.parentNode, fn));
    };

    /**
     * Check is item is object
     * @return {Boolean}
     */
    function isObject(val) {
        return Object.prototype.toString.call(val) === "[object Object]";
    };

    /**
     * Check item is iterable
     * @param  {Mixed} arr
     * @return {Boolean}
     */
    function isCollection(arr) {
        return Array.isArray(arr) || arr instanceof HTMLCollection || arr instanceof NodeList;
    };

    /**
     * Check var is a number
     * @param  {Mixed} n
     * @return {Boolean}
     */
    function isNumber(n) {
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
    function _extend(src, props) {
        for (var prop in props) {
            if (props.hasOwnProperty(prop)) {
                var val = props[prop];
                if (val && isObject(val)) {
                    src[prop] = src[prop] || {};
                    _extend(src[prop], val);
                } else {
                    src[prop] = val;
                }
            }
        }
        return src;
    };

    /**
     * Mass assign style properties
     * @param  {Object} i
     * @param  {(String|Object)} t
     * @param  {String|Object}
     */
    function _css(i, t) {
        var e = i.style;
        if (i) {
            if (void 0 === t) return window.getComputedStyle(i);
            if (isObject(t))
                for (var n in t) n in e || (n = "-webkit-" + n), i.style[n] = t[n] + ("string" == typeof t[n] ? "" : "opacity" === n ? "" : "px")
        }
    }

    /**
     * Get an element's DOMRect relative to the document instead of the viewport.
     * @param  {Object} t   HTMLElement
     * @param  {Boolean} e  Include margins
     * @return {Object}     Formatted DOMRect copy
     */
    function _rect(e) {
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
    function _throttle(fn, lim, context) {
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

    function _getOffset(el) {
        var top = 0,
            left = 0;
        do {
            top += el.offsetTop || 0;
            left += el.offsetLeft || 0;
            el = el.offsetParent;
        } while (el);

        return {
            top: top,
            left: left
        };
    };

    function _rotatePoint(px, py, x, y, theta) {
        theta = theta * Math.PI / 180.0;
        return {
            x: Math.cos(theta) * (px - x) - Math.sin(theta) * (py - y) + x,
            y: Math.sin(theta) * (px - x) + Math.cos(theta) * (py - y) + y
        };
    };

    /**
     * Determine whether there is an intersection between the two rects described
     * by the lists of vertices. Uses the Separating Axis Theorem.
     *
     * @param {Array} a Array of coords
     * @param {Array} b Array of coords
     * @return {Bool}
     */
    function _rectsIntersecting(a, b) {
        var r, o, t, e, n, v, i, d, f = [a, b];
        for (e = 0; e < f.length; e++) {
            var g = f[e];
            for (n = 0; n < g.length; n++) {
                var h = (n + 1) % g.length,
                    l = g[n],
                    x = g[h],
                    y = x.y - l.y,
                    c = l.x - x.x;
                for (r = o = void 0, v = 0; v < a.length; v++) t = y * a[v].x + c * a[v].y, (void 0 === r || t < r) && (r = t), (void 0 === o || o < t) && (o = t);
                for (i = d = void 0, v = 0; v < b.length; v++) t = y * b[v].x + c * b[v].y, (void 0 === i || t < i) && (i = t), (void 0 === d || d < t) && (d = t);
                if (o < i || d < r) return !1
            }
        }
        return !0
    };

    return Selectable;
});