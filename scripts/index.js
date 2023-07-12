import { world, Player, DynamicPropertiesDefinition, MinecraftEntityTypes} from '@minecraft/server';

world.afterEvents.worldInitialize.subscribe((event) => {
    const {  propertyRegistry } = event;
    const dynamicPropertiesDefinition = new DynamicPropertiesDefinition();
	let i = 0;
	for (;i < 92;i++) {
	dynamicPropertiesDefinition.defineNumber(`bool${i}`);
	}
		try {
		propertyRegistry.registerEntityTypeDynamicProperties(dynamicPropertiesDefinition, MinecraftEntityTypes.player);
			
		} catch (error){
			console.warn(1000/(i-1),error, error.stack);
			
		}




});



