import { Player } from '@minecraft/server';
import {ActionFormData} from '@minecraft/server-ui';

class ActionForm extends ActionFormData {
    constructor() {
        this.callbacks = []
    }
    /**
     * @param {(Player) => any} callback
     */
    callback(callback) {
        this.callbacks.push(callback)
    }
    
}