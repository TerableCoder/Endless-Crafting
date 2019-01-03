//written by Bubble
//Fixed by TerableCoder
//will keep crafting the last crafted item and use cures

const config = require('./config.js');
module.exports = function EndlessCrafting(dispatch) {
	const command = dispatch.command || dispatch.require.command;

	let gameId,
		craftItem,
		pp,
		cureDbid = BigInt(0);

	command.add('craft', (chatLink) => {
		if (!chatLink) {
			if (config.enabled) { //send fake failed craft after 5 sec to unlock char
				command.message('Cancel crafting in 5 seconds.');
				setTimeout(unlock, 5000);
			}
			config.enabled = !config.enabled;
			command.message('Endless crafting module ' + (config.enabled?'enabled.':'disabled.'));
			return;
		} else if (chatLink === 'unlock') {
			unlock();
		} else if (chatLink === 'ufc') {
			config.ufc = !config.ufc;
			command.message('Ufc = ' + (config.ufc?'true.':'false.'));
		} else {
			var regexId = /#(\d*)@/;
			var regexDbid = /@(\d*)@/;
			var id = chatLink.match(regexId);
			var dbid = chatLink.match(regexDbid);
			if (id && dbid) {
				config.cureId = parseInt(id[1]);
				cureDbid = BigInt(parseInt(dbid[1]));
				command.message('Using pp consumable with id:' + config.cureId);
			} else {
				command.message('Error, not a chatLink. Please type "craft <Item>". Link the item with Ctrl+LMB.');
			}
		}
	});

	function unlock() {
		dispatch.toClient('S_START_PRODUCE', 3, {
			duration:0
		});
	}
	
	dispatch.hook('S_LOGIN', 12, event => {
		gameId = event.gameId;
	});
	
	dispatch.hook('S_FATIGABILITY_POINT', 3, event => {
		if(config.ufc){ pp = event.current; }
		else{ pp = event.fatigability; }
	});
	
	dispatch.hook('C_START_PRODUCE', 1, event => {
		craftItem = event;
	});
	
	dispatch.hook('S_START_PRODUCE', 3, event => {
		if (config.enabled && pp < 500) {
			command.message("Using pp consumable.");
			dispatch.toServer('C_USE_ITEM', 3, {
				gameId: gameId,
				id: config.cureId,
                dbid: cureDbid,
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
			dispatch.hookOnce('S_FATIGABILITY_POINT', 3, (e) => {
				if(config.enabled && config.ufc && e.current > 500){ 
					dispatch.toServer('C_START_PRODUCE', 1, craftItem);
				} else if (config.enabled && !config.ufc && e.fatigability > 500){
					dispatch.toServer('C_START_PRODUCE', 1, craftItem);
				}
			});
		}
	});
	
	dispatch.hook('S_END_PRODUCE', 1, event => {
		if (config.enabled && event.success) {
			dispatch.toServer('C_START_PRODUCE', 1, craftItem);
		}
	});
	
	dispatch.hook('S_SYSTEM_MESSAGE', 1, event => {
		if (!config.enabled) return;
    	const msg = dispatch.parseSystemMessage(event.message);
		if (msg && msg.id === 'SMT_YOU_CANT_PRODUCE_NOT_ENOUGH_FATIGUE') { // no pp
			config.ufc = !config.ufc;
			//command.message('You ran out of PP, Using pp consumable. Ufc is now ' + (config.ufc?'true!':'false!'));
			//console.log('You ran out of PP, Using pp consumable. Ufc is now ' + (config.ufc?'true!':'false!'));
			command.message("Using pp consumable.");
			dispatch.toServer('C_USE_ITEM', 3, {
				gameId: gameId,
				id: config.cureId,
                dbid: cureDbid,
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
			dispatch.hookOnce('S_FATIGABILITY_POINT', 3, (e) => {
				if(config.enabled && config.ufc && e.current > 500){ 
					dispatch.toServer('C_START_PRODUCE', 1, craftItem);
				} else if (config.enabled && !config.ufc && e.fatigability > 500){
					dispatch.toServer('C_START_PRODUCE', 1, craftItem);
				}
			});
		}
	});
};