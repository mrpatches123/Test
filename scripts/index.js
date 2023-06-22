import { world, Player } from '@minecraft/server';

world.afterEvents.itemUse.subscribe((event) => {
    const { source } = event;

});
/**
 * @param {Player} player 
 */
function testForm(player) {

}