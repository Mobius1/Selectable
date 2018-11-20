/**
 * 
 * @param {Object} src 
 * @param {Object} props 
 * @returns {Object}
 */
export function extend(src, props) {
    for (const prop in props) {
        if (props.hasOwnProperty(prop)) {
            const val = props[prop];
            if (val && typeof val === 'object' && val.constructor === Object) {
                src[prop] = src[prop] || {};
                extend(src[prop], val);
            } else {
                src[prop] = val;
            }
        }
    }
    return src;
}


/**
* Mass assign style properties
* @param  {Object} t
* @param  {(String|Object)} e
* @param  {String|Object}
*/
export function css(el, obj) {
    const style = el.style;
    if (el) {
        if (obj === undefined) {
            return window.getComputedStyle(el);
        } else {
            if (obj && typeof obj === 'object' && obj.constructor === Object) {
                for (let prop in obj) {
                    if (!(prop in style)) {
                        prop = `-webkit-${prop}`;
                    }
                    el.style[prop] = obj[prop] + (typeof obj[prop] === "string" ? "" : prop === "opacity" ? "" : "px");
                }
            }
        }
    }
}

/**
* Get an element's DOMRect relative to the document instead of the viewport.
* @param  {Object} t   HTMLElement
* @param  {Boolean} e  Include margins
* @returns {Object}     Formatted DOMRect copy
*/
export function rect(e) {
    const w = window;
    const o = e.getBoundingClientRect();
    const b = document.documentElement || document.body.parentNode || document.body;
    const d = (void 0 !== w.pageXOffset) ? w.pageXOffset : b.scrollLeft;
    const n = (void 0 !== w.pageYOffset) ? w.pageYOffset : b.scrollTop;
    return {
        x1: o.left + d,
        x2: o.left + o.width + d,
        y1: o.top + n,
        y2: o.top + o.height + n,
        height: o.height,
        width: o.width
    };
}

/**
* Returns a function, that, as long as it continues to be invoked, will not be triggered.
* @param  {Function} fn
* @param  {Number} lim
* @param  {Boolean} context
* @returns {Function}
*/
export function throttle(fn, lim, context = window) {
    let wait;
    return function(...args) {
        if (!wait) {
            fn.apply(context, args);
            wait = true;
            return setTimeout(() => {
                wait = false;
            }, lim);
        }
    };
}