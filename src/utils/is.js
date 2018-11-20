const is = {
    String: val => typeof val === "string",
    /**
    * Check is item is object
    * @return {Boolean}
    */
    Object: val => val && typeof val === 'object' && val.constructor === Object,

    /**
    * Check is item array or array-like
    * @param  {Mixed} arr
    * @returns {Boolean}
    */
    Collection: arr => Array.isArray(arr) || arr instanceof HTMLCollection || arr instanceof NodeList,
        /**
        * Detect CTRL or META key press
        * @param  {Object}  e Event interface
        * @returns {Boolean}
        */
    CmdKey: e => !!e.ctrlKey || !!e.metaKey,

    /**
     * Detect SHIFT key press
     * @param  {Object}  e Event interface
     * @returns {Boolean}
     */
    ShiftKey: e => !!e.shiftKey,    
};

export default is;