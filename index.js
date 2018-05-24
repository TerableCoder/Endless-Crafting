//written by Bubble
//will keep crafting the last crafted item
const Command = require('command');

module.exports = function EndlessCrafting(dispatch) {
	const command = Command(dispatch);

	let enabled = false;
	let gameId;
	let craftItem;
	let pp;
	let cureId = 182439; //Normal: 181100, elite: 182439
	let cureDbid = 0;

	command.add('craft', (chatLink) => {
		if (!chatLink) {
			enabled = !enabled;
			command.message('Endless crafting module ' + (enabled?'enabled.':'disabled.'));
			return;
		} else {
			var regexId = /#(\d*)@/;
			var regexDbid = /@(\d*)@/;
			var id = chatLink.match(regexId);
			var dbid = chatLink.match(regexDbid);
			if (id && dbid) {
				cureId = parseInt(id[1]);
				cureDbid = parseInt(dbid[1]);
				command.message('Using cure with id:' + cureId);
			} else {
				command.message('Error, not a chatLink. Please type "craft <Item>"; link the item with Ctrl+LMB.');
			}
		}
	});
	
	dispatch.hook('S_LOGIN', 10, event => {
		gameId = event.gameId;
	});
	
	dispatch.hook('S_FATIGABILITY_POINT', 2, event => {
		pp = event.fatigability;
	});
	
	dispatch.hook('C_START_PRODUCE', 1, event => {
		craftItem = event;
	});
	
	dispatch.hook('S_START_PRODUCE', 2, event => {
		if (enabled && !event.unk && pp < 200) {
			command.message("Using cure.");
			dispatch.toServer('C_USE_ITEM', 3, {
				gameId: gameId,
				id: cureId,
				dbid: {low: cureDbid, high: 0, unsigned: true},
				target: 0,
				amount: 1,
				dest: {x: 0, y: 0, z: 0},
				loc: {x: 0, y: 0, z: 0},
				w: 0,
				unk1: 0,
				unk2: 0,
				unk3: 0,
				unk4: true
			});
			dispatch.hookOnce('S_FATIGABILITY_POINT', 2, (e) => {
				if (enabled && e.fatigability > 200)
					dispatch.toServer('C_START_PRODUCE', 1, craftItem);
			});
		}
	});

	dispatch.hook('S_UPDATE_PRODUCE', 2, event => {
		if(event.done && enabled) {
			dispatch.toServer('C_START_PRODUCE', 1, craftItem);
		}
	});
};
