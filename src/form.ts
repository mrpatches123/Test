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
			if (callbackIndex instanceof Function) callbackIndex(player as unknown as Player, selection);
			if (callback instanceof Function) callback(player as unknown as Player, response);
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
			if (callbackIndex instanceof Function) callbackIndex(player as unknown as Player, selection);
			if (callback instanceof Function) callback(player as unknown as Player, response);
			return response;
		} catch (error: any) {
			console.log(error, error?.stack);
		}
	}
}
type ModifyResult<ModalForm, T extends (number | string | boolean)[]> = Omit<ModalForm, 'formValues'> & { formValues: T; };
export class ModalForm<T extends (number | string | boolean)[] = []> {
	form: {
		title?: string, elements?: {
			toggle?: { label?: string, defaultValue?: boolean, callback?: (player: Player, response: number | string | boolean, i: number) => any; },
			slider?: { label?: string, minimumValue: number, maximumValue: number, valueStep: number, defaultValue?: number, callback?: (player: Player, response: number | string | boolean, i: number) => any; };
			dropdown?: { label?: string, options: { text: string, callback?: (player: Player, i: number) => any; }[], defaultValueIndex?: number, callback?: (player: Player, response: number | string | boolean, i: number) => any; };
			textField?: { label?: string, placeholderText?: string, defaultValue?: string, callback?: (player: Player, response: number | string | boolean, i: number) => any; };
		}[];
	} = {};
	constructor() {
		this.form.elements = [];
	}
	/**
	 * @method title
	 * @param {String} titleText 
	 * @returns {ModalForm}
	 */
	title(titleText: string): this {
		if (typeof titleText !== 'string') throw new Error(`titleText: ${titleText}, at params[0] is not a String!`);
		this.form.title = titleText;
		return this;
	}
	/**
	 * @method toggle
	 * @param {String} label 
	 * @param {Boolean} defaultValue? 
	 * @param {(player: Player, state: Boolean, i: number) => {}} callback?
	 */
	toggle(label: string, defaultValue: boolean) {
		if (typeof label !== 'string') throw new Error(`label: ${label}, at params[0] is not a String!`);
		if (defaultValue && typeof defaultValue !== 'string') throw new Error(`defaultValue: ${defaultValue}, at params[1] is defined and is not a String!`);
		this.form.elements!.push({ toggle: { label, defaultValue } });
		return this;
	}
	dropdown(label?: string, defaultValueIndex?: number) {
		if (typeof label !== 'string') throw new Error(`label: ${label}, at params[0] is not a String!`);
		if (!isNumberDefined(defaultValueIndex) && !Number.isInteger(defaultValueIndex)) throw new Error(`defaultValueIndex: ${defaultValueIndex}, at params[2] is defined and is not an Integer!`);
		this.form.elements!.push({ dropdown: { label, options: [], defaultValueIndex } });
		return this;
	}
	slider(label: string, minimumValue: number, maximumValue: number, valueStep: number, defaultValue?: number) {
		if (typeof label !== 'string') throw new Error(`label: ${label}, at params[0] is not a String!`);
		if (typeof minimumValue !== 'number') throw new Error(`minimumValue: ${minimumValue}, at params[1] is not a Number!`);
		if (typeof maximumValue !== 'number') throw new Error(`maximumValue: ${maximumValue}, at params[2] is not a Number!`);
		if (typeof valueStep !== 'number') throw new Error(`valueStep: ${valueStep}, at params[3] is not a Number!`);
		if (!isNumberDefined(defaultValue) && typeof defaultValue !== 'number') throw new Error(`defaultValue: ${defaultValue}, at params[4] is defined and is not a Number!`);
		this.form.elements!.push({ slider: { label, minimumValue, maximumValue, valueStep, defaultValue } });
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
	textField(label: string, placeholderText: string, defaultValue?: string): ModalForm {
		if (typeof label !== 'string') throw new Error(`label: ${label}, at params[0] is not a String!`);
		if (typeof placeholderText !== 'string') throw new Error(`placeholderText: ${placeholderText}, at params[1] is not a String!`);
		if (defaultValue && typeof defaultValue !== 'string') throw new Error(`defaultValue: ${defaultValue}, at params[2] is defined and is not a String!`);
		this.form.elements!.push({ textField: { label, placeholderText, defaultValue } });
		return this;
	};

	/**
	 * @method show
	 * @param {Player} player 
	 * @param {Boolean} awaitNotBusy?
	 * @param {(player: Player, response: ModalFormResponse) => {}} callback?
	 * @returns {Promise<ModalFormResponse>}
	 */
	async show(player: Player, awaitNotBusy: boolean = false, callback: (player: Player, response: ModifyResult<ModalFormResponse, T>) => void): Promise<ModifyResult<ModalFormResponse, T> | undefined> {

		try {
			if (!(player instanceof Player)) throw new Error(`player at params[0] is not a Player!`);
			if (awaitNotBusy && typeof awaitNotBusy !== 'boolean') throw new Error(`awaitNotBusy at params[1] is not a Boolean!`);
			if (callback && !(callback instanceof Function)) throw new Error(`callback at params[2] is not a Function!`);
			const form = new ModalFormData();
			if (this.form.title) form.title(this.form.title);
			this.form.elements?.forEach(element => {
				const elementKey = Object.keys(element)[0];
				switch (elementKey) {
					case 'toggle'
				}
			});
			let response;
			while (true) {
				response = await form.show(((player as any)?.player ?? player) as Player);
				if (!response) continue;
				const { cancelationReason } = response;
				if (!awaitNotBusy || cancelationReason !== FormCancelationReason.UserBusy) break;
			}

			const { formValues, cancelationReason } = response;
			// if (cancelationReason !== FormCancelationReason.userClosed
			// 	&& cancelationReason !== FormCancelationReason.userBusy) formValues.forEach((value, i) => {
			// 		if (this.callbacks[i] instanceof Array) {
			// 			const callback = this.callbacks[i][0];
			// 			const callbackAll = this.callbacks[i][1];
			// 			if (callback instanceof Function) callback(player, i);
			// 			if (callbackAll instanceof Function) callbackAll(player, value, i);
			// 		} else {
			// 			const callback = this.callbacks[i];
			// 			if (callback instanceof Function) callback(player, value, i);
			// 		}
			// 	});
			// if (callback instanceof Function) callback(player, response);
			return response as any;
		} catch (error: any) {
			console.warn(error, error.stack);
		}
	}
}
