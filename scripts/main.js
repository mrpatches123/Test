


import { world, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";


/**
 * @type {((player: Player) => {})[]}
 */
const testFormButtons = [
    (player) => {
        player.sendMessage('You are cool!');
    },
    (player) => {
        player.sendMessage('Are you really cool if you have to proclaim yourself as cool!');
    }
];
/**
 * @param {Player} receiver
 */
async function showTestForm(receiver) {
	try {
    const form = new ActionFormData()
        .title('Action Form Example')
        .body('Press A Button. Are you Cool?')
        .button('No', 'textures/ui/cancel')
        .button('Yes', 'textures/items/apple');
    const response = await form.show(receiver);
    const { selection, canceled } = response;
    if (canceled) return;
    testFormButtons[selection](receiver);
	} catch (error) {
		console.warn(error,error.stack);
	}
}
world.afterEvents.itemUse.subscribe((event) => {
	try {
    const { source } = event;
    if (!(source instanceof Player)) return;
    showTestForm(source);
	} catch (error) {
		console.warn(error, error.stack)
	}
});
