//created by Bubble
//changed by TerableCoder
//will keep crafting the last crafted item and use cures

const config = require('./config.js');
module.exports = function EndlessCrafting(dispatch){
	const command = dispatch.command || dispatch.require.command;
	dispatch.game.initialize(["me"]);

	let craftItem,
		pp,
		cureDbid = 0n,
		timeout = null;

	command.add('craft', {
		$none(){
    		if(config.enabled){ //send fake failed craft after 5 sec to unlock char
				command.message('Cancel crafting in 5 seconds.');
				clearTimeout(timeout);
				timeout = setTimeout(unlock, 5000);
			}
			config.enabled = !config.enabled;
			command.message('Endless crafting module ' + (config.enabled?'enabled.':'disabled.'));
			if(config.delay < 0){
				config.delay = 0;
				command.message("Invalid config.delay, delay is now " + config.delay);
			}
			return;
    	},
    	unlock(){
	    	unlock();
    	},
		delay(number){
	    	let tempDelay = parseInt(number);
			if(tempDelay >= 0){
				config.delay = tempDelay;
				command.message('Crafting delay set to ' + config.delay);
			} else {
				command.message("Invalid crafting delay. Current delay = " + config.delay);
			}
    	},
		$default(chatLink){
	    	var regexId = /#(\d*)@/;
			var regexDbid = /@(\d*)@/;
			var id = chatLink.match(regexId);
			var dbid = chatLink.match(regexDbid);
			if(id && dbid){
				config.cureId = parseInt(id[1]);
				cureDbid = BigInt(parseInt(dbid[1]));
				command.message('Using pp consumable with id:' + config.cureId);
			} else{
				command.message('Error, not a chatLink nor delay. Please type "craft <Item>" or "craft delay aNumber". Link the item with Ctrl+LMB.');
			}
    	}
	});

	function unlock(){
		clearTimeout(timeout);
		timeout = dispatch.setTimeout(() => {
			dispatch.toClient('S_START_PRODUCE', 3, {
				duration:0
			});
		}, 0);
	}
	
	function usePPPotThenCraft(){
		command.message("Using pp consumable.");
		clearTimeout(timeout);
		timeout = dispatch.setTimeout(() => {
			dispatch.toServer('C_USE_ITEM', 3, {
				gameId: mod.game.me.gameId,
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
				if(config.enabled) dispatch.toServer('C_START_PRODUCE', 1, craftItem);
			});
		}, config.delay);
	}
	
	dispatch.hook('S_FATIGABILITY_POINT', 3, event => {
		if(!event.current){ pp = event.fatigability; } // work for new and old labeling
		else{ (event.fatigability < event.current) ? (pp = event.fatigability):(pp = event.current); }
	});
	
	dispatch.hook('C_START_PRODUCE', 1, event => {
		craftItem = event;
	});
	
	dispatch.hook('S_START_PRODUCE', 3, event => {
		if(config.enabled && pp < 500) usePPPotThenCraft();
	});
	
	dispatch.hook('S_END_PRODUCE', 1, event => {
		if(config.enabled && event.success){
			clearTimeout(timeout);
			timeout = dispatch.setTimeout(() => {
				dispatch.toServer('C_START_PRODUCE', 1, craftItem);
			}, config.delay);
		}
	});
	
	dispatch.hook('S_SYSTEM_MESSAGE', 1, event => {
		if(!config.enabled) return;
    	const msg = dispatch.parseSystemMessage(event.message);
		if(msg && msg.id === 'SMT_YOU_CANT_PRODUCE_NOT_ENOUGH_FATIGUE'){ // no pp
			usePPPotThenCraft();
		}
	});
};