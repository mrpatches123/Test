import { world } from '@minecraft/server';

import databases from './libraries/scoreboard_database.js'

world.afterEvents.worldInitialize.subscribe(() => {
	const test = databases.get('test') ?? databases.add('test');
	const { hello } = test
	console.warn('helloGet',hello ?? 'null')
	test.hello = 8
	databases.save('test');
});