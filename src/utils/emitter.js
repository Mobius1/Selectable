/**
 * Emitter class
 */
export default class Emitter {
	/**
	 * Add custom event listener
	 * @return {Void}
	 */
	on() {
		const args = arguments;
		if (typeof args[0] === "string") {
			this.listeners = this.listeners || {};
			this.listeners[args[0]] = this.listeners[args[0]] || [];
			this.listeners[args[0]].push(args[1]);
		} else {
			// native method
			args[0].addEventListener(args[1], args[2], false);
		}
	}

	/**
	 * Remove custom event listener
	 * @return {Void}
	 */
	off() {
		const args = arguments;
		if (typeof args[0] === "string") {
			this.listeners = this.listeners || {};
			if (args[0] in this.listeners === false) return;
			this.listeners[args[0]].splice(this.listeners[args[0]].indexOf(args[1]), 1);
		} else {
			// native method
			args[0].removeEventListener(args[1], args[2]);
		}
	}

	/**
	 * Fire custom event
	 * @param  {String} listener
	 * @return {Void}
	 */
	emit(event) {
		this.listeners = this.listeners || {};
		if (event in this.listeners === false) return;
		for (let i = 0; i < this.listeners[event].length; i++) {
			this.listeners[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	}	
}