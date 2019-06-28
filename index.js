//created by Bubble
//rewritten by TerableCoder
String.prototype.clr = function (hexColor){ return `<font color='#${hexColor}'>${this}</font>`};

module.exports = function EndlessCrafting(mod){
	const command = mod.command || mod.require.command,
		PIE_ID = 206023,
		PIE_AB_ID = 70264;
	mod.game.initialize("inventory");

	let craftItem,
		pp,
		cureDbid = 0n,
		enabled = false,
		timeout = null,
		usePie = false,
		loc = {x: 0, y: 0, z: 0},
		w = 0,
		extraDelay = 0,
		numCrafts = 0,
		numCrits = 0,
		hooks = [];

	command.add('craft', {
		$none(){
			enabled = !enabled;
			command.message('Endless crafting module ' + (enabled?'enabled.':'disabled.'));
			(enabled) ? load() : unload();
			if(mod.settings.delay < 0){
				mod.settings.delay = 0;
				command.message("Invalid mod.settings.delay, delay is now 0");
			}
    	},
    	unlock(){
	    	unlock();
		},
		pie(){
			mod.settings.reUsePie = !mod.settings.reUsePie;
			command.message("Pie reuse is now " + mod.settings.reUsePie ? "on":"off");
		},
		delay(number){
	    	let tempDelay = parseInt(number);
			if(tempDelay && tempDelay >= 0){
				mod.settings.delay = tempDelay;
				command.message('Crafting delay set to ' + mod.settings.delay);
			} else{
				command.message("Invalid crafting delay. Current delay = " + mod.settings.delay);
			}
    	},
		$default(chatLink){
	    	var regexId = /#(\d*)@/;
			var regexDbid = /@(\d*)@/;
			var id = chatLink.match(regexId);
			var dbid = chatLink.match(regexDbid);
			if(id && dbid){
				mod.settings.cureId = parseInt(id[1]); //Normal: 181100, elite: 182439
				cureDbid = BigInt(parseInt(dbid[1]));
				command.message('Using pp consumable with id:' + mod.settings.cureId);
			} else{
				command.message('Error, not a chatLink nor delay. Please type "craft <Item>" or "craft delay aNumber". Link the item with Ctrl+LMB.');
			}
    	}
	});


	function unlock(){
		clearTimeout(timeout);
		timeout = mod.setTimeout(() => {
			mod.send('S_START_PRODUCE', 3, {
				duration:0
			});
		}, 0);
	}

	function doneCrafting(){
		command.message(`You crafted ${numCrafts.toString().clr("00BFFF")} times and crit ${numCrits.toString().clr("32CD32")} times.`);
		unlock();
	}

	function hook(){ hooks.push(mod.hook(...arguments)); }
	
	function unload(){
		clearTimeout(timeout);
		timeout = setTimeout(doneCrafting, 5000); //send fake failed craft after 5 sec to unlock char
		if(hooks.length){
			for (let h of hooks)
				mod.unhook(h);
			hooks = [];
		}
	}

	function load(){
		if(!hooks.length){
			numCrafts = 0;
			numCrits = 0;

			hook('C_PLAYER_LOCATION', 5, event => {
				Object.assign(loc, event.loc);
				w = event.w;
			});

			hook('S_ABNORMALITY_END', 1, event => {
				if(event.id == PIE_AB_ID && mod.settings.reUsePie && mod.game.me.is(event.target)){
					usePie = true;
				}
			});
			
			hook('S_FATIGABILITY_POINT', 3, event => {
				pp = event.fatigability;
			});
			
			hook('C_START_PRODUCE', 1, event => {
				craftItem = event;
			});
			
			hook('S_PRODUCE_CRITICAL', 1, event => {
				numCrits++;
			});
			
			hook('S_END_PRODUCE', 1, event => {
				if(!event.success) return;
				numCrafts++;
				extraDelay = 0;

				if(usePie){
					usePie = false;
					let foundPie = mod.game.inventory.findInBag(PIE_ID); // get Item
					if(foundPie && foundPie.amount > 0){
						extraDelay = 10;
						command.message("Using Moongourd Pie.");
						mod.send('C_USE_ITEM', 3, {
							gameId: mod.game.me.gameId,
							id: PIE_ID,
							dbid: foundPie.dbid,
							target: 0,
							amount: 1,
							dest: {x: 0, y: 0, z: 0},
							loc: loc,
							w: w,
							unk1: 0,
							unk2: 0,
							unk3: 0,
							unk4: true
						});
					} else{
						command.message("You have 0 Moongourd Pies.");
					}
				}

				if(pp < 501){
					command.message("Using pp consumable.");
					extraDelay += 10;
					mod.setTimeout(() => {
						mod.toServer('C_USE_ITEM', 3, {
							gameId: mod.game.me.gameId,
							id: mod.settings.cureId,
							dbid: cureDbid,
							target: 0,
							amount: 1,
							dest: {x: 0, y: 0, z: 0},
							loc: loc,
							w: w,
							unk1: 0,
							unk2: 0,
							unk3: 0,
							unk4: true
						});
						mod.hookOnce('S_FATIGABILITY_POINT', 3, (e) => {
							mod.send('C_START_PRODUCE', 1, craftItem);
						});
					}, 5);
				} else{
					clearTimeout(timeout);
					timeout = mod.setTimeout(() => {
						mod.send('C_START_PRODUCE', 1, craftItem);
					}, mod.settings.delay + extraDelay);
				}
			});
		}
	}
};