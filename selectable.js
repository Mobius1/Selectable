/*!
 *
 * Selectable
 * Copyright (c) 2017 Karl Saunders (http://mobius.ovh)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.0.4
 *
 */
(function(root, factory) {
	var plugin = 'Selectable';

	if (typeof define === 'function' && define.amd) {
		define([], factory(plugin));
	} else if (typeof exports === 'object') {
		module.exports = factory(plugin);
	} else {
		root[plugin] = factory(plugin);
	}
}(this, function(plugin) {
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
	 * Iterator helper
	 * @param  {(Array|Object)}   collection Any object, array or array-like collection.
	 * @param  {Function} callback   The callback function
	 * @param  {Object}   scope      Change the value of this
	 * @return {Void}
	 */
	function each(collection, callback, scope) {
		if ("[object Object]" === Object.prototype.toString.call(collection)) {
			for (var d in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, d)) {
					callback.call(scope, d, collection[d]);
				}
			}
		} else {
			for (var e = 0, f = collection.length; e < f; e++) {
				callback.call(scope, e, collection[e]);
			}
		}
	}

	/**
	 * Merge objects together into the first.
	 * @param  {Object} src   Source object
	 * @param  {Object} obj 	Object to merge into source object
	 * @return {Object}
	 */
	function extend(src, props) {
		props = props || {};
		var p;
		for (p in src) {
			if (src.hasOwnProperty(p)) {
				if (!props.hasOwnProperty(p)) {
					props[p] = src[p];
				}
			}
		}
		return props;
	}

	/**
	 * Emulate jQuery's css method
	 * @param  {Object} el   HTMLElement
	 * @param  {(Object|String)} prop Object of CSS properties and values or CSS propery string
	 * @param  {Object} val CSS property value
	 * @return {Object|Void}
	 */
  function style(el, prop, val) {
    var style = el && el.style,
      isObj = "[object Object]" === Object.prototype.toString.call(prop);

    if (style) {
      if (val === void 0 && !isObj) {
        val = window.getComputedStyle(el, '');
        return prop === void 0 ? val : val[prop];
      } else {
        if (isObj) {
          each(prop, function(p, v) {
            if (!(p in style)) { p = '-webkit-' + p; }
            style[p] = v + (typeof v === 'string' ? '' : p === "opacity" ? "" : "px");
          });
        } else {
          if (!(prop in style)) { prop = '-webkit-' + prop; }
          style[prop] = val + (typeof val === 'string' ? '' : prop === "opacity" ? "" : "px");
        }
      }
    }
  }

	var debounce = function(a, b, c) {
		var d;
		return function() {
			var e = this, f = arguments,
				g = function() { d = null, c || a.apply(e, f) },
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
				for (var b = 0; b < this._events[a].length; b++) { this._events[a][b].apply(this, Array.prototype.slice.call(arguments, 1)) }
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

		this.options = extend(defaultConfig, options);

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

		each(this.options.lasso, function(prop, val) {
			lasso.style[prop] = val;
		});

		this.lasso = lasso;

		if (typeof this.options.appendTo === 'string' || this.options.appendTo instanceof String) {
			this.container = document.querySelector(this.options.appendTo);
		} else if (this.options.appendTo.nodeName) {
			this.container = this.options.appendTo;
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
		this.els = this.container.querySelectorAll(this.options.selector);
		this.items = [];

		each(this.els, function(i, elem) {
			that.items[i] = {
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
		var o = this.options,
			originalEl, tgt = e.target;
		var validEl = tgt.classList.contains(o.selector.replace('.', ''));

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

		each(this.items, function(i, item) {
			var el = item.element;
			if (item.selected) {
				item.startselected = true;
				if (!isCmdKey(e)) {
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

		var o = this.options;
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

		style(this.lasso, {
			left: c.x1,
			width: c.x2 - c.x1,
			top: c.y1,
			height: c.y2 - c.y1
		});

		/* highlight */
		each(this.items, function(i, item) {
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

		style(this.lasso, {
			left: 0,
			width: 0,
			top: 0,
			height: 0
		});

		each(this.items, function(i, item) {
			var el = item.element;

			if (item.unselecting) {
				el.classList.remove("ui-unselecting");
				item.unselecting = false;
				item.startselected = false;
			}

			if (item.selecting) {
				el.classList.remove("ui-selecting");
				el.classList.add("ui-selected")
				item.selecting = false;
				item.selected = true;
				item.startselected = true;
			}

			if (item.selected) {
				that.selectedItems.push(item);
				that.emit('selectable.selected', item);
			}
		});

		this.container.removeChild(this.lasso);

		this.emit('selectable.up', this.selectedItems);
	};

	Selectable.prototype.update = function() {
		each(this.els, function(i, elem) {
			this.items[i].rect = elem.getBoundingClientRect();
		}, this);
	};

	/**
	 * Destroy instance
	 * @return {void}
	 */
	Selectable.prototype.destroy = function() {

		each(this.items, function(i, item) {
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
}));