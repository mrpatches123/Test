import { world, Player, DynamicPropertiesDefinition, MinecraftEntityTypes} from '@minecraft/server';

world.afterEvents.worldInitialize.subscribe((event) => {
    const {  propertyRegistry } = event;
    const dynamicPropertiesDefinition = new DynamicPropertiesDefinition();
	let i = 0;
	for (;i < 20000;i++) {
	dynamicPropertiesDefinition.defineBoolean(`bool${i}`);
	}
		try {
		propertyRegistry.registerEntityTypeDynamicProperties(dynamicPropertiesDefinition, MinecraftEntityTypes.player);
			console.warn(i);
		} catch (error){
			console.warn(i,1000/(i-1),error, error.stack);
			const [current, limit] = error.message.match(/\d+/g).map(number => Number(number));
			console.warn('bool is ', current / (i-1), ' bytes. max is ', limit);
			
		}

});
