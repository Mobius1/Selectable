import {
    extend,
    css,
    rect,
    throttle,
} from "./utils/utils";

import is from "./utils/is";
import Emitter from "./utils/emitter";

/* SELECTABLE */
export default class Selectable extends Emitter {
    constructor(options) {
        super();
        /**
         * Default configuration properties
         * @type {Object}
         */
        const defaultConfig = {
            filter: ".ui-selectable",
            tolerance: "touch",

            appendTo: document.body,

            toggle: false,
            autoRefresh: true,

            throttle: 50,

            autoScroll: {
                threshold: 0,
                increment: 20,
                lassoOverflow: false
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
                deselecting: "ui-deselecting"
            }
        };

        this.version = "1.0.0-beta";

        // check if we're on a mobile device
        this.touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

        // merge config
        this.config = extend(defaultConfig, options);

        this.axes = ["x", "y"];
        this.axes1 = {
            x: "x1",
            y: "y1"
        };
        this.axes2 = {
            x: "x2",
            y: "y2"
        };

        //initialise instance
        this.init();
    }

    /**
     * Init instance
     * @return {void}
     */
    init() {
        const that = this;
        const o = this.config;

        // Is auto-scroll enabled?
        this.autoscroll = is.Object(o.autoScroll);

        this.lasso = false;

        if (o.lasso && is.Object(o.lasso)) {
            /* lasso */
            this.lasso = document.createElement('div');
            this.lasso.className = o.classes.lasso;

            css(this.lasso, extend({
                position: "absolute",
                opacity: 0, // border will show even at zero width / height
            }, o.lasso));

            if (css(this.lasso).boxSizing !== "border-box") {
                this.lasso.style.boxSizing = "border-box";
            }
        }

        if (this.touch) {
            o.toggle = false;
        }

		this.events = {};

		["start", "touchstart", "drag", "end", "keyup", "keydown"].forEach(event => {
			this.events[event] = this[event].bind(this);
		});

		this.events.refresh = throttle(this.refresh, o.throttle, this);

		if (this.autoscroll) {
			this.events.scroll = this.onScroll.bind(this);
		}

        // set the parent container
        this.setContainer();

        // update instance
        this.update();

        // enable instance
        this.enable();

        // we're ready so fire the "emit" event
        setTimeout(() => {
            that.emit("selectable.init");
        }, 10);
    }

    /**
     * Add instance event listeners
     * @return {Void}
     */
    bind() {
        const e = this.events;

        // check we have no previous event listeners lurking
        this.unbind();

        // add event listeners for desktop and touch devices
        if (this.touch) {
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

            this.over = false;
            this.on(this.container, "mouseenter", e.mouseenter);
            this.on(this.container, "mouseleave", e.mouseleave);

            if (this.lasso !== false) {
                this.on(document, 'mousemove', e.drag);
            }
        }

        // if autoScroll is enabled, add the event listener
        if (this.autoscroll) {
            this.on(this.bodyContainer ? window : this.container, "scroll", e.scroll);
        }

        // add the resize and scroll event listeners
        this.on(window, 'resize', e.refresh);
        this.on(window, 'scroll', e.refresh);
    }

    /**
     * Update instance
     * @return {Void}
     */
    update() {
        const x = this.bodyContainer ? window.pageXOffset : this.container.scrollLeft;
        const y = this.bodyContainer ? window.pageYOffset : this.container.scrollTop;

        for (const size of ["scroll", "offset", "client"]) {
            this[`${size}Width`] = this.container[`${size}Width`];
            this[`${size}Height`] = this.container[`${size}Height`];
        }

        // get the parent container DOMRect
        this.rect = rect(this.container);

        // get the parent container scroll dimensions
        this.scroll = {
            x,
            y,
            max: {
                x: this.scrollWidth - this.clientWidth,
                y: this.scrollHeight - this.clientHeight
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

        // emit the "update" event
		this.emit("selectable.update", this.items);
		
		return this;
    }

    /**
     * Update item coords
     * @return {Object} instance
     */
    refresh() {
		for (const item of this.items) {
			item.rect = rect(item.node);
		}

        this.emit('selectable.refresh');

        return this;
    }

    /**
     * mouseenter event listener callback
     * @param {Object} e Event interface 
     */
    mouseenter(e) {
        this.over = true;
    }

    /**
     * mouseleave event listener callback
     * @param {Object} e Event interface 
     */
    mouseleave(e) {
        this.over = false;
    }

    /**
     * touchstart event listener callback
     * @param  {Object} e Event interface
     * @return {Void}
     */
    touchstart(e) {
        this.off(this.container, "mousedown", this.events.start);

        this.start(e);
    }

    /**
     * mousedown / touchstart event listener callback
     * @param  {Object} e Event interface
     * @return {Void}
     */
    start(e) {
        const o = this.config;
        const target = e.target;
        const touch = e.type === "touchstart";
        const evt = touch ? e.touches[0] : e;
        let originalEl;

        // if we're disabled, outside the parent container or clicked another mouse button other than the left one
        if (o.disabled || !this.container.contains(target) || e.which === 3 || e.button > 0) return false;

        // check if the parent container is scrollable and 
        // prevent deselection when clicking on the scrollbars
        if (this.scroll.scrollable.y && evt.pageX > this.rect.x1 + this.scroll.size.x || this.scroll.scrollable.x && evt.pageY > this.rect.y1 + this.scroll.size.y) {
            return false;
        }

        // check for ignored descendants
        if (this.config.ignore) {
            let stop = false;
            let ignore = this.config.ignore;

            if (!Array.isArray(ignore)) {
                ignore = [ignore];
            }

            for ( item of ignore ) {
                if ( target.closest(item) ) {
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
        let node = target.closest(`.${o.classes.selectable}`);

        if (!node && this.container.contains(target)) {
            node = this.container;
        }

        // if no valid node was found
        if (!node) return false;

        // allow form inputs to be receive focus
        if (!['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'OPTION'].includes(target.tagName)) {
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
            node.classList.add(o.classes.selecting);
        }

        if (o.autoRefresh) {
            this.update();
        }

        const items = this.items;

        // shift key is down
        if ((this.canShift && is.ShiftKey(e)) && this.startEl) {
            let currentIndex = this.getNodes().indexOf(node);
            const lastIndex = this.getNodes().indexOf(this.startEl);
            const step = currentIndex < lastIndex ? 1 : -1;

            while ((currentIndex += step) && currentIndex !== lastIndex) {
                items[currentIndex].selecting = true;
                items[currentIndex].node.classList.add(o.classes.selecting);
            }
        }

        for (const item of this.items) {
            const isCurrentNode = item.node === node;

            if (item.selected) {

                item.startselected = true;

                let unselect = false;

                if (touch || o.toggle || is.CmdKey(e) && (this.canCtrl || this.canMeta)) {
                    unselect = isCurrentNode;
                } else {
                    unselect = !isCurrentNode && !(is.ShiftKey(e) && this.canShift);
                }

                if (unselect) {
                    item.node.classList.remove(o.classes.selected);
                    item.selected = false;

                    item.node.classList.add(o.classes.deselecting);
                    item.deselecting = true;
                }
            }
            if (isCurrentNode) {
                originalEl = item.node;
                item.selecting = true;
            }
        }

        this.startEl = node;

        this.emit('selectable.start', e, originalEl);
    }

    /**
     * mousmove / touchmove event listener
     * @param  {Object} e Event interface
     * @return {Void}
     */
    drag(e) {
        const o = this.config;
        if ((o.disabled || !this.dragging) || (is.ShiftKey(e) && this.canShift)) return;

        let tmp;
        const evt = e.type === "touchmove" ? e.touches[0] : e;
        const cmd = is.CmdKey(e) && (this.canCtrl || this.canMeta);
        const scroll = this.scroll;
        const origin = this.origin;

        this.mouse = {
            x: evt.pageX,
            y: evt.pageY
        };

        this.current = {
            x1: origin.x,
            y1: origin.y,
            x2: this.mouse.x + (this.bodyContainer ? 0 : scroll.x),
            y2: this.mouse.y + (this.bodyContainer ? 0 : scroll.y),
        };

        const current = this.current;

        // flip lasso
        for (const axis of this.axes) {
            if (current[this.axes1[axis]] > current[this.axes2[axis]]) {
                tmp = current[this.axes2[axis]];
                current[this.axes2[axis]] = current[this.axes1[axis]];
                current[this.axes1[axis]] = tmp;
            }
        }

        /* highlight */
        for (const item of this.items) {
            const cls = o.classes;
            const el = item.node;
            const r = item.rect;
            const cl = el.classList;

            let over = false;

            const x = this.bodyContainer ? 0 : scroll.x;
            const y = this.bodyContainer ? 0 : scroll.y;

            if (o.tolerance === "touch") {
                over = !(r.x1 + x > current.x2 || (r.x2 + x < current.x1 ||
                    (r.y1 + y > current.y2 || r.y2 + y < current.y1)));
            } else if (o.tolerance === "fit") {
                over = r.x1 + x > current.x1 && (r.x2 + x < current.x2 &&
                    (r.y1 + y > current.y1 && r.y2 + y < current.y2));
            }

            if (over) {
                if (item.selected && !o.toggle) {
                    cl.remove(cls.selected);
                    item.selected = false;
                }
                if (item.deselecting && (!o.toggle || o.toggle && o.toggle !== "drag")) {
                    cl.remove(cls.deselecting);
                    item.deselecting = false;
                }
                if (!item.selecting) {
                    cl.add(cls.selecting);
                    item.selecting = true;
                }
            } else {
                if (item.selecting) {
                    if (cmd && item.startselected) {
                        cl.remove(cls.selecting);
                        item.selecting = false;

                        cl.add(cls.selected);
                        item.selected = true;
                    } else {
                        cl.remove(cls.selecting);
                        item.selecting = false;

                        if (item.startselected && !o.toggle) {
                            cl.add(cls.deselecting);
                            item.deselecting = true;
                        }
                    }
                }
                if (item.selected) {
                    if (!cmd) {
                        if (!item.startselected) {
                            cl.remove(cls.selected);
                            item.selected = false;

                            cl.add(cls.deselecting);
                            item.deselecting = true;
                        }
                    }
                }
            }
        }

        // lasso coordinates
        this.coords = {
            x1: current.x1,
            x2: (current.x2) - (current.x1),
            y1: current.y1,
            y2: (current.y2) - (current.y1),
        };

        // subtract the parent container's position
        if (!this.bodyContainer) {
            this.coords.x1 -= this.rect.x1;
            this.coords.y1 -= this.rect.y1;
        }

        // auto scroll
        if (this.autoscroll) {
            this.autoScroll();
        }

        // lasso
        if (this.lasso) {
            // stop lasso causing overflow
            if (!this.bodyContainer && !this.config.autoScroll.lassoOverflow) {
                this.limitLasso();
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

        // emit the "drag" event
        this.emit('selectable.drag', e, this.coords);
    }

    /**
     * mouseup / touchend event listener
     * @param  {Object} e Event interface
     * @return {Void}
     */
    end(e) {
        if (!this.dragging) return;

        this.dragging = false;

        const o = this.config;
        let node = e.target;
        let endEl;
        const selected = [];
        const deselected = [];
        const evt = e.type === "touchend" ? e.touches[0] || e.changedTouches[0] : e;

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
        endEl = node.closest(`.${o.classes.selectable}`);

        // loop over items and check their state
        for (const item of this.items) {
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

            // item was marked for deselection
            if (item.deselecting) {
                deselected.push(item);
                this.deselect(item);
            }

            // item was marked for selection
            if (item.selecting) {
                selected.push(item);
                this.select(item);
            }
        }

        // emit the "end" event
        this.emit('selectable.end', e, selected, deselected);
    }

    /**
     * keydown event listener
     * @param  {Object} e Event interface
     * @return {Void}
     */
    keydown(e) {
        this.cmdDown = is.CmdKey(e) && (this.canCtrl || this.canMeta);

        if (this.cmdDown) {
            const code = e.keyCode || e.which;
            if (code == 65 || code == 97) {
                if (this.over) {
                    e.preventDefault();
                    this.selectAll();
                }
            }
        }
    }

    /**
     * keyup event listener
     * @param  {Object} e Event interface
     * @return {Void}
     */
    keyup(e) {
        this.cmdDown = is.CmdKey(e) && (this.canCtrl || this.canMeta);
    }

    /**
     * Select an item or items
     * @param  {Object} item
     * @return {Object} instance
     */
    select(item, all) {

        if (is.String(item)) {
            item = item === "all" ? this.items : this.container.querySelectorAll(item);
        }

        if (is.Collection(item)) {
            for (let i = 0; i < item.length; i++) {
                this.select(item[i]);
            }

            return this;
        }

        item = this.get(item);

        if (item) {
            // toggle item if already selected
            if (this.config.toggle && this.config.toggle === "drag" && !all && item.selected && !this.cmdDown) {
                return this.deselect(item);
            }

            const el = item.node;
            const o = this.config.classes;

            el.classList.remove(o.selecting);
            el.classList.add(o.selected);

            item.selecting = false;
            item.selected = true;
            item.startselected = true;

            this.emit('selectable.select', item);
        }

        return this;
    }

    /**
     * Unselect an item or items
     * @param  {Object} item
     * @return {Object} instance
     */
    deselect(item) {

        if (is.String(item)) {
            item = item === "all" ? this.items : this.container.querySelectorAll(item);
        }

        if (is.Collection(item)) {
            for (let i = 0; i < item.length; i++) {
                this.deselect(item[i]);
            }

            return this;
        }

        item = this.get(item);

        if (item) {
            const el = item.node;
            const o = this.config.classes;

            item.selecting = false;
            item.selected = false;
            item.deselecting = false;
            item.startselected = false;

            el.classList.remove(o.deselecting);
            el.classList.remove(o.selecting);
            el.classList.remove(o.selected);

            this.emit('selectable.unselect', item)
        }

        return this;
    }

    /**
     * Toggle an item or items
     * @param  {Object} item
     * @return {Object} instance
     */
    toggle(find) {

        if (is.String(find)) {
            find = find === "all" ? this.items : this.container.querySelectorAll(find);
        }

        find = this.get(find);

        if (!is.Collection(find)) {
            find = [find];
        }

        for (const item of find) {
            if (item.selected) {
                this.deselect(item);
            } else {
                this.select(item);
            }
        }

        return this;
    }

    /**
     * Select all items
     * @return {Object} instance
     */
    invert() {
        for (const item of this.items) {
            if (item.selected) {
                this.deselect(item);
            } else {
                this.select(item);
            }
        }

        return this;
    }

    /**
     * Unselect all items
     * @return {Object} instance
     */
    clear() {
        for (let i = this.items.length - 1; i >= 0; i--) {
            this.deselect(this.items[i]);
        }
        return this;
    }

    /**
     * Select all items
     * @return {Object} instance
     */
    selectAll() {
        for (const item of this.items) {
            this.select(item, true);
        }

        return this;
    }

    /**
     * Get an item
     * @return {Object|Boolean}
     */
    get(find) {
        let found = false;

        if (is.String(find)) {
            if (find === "all") {
                return this.items;
            }

            find = [...this.container.querySelectorAll(find)];
        }

        if (is.Collection(find)) {
            found = [];

            for (const i of find) {
                const item = this.get(i);

                if (item) {
                    found.push(item);
                }
            }
        } else {
            // item is an index
            if (!isNaN(find)) {
                if (this.items.includes(this.items[find])) {
                    found = this.items[find];
                }
            }
            // item is a node
            else if (find instanceof Element) {
                found = this.items[this.nodes.indexOf(find)];
            }
            // item is an item
            else if (is.Object(find) && this.items.includes(find)) {
                found = find;
            }
        }

        return found;
    }

    /**
     * Get all items
     * @return {Array}
     */
    getItems() {
        return this.items;
    }

    /**
     * Get all nodes
     * @return {Array}
     */
    getNodes() {
        return this.nodes;
    }

    /**
     * Get all selected items
     * @return {Array}
     */
    getSelectedItems() {
        return this.getItems().filter(item => item.selected);
    }

    /**
     * Get all selected nodes
     * @return {Array}
     */
    getSelectedNodes() {
        return this.getSelectedItems().map(item => item.node);
    }

    /**
     * Add a node to the instance
     * @param {Object} node HTMLElement
     * @return {Object} instance
     */
    add(node) {
        const els = this.nodes;
        if (is.Collection(node)) {
            for (const n of node) {
                if (!els.includes(n) && n instanceof Element) {
                    els.push(n);
                }
            }
        } else {
            if (!els.includes(node) && node instanceof Element) {
                els.push(node);
            }
        }

        this.update();

        return this;
    }

    /**
     * Remove an item from the instance so it's unselectable
     * @param  {Mixed} item index, node or object
     * @return {Object} instance
     */
    remove(item, stop) {
        item = this.get(item);

        if (item) {
            if (is.Collection(item)) {
                for (let i = item.length - 1; i >= 0; i--) {
                    this.remove(item[i], i > 0);
                }
            } else {
                const el = item.node;
                const o = this.config.classes;

                el.classList.remove(o.selectable);
                el.classList.remove(o.deselecting);
                el.classList.remove(o.selecting);
                el.classList.remove(o.selected);

                this.nodes.splice(this.nodes.indexOf(item.node), 1);
            }

            if (!stop) {
                this.update();
            }
        }

        return this;
    }

    /**
     * scroll event listener
     * @param  {Object} e Event interface
     * @return {Void}
     */
    onScroll(e) {
        this.scroll.x = this.bodyContainer ? window.pageXOffset : this.container.scrollLeft;
        this.scroll.y = this.bodyContainer ? window.pageYOffset : this.container.scrollTop;

        for (const item of this.items) {
            item.rect = rect(item.node);
        }
    }

    /**
     * Set the container
     * @param {String|Object} container CSS3 selector string or HTMLElement
     */
    setContainer(container) {
        const o = this.config;
        let old;

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

        this.container.classList.add(o.classes.container);

        if (old) {
            old.classList.remove(o.classes.container);
        }

        this.bodyContainer = this.container === document.body;

        if (is.Collection(o.filter)) {
            this.nodes = [].slice.call(o.filter);
        } else if (typeof o.filter === "string") {
            this.nodes = [].slice.call(this.container.querySelectorAll(o.filter));
        }

        if (this.autoscroll) {
            const style = css(this.container);

            if (style.position === "static" && !this.bodyContainer) {
                this.container.style.position = "relative";
            }
        }

        this.bind();

        return this;
    }

    /**
     * Scroll container
     * @return {Void}
     */
    autoScroll() {
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
        for (var axis of this.axes) {
            if (this.mouse[axis] >= this.rect[this.axes2[axis]] - t && this.scroll[axis] < this.scroll.max[axis]) {
                inc[axis] = i;
            } else if (this.mouse[axis] <= this.rect[this.axes1[axis]] + t && this.scroll[axis] > 0) {
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

    /**
     * Limit lasso to container boundaries
     * @return {Void}
     */
    limitLasso() {
        for (const axis of this.axes) {
            const max = this.rect[this.axes1[axis]] + this.scroll.size[axis];
            if (this.mouse[axis] >= max && this.scroll[axis] >= this.scroll.max[axis]) {
                const off = origin[axis] - this.rect[this.axes1[axis]] - this.scroll[axis];
                this.coords[this.axes1[axis]] = origin[axis] - this.rect[this.axes1[axis]];
                this.coords[this.axes2[axis]] = max - off - this.rect[this.axes1[axis]];
            }

            if (this.mouse[axis] <= this.rect[this.axes1[axis]] && this.scroll[axis] <= 0) {
                this.coords[this.axes1[axis]] = 0;
                this.coords[this.axes2[axis]] = origin[axis] - this.rect[this.axes1[axis]];
            }
        }
    }

    /**
     * Enable instance
     * @return {Boolean}
     */
    enable() {
        if (!this.enabled) {
            const keys = this.config.keys;
            this.enabled = true;
            this.canShift = keys.includes("shiftKey");
            this.canCtrl = keys.includes("ctrlKey");
            this.canMeta = keys.includes("metaKey");

            this.bind();

            this.container.classList.add(this.config.classes.container);

            this.emit('selectable.enable');
        }
        return this;
    }

    /**
     * Disable instance
     * @return {Boolean}
     */
    disable() {
        if (this.enabled) {
            this.enabled = false;

            this.unbind();

            this.container.classList.remove(this.config.classes.container);

            this.emit('selectable.disable');
        }
    }

    /**
     * Remove instance event listeners
     * @return {Void}
     */
    unbind() {
        const e = this.events;

        this.off(this.container, 'mousedown', e.start);
        this.off(document, 'mousemove', e.drag);
        this.off(document, 'mouseup', e.end);
        this.off(document, 'keydown', e.keydown);
        this.off(document, 'keyup', e.keyup);

        this.over = false;
        this.off(this.container, "mouseenter", e.mouseenter);
        this.off(this.container, "mouseleave", e.mouseleave);

        if (this.autoscroll) {
            this.off(this.bodyContainer ? window : this.container, "scroll", e.scroll);
        }

        // Mobile
        this.off(this.container, "touchstart", e.start);
        this.off(document, "touchend", e.end);
        this.off(document, "touchcancel", e.end);
        this.off(document, "touchmove", e.drag);

        this.off(window, 'resize', e.refresh);
        this.off(window, 'scroll', e.refresh);
    }

    /**
     * Destroy instance
     * @return {void}
     */
    destroy() {
        this.disable();
        this.listeners = false;
        this.remove(this.items);
    }
}