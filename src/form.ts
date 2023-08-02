import { ModalFormData, ActionFormData, ActionFormResponse, ModalFormResponse, MessageFormData, MessageFormResponse, FormCancelationReason } from "@minecraft/server-ui";
import { Player, world } from "@minecraft/server";


export const content = {
	warn(...messages: any[]) {
		console.warn(messages.map(message => JSON.stringify(message, (key, value) => (value instanceof Function) ? '<f>' : value)).join(' '));
	},
	chatFormat(...messages: any[]) {
		world.sendMessage(messages.map(message => JSON.stringify(message, (key, value) => (value instanceof Function) ? value.toString().replaceAll('\r\n', '\n') : value, 4)).join(' '));
	}
};
function isNumberDefined(input: any) {
	return (input !== false && input !== null && input !== undefined && Number.isNaN(input) && input !== Infinity);
}
export class MessageForm {
	form: MessageFormData;
	callbacks: [boolean | ((player: Player, i: Number) => void), boolean | ((player: Player, i: Number) => void)];
	lastCalled: number | false;

	constructor() {
		this.form = new MessageFormData();
		this.callbacks = [false, false];
		this.lastCalled = false;
	}
	/**
	 * @method title
	 * @param {String} titleText 
	 * @returns {MessageForm}
	 */
	title(titleText: string): this {
		if (typeof titleText !== 'string') throw new Error(`titleText: ${titleText}, at params[0] is not a String!`);
		this.form.title(titleText);
		return this;
	}
	/**
	 * @method body
	 * @param {String} bodyText 
	 * @returns {MessageForm}
	 */
	body(bodyText: string): this {
		if (typeof bodyText !== 'string') throw new Error(`bodyText: ${bodyText}, at params[0] is not a String!`);
		this.form.body(bodyText);
		return this;
	}
	/**
	 * @method button1
	 * @param {String} text 
	 * @returns {this}
	 */
	button1(text: string): this {
		if (typeof text !== 'string') throw new Error(`text: ${text}, at params[0] is not a String!`);
		this.lastCalled = 0;
		this.form.button1(text);
		return this;
	}
	/**
	 * @method button2
	 * @param {String} text 
	 * @returns {this}
	 */
	button2(text: string): this {
		if (typeof text !== 'string') throw new Error(`text: ${text}, at params[0] is not a String!`);
		this.lastCalled = 0;
		this.form.button2(text);
		return this;
	}
	/**
	 * @method callback
	 * @param {(player:Player) => any} callback 
	 */
	callback(callback: (player: Player, i: Number) => void) {
		if (!(callback instanceof Function)) throw new Error(`callback at params[1] is not a Function!`);
		if (this.lastCalled === false) throw new Error('form.callback method must only be called after a button1 or button2 call!');

		this.callbacks[this.lastCalled] = callback;
		if (this.lastCalled === 1) this.lastCalled = false;
	}
	/**
	 * @method show
	 * @param {Player} player 
	 * @param {Boolean} awaitNotBusy 
	 * @param {(player: Player, response: MessageFormResponse) => {}} callback?
	 * @returns {Promise<MessageFormResponse>}
	 */
	async show(player: Player | { player: Player; }, awaitNotBusy: boolean = false, callback: (player: Player, response: MessageFormResponse) => any): Promise<MessageFormResponse | undefined> {
		try {


			let testPlayer = player;
			if (!(player instanceof Player)) testPlayer = player?.player;
			if (!(testPlayer instanceof Player)) throw new Error(`player at params[0] is not a Player!`);
			if (awaitNotBusy && typeof awaitNotBusy !== 'boolean') throw new Error(`awaitNotBusy at params[1] is not a Boolean!`);
			if (callback && !(callback instanceof Function)) throw new Error(`callback at params[2] is not a Function!`);
			let response;
			while (true) {
				response = await this.form.show(testPlayer);
				if (!response) continue;
				const { cancelationReason } = response;
				if (!awaitNotBusy || cancelationReason !== FormCancelationReason.UserBusy) break;
			}
			const { selection = -1 } = response;
			const callbackIndex = this.callbacks[selection];
			if (callbackIndex instanceof Function) callbackIndex(player, selection);
			if (callback instanceof Function) callback(player, response);
			return response;
		} catch (error: any) {
			console.warn(error, error?.stack);
		}
	}
}
export class ActionForm {
	form: ActionFormData;
	callbacks: (false | ((player: Player, i: number) => any))[];
	lastCallbackable: boolean;
	//error Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Number'.

	constructor() {
		this.form = new ActionFormData();
		this.callbacks = [];
		this.lastCallbackable = false;
	}
	/**
	 * @method title
	 * @param {String} titleText 
	 * @returns {this}
	 */
	title(titleText: string): this {
		if (typeof titleText !== 'string') throw new Error(`titleText: ${titleText}, at params[0] is not a String!`);
		this.form.title(titleText);
		this.lastCallbackable = false;
		return this;

	}
	/**
	 * @method body
	 * @param {String} bodyText 
	 * @returns {this}
	 */
	body(bodyText: string): this {
		if (typeof bodyText !== 'string') throw new Error(`bodyText: ${bodyText}, at params[0] is not a String!`);
		this.form.body(bodyText);
		this.lastCallbackable = false;
		return this;
	}
	/**
	 * @method body
	 * @param {String} text 
	 * @param {String} iconPath 
	 * @returns {ActionForm}
	 */
	button(text: string, iconPath: string): ActionForm {
		if (typeof text !== 'string') throw new Error(`text: ${text}, at params[0] is not a String!`);
		if (iconPath && typeof iconPath !== 'string') throw new Error(`iconPath: ${iconPath}, at params[1] is defined and is not a String!`);
		this.callbacks.push(false);
		this.lastCallbackable = true;
		this.form.button(text, iconPath);
		return this;
	}
	/**
	 * @method callback
	 * @param {(player: Player) => any} callback 
	 */
	callback(callback: (player: Player) => any) {
		if (!(callback instanceof Function)) throw new Error(`callback at params[1] is not a Function!`);
		if (!this.lastCallbackable) throw new Error('form.callback method must only be called after a button1 or button2 call!');
		this.callbacks[this.callbacks.length - 1] = callback;
		this.lastCallbackable = false;
		return this;
	}
	/**
	 * @method show
	 * @param {Player} player 
	 * @param {Boolean} awaitNotBusy 
	 * @param {(player: Player, response: ActionFormResponse) => {}} callback?
	 * @returns {Promise<ActionFormResponse>}
	 */
	async show(player: Player | { player: Player; }, awaitNotBusy: boolean = false, callback: (player: Player, response: ActionFormResponse) => {}): Promise<ActionFormResponse | undefined> {
		try {
			let testPlayer = player;
			if (!(player instanceof Player)) testPlayer = player?.player;
			if (!(testPlayer instanceof Player)) throw new Error(`player at params[0] is not a Player!`);
			if (awaitNotBusy && typeof awaitNotBusy !== 'boolean') throw new Error(`awaitNotBusy at params[1] is not a Boolean!`);
			if (callback && !(callback instanceof Function)) throw new Error(`callback at params[2] is not a Function!`);
			let response;
			while (true) {
				response = await this.form.show(testPlayer);
				const { cancelationReason } = response;
				if (!awaitNotBusy || cancelationReason !== FormCancelationReason.UserBusy) break;
			}
			const { selection = -1 } = response;
			const callbackIndex = this.callbacks[selection];
			if (callbackIndex instanceof Function) callbackIndex(player, selection);
			if (callback instanceof Function) callback(player, response);
			return response;
		} catch (error: any) {
			console.log(error, error?.stack);
		}
	}
}

export class ModalForm {
	constructor() {
		this.form = new ModalFormData();
		this.callbacks = [];
	}
	/**
	 * @method title
	 * @param {String} titleText 
	 * @returns {ModalForm}
	 */
	title(titleText: string): ModalForm {
		if (typeof titleText !== 'string') throw new Error(`titleText: ${titleText}, at params[0] is not a String!`);
		this.form.title(titleText);
		return this;
	}
	/**
	 * @method toggle
	 * @param {String} label 
	 * @param {Boolean} defaultValue? 
	 * @param {(player: Player, state: Boolean, i: number) => {}} callback?
	 */
	toggle(label: string, defaultValue: boolean, callback: (player: Player, state: boolean, i: number) => {}) {
		if (typeof label !== 'string') throw new Error(`label: ${label}, at params[0] is not a String!`);
		if (defaultValue && typeof defaultValue !== 'string') throw new Error(`defaultValue: ${defaultValue}, at params[1] is defined and is not a String!`);
		if (callback && !(callback instanceof Function)) throw new Error(`callback at params[2] is defined and is not a Function!`);
		this.callbacks.push(callback);
		this.form.toggle(label, defaultValue);
		return this;
	}
	/**
	 * @typedef {Array<optionObject>} dropdownOptions
	 */

	/**
	 * @typedef {object} optionObject
	 * @property {string} option
	 * @property {(player: Player) => { }} callback 
	 */

	/**
	 * @method dropdown
	 * @param {String} label 
	 * @param {dropdownOptions} options 
	 * @param {Number} defaultValueIndex?
	 * @param {(player: Player, selection: Number, i: number) => {}} callback?
	 */
	dropdown(label: string, defaultValueIndex: number = 0) {
		if (typeof label !== 'string') throw new Error(`label: ${label}, at params[0] is not a String!`);
		if (!isNumberDefined(defaultValueIndex) && !Number.isInteger(defaultValueIndex)) throw new Error(`defaultValueIndex: ${defaultValueIndex}, at params[2] is defined and is not an Integer!`);
		this.callbacks.push(false);
		this.form.dropdown(label, optionStrings, defaultValueIndex);
		return this;
	}
	/**
	 * @method slider
	 * @param {String} label 
	 * @param {Number} minimumValue 
	 * @param {Number} maximumValue 
	 * @param {Number} valueStep 
	 * @param {Number} defaultValue?
	 * @param {(player: Player, selection: Number, i: number) => {}} callback?
	 */
	slider(label: string, minimumValue: number, maximumValue: number, valueStep: number, defaultValue: number = null, callback: (player: Player, selection: number, i: number) => {}) {
		if (typeof label !== 'string') throw new Error(`label: ${label}, at params[0] is not a String!`);
		if (typeof minimumValue !== 'number') throw new Error(`minimumValue: ${minimumValue}, at params[1] is not a Number!`);
		if (typeof maximumValue !== 'number') throw new Error(`maximumValue: ${maximumValue}, at params[2] is not a Number!`);
		if (typeof valueStep !== 'number') throw new Error(`valueStep: ${valueStep}, at params[3] is not a Number!`);
		if (!isNumberDefined(defaultValue) && typeof defaultValue !== 'number') throw new Error(`defaultValue: ${defaultValue}, at params[4] is defined and is not a Number!`);
		if (callback && !(callback instanceof Function)) throw new Error(`callback at params[5] is defined and is not a Function!`);
		this.callbacks.push(callback);
		this.form.slider(label, minimumValue, maximumValue, valueStep, defaultValue);
		return this;
	}
	/**
	 * @method textField
	 * @param {String} label 
	 * @param {String} placeholderText 
	 * @param {String} defaultValue 
	 * @param {(player: Player, outputText: String, i: number) => {}} callback?
	 * @returns {ModalForm}
	 */
	textField(label: string, placeholderText: string, defaultValue: string = null, callback: (player: Player, outputText: string, i: number) => {}): ModalForm {
		if (typeof label !== 'string') throw new Error(`label: ${label}, at params[0] is not a String!`);
		if (typeof placeholderText !== 'string') throw new Error(`placeholderText: ${placeholderText}, at params[1] is not a String!`);
		if (defaultValue && typeof defaultValue !== 'string') throw new Error(`defaultValue: ${defaultValue}, at params[2] is defined and is not a String!`);
		if (callback && !(callback instanceof Function)) throw new Error(`callback at params[3] is defined and is not a Function!`);
		this.callbacks.push(callback);
		this.form.textField(label, placeholderText, defaultValue);
		return this;
	};

	/**
	 * @method show
	 * @param {Player} player 
	 * @param {Boolean} awaitNotBusy?
	 * @param {(player: Player, response: ModalFormResponse) => {}} callback?
	 * @returns {Promise<ModalFormResponse>}
	 */
	async show(player: Player, awaitNotBusy: boolean = false, callback: (player: Player, response: ModalFormResponse) => {}): Promise<ModalFormResponse> {
		try {
			if (!(player instanceof Player)) player = player?.player;
			if (!(player instanceof Player)) throw new Error(`player at params[0] is not a Player!`);
			if (awaitNotBusy && typeof awaitNotBusy !== 'boolean') throw new Error(`awaitNotBusy at params[1] is not a Boolean!`);
			if (callback && !(callback instanceof Function)) throw new Error(`callback at params[2] is not a Function!`);
			let response;
			while (true) {
				response = await this.form.show(player);
				if (!response) continue;
				const { cancelationReason } = response;
				if (!awaitNotBusy || cancelationReason !== 'userBusy') break;
			}
			const { formValues, cancelationReason } = response;
			if (cancelationReason !== FormCancelationReason.userClosed
				&& cancelationReason !== FormCancelationReason.userBusy) formValues.forEach((value, i) => {
					if (this.callbacks[i] instanceof Array) {
						const callback = this.callbacks[i][0];
						const callbackAll = this.callbacks[i][1];
						if (callback instanceof Function) callback(player, i);
						if (callbackAll instanceof Function) callbackAll(player, value, i);
					} else {
						const callback = this.callbacks[i];
						if (callback instanceof Function) callback(player, value, i);
					}
				});
			if (callback instanceof Function) callback(player, response);
			return response;
		} catch (error) {
			console.warn(error, error.stack);
		}
	}
}