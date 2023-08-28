import { world } from '@minecraft/server';
import time from './libraries/time.js';
import databases from './libraries/scoreboard_database.js';
const content = {
	warn(...messages) {
		console.warn(messages.map(message => JSON.stringify(message, (key, value) => (value instanceof Function) ? '<f>' : value)).join(' '));
	},
	chatFormat(...messages) {
		chunkString(messages.map(message => JSON.stringify(message, (key, value) => (value instanceof Function) ? '<f>' : value, 4)).join(' '), 500).forEach(message => world.sendMessage(message));
	}
};
const n = 100000;
const n2 = n * 2;
console.warn('wmdww');
world.afterEvents.worldInitialize.subscribe(() => {
	const test = databases.get('test') ?? databases.add('test');
	const { hello } = test;
	console.warn('helloGet', hello ?? 'null');
	time.start('test');
	for (let i = n; i < n2; i++) {
		hello[i.toString()] = 1;
	}
	content.warn({ time: time.end('test') });
	content.warn({ len: JSON.stringify(test).length });
	databases.queueSave('test');
});