/*!
 *
 * Selectable
 * Copyright (c) 2017 Karl Saunders (http://mobiuswebdesign.co.uk)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.0.2
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
	'use strict';


	/* PRIVATE VARS */
	var _css = function(a, b, c) {
		var d = a && a.style;
		if (d) {
			if (void 0 === c) return document.defaultView && document.defaultView.getComputedStyle ? c = document.defaultView.getComputedStyle(a, "") : a.currentStyle && (c = a.currentStyle), void 0 === b ? c : c[b];
			b in d || (b = "-webkit-" + b), d[b] = c + ("string" == typeof c ? "" : "px")
		}
	};

	var _extend = function(src, props) {
		var p;
		for (p in props)
			if (props.hasOwnProperty(p)) src[p] = props[p];
		return src;
	};

	var _each = function(a, b, c) {
		if ("[object Object]" === Object.prototype.toString.call(a))
			for (var d in a) Object.prototype.hasOwnProperty.call(a, d) && b.call(c, d, a[d], a);
		else
			for (var e = 0, f = a.length; e < f; e++) b.call(c, e, a[e], a)
	};

	var _debounce = function(a, b, c) {
		var d;
		return function() {
			var e = this, f = arguments,
				g = function() { d = null, c || a.apply(e, f) },
				h = c && !d;
			clearTimeout(d), d = setTimeout(g, b), h && a.apply(e, f)
		}
	};

	var _preventDefault = function(a) {
		return a = a || window.event, a.preventDefault ? a.preventDefault() : a.returnValue = !1
	};

	var _listen = function(e, type, callback, capture) {
		e.addEventListener(type, callback, capture || false)
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
	function Plugin(options) {

		var defaults = {
			appendTo: "body",
			autoRefresh: true,
			filter: "*",
			tolerance: "touch",

			lasso: {
				border: '1px solid #3498db',
				backgroundColor: 'rgba(52, 152, 219, 0.2)',
			}
		};

		this.options = _extend(defaults, options);

		/* lasso */
		var lasso = document.createElement('div');
		lasso.className = 'ui-lasso';
		lasso.style.position = "fixed";

		_each(this.options.lasso, function(prop, val) {
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

		this.refresh = function() {
			var that = this;
			this.els = document.querySelectorAll(this.options.selector);
			this.items = [];

			_each(this.els, function(i, elem) {
				that.items[i] = {
					element: elem,
					rect: elem.getBoundingClientRect(),
					startselected: false,
					selected: elem.classList.contains("ui-selected"),
					selecting: elem.classList.contains("ui-selecting"),
					unselecting: elem.classList.contains("ui-unselecting")
				}

				elem.ondragstart = function(e) {
					_preventDefault(e);
				}
			});
		};

		this.refresh();

		this.mousedown = function(e) {
			_preventDefault(e);
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

			_each(this.items, function(i, item) {
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

		this.mousemove = function(e) {
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

			_css(this.lasso, 'left', c.x1);
			_css(this.lasso, 'width', c.x2 - c.x1);

			_css(this.lasso, 'top', c.y1);
			_css(this.lasso, 'height', c.y2 - c.y1);

			/* highlight */
			_each(this.items, function(i, item) {
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

		this.mouseup = function(e) {
			if (this.dragging) {
				this.dragging = false;
			}

			if (!this.container.contains(e.target)) {
				return
			}

			var that = this;

			this.selectedItems = [];

			_css(this.lasso, 'top', 0);
			_css(this.lasso, 'left', 0);
			_css(this.lasso, 'width', 0);
			_css(this.lasso, 'height', 0);

			_each(this.items, function(i, item) {
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

		this.downHandler = this.mousedown.bind(this);
		this.moveHandler = this.mousemove.bind(this);
		this.upHandler = this.mouseup.bind(this);

		_listen(this.container, 'mousedown', this.downHandler);
		_listen(document, 'mousemove', this.moveHandler);
		_listen(document, 'mouseup', this.upHandler);

		this.update = _debounce(function() {
			_each(that.els, function(i, elem) {
				that.items[i].rect = elem.getBoundingClientRect();
			});
		}, 50);

		_listen(window, 'resize', this.update);
		_listen(window, 'scroll', this.update);

		/* Enable emitter */
		Emitter.mixin(this);
	};

	/**
	 * Destroy instance
	 * @return {void}
	 */
	Plugin.prototype.destroy = function() {
		this.container.removeEventListener('mousedown', this.downHandler);
		document.removeEventListener('mousemove', this.moveHandler);
		document.removeEventListener('mouseup', this.upHandler);
	};

	return Plugin;
}));