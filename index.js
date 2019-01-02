module.exports = function EndlessCrafting(dispatch) {

	let enabled = false;
	let gameId;
	let craftItem;
	let pp;
	let cureId = 182439; //Normal: 181100, elite: 182439
	let cureDbid = 0;

	dispatch.command.add('craft', (chatLink) => {
		if (!chatLink) {
			if (enabled) { //send fake failed craft after 5 sec to unlock char
				dispatch.command.message('Cancel crafting in 5 seconds.');
				setTimeout(unlock, 5000);
			}
			enabled = !enabled;
			dispatch.command.message('Endless crafting module ' + (enabled?'enabled.':'disabled.'));
			return;
		}
		if (chatLink === 'unlock') {
			unlock();
		} else {
			var regexId = /#(\d*)@/;
			var regexDbid = /@(\d*)@/;
			var id = chatLink.match(regexId);
			var dbid = chatLink.match(regexDbid);
			if (id && dbid) {
				cureId = parseInt(id[1]);
				cureDbid = parseInt(dbid[1]);
				dispatch.command.message('Using pp consumable with id:' + cureId);
			} else {
				dispatch.command.message('Error, not a chatLink. Please type "craft <Item>". Link the item with Ctrl+LMB.');
			}
		}
	});

	function unlock() {
		dispatch.toClient('S_START_PRODUCE', 3, {
			duration: 0
		});
	}
	
	dispatch.hook('S_LOGIN', 10, event => {
		gameId = event.gameId;
	});
	
	dispatch.hook('S_FATIGABILITY_POINT', 3, event => {
		pp = event.current;
        //console.log(JSON.stringify(event,null,2));
	});
	
	dispatch.hook('C_START_PRODUCE', 1, event => {
		craftItem = event;
	});
	
	dispatch.hook('S_START_PRODUCE', 3, event => {
		//if (enabled && !event.duration && pp < 200) {
		if (enabled && pp < 200) {
			dispatch.command.message("Using pp consumable.");
            let cureObj = {low: cureDbid, high: 0, unsigned: true};
			dispatch.toServer('C_USE_ITEM', 3, {
				gameId: gameId,
				id: cureId,
				dbid: parseInt(cureObj.low),
                //dbid: cureDbid,
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

	dispatch.hook('S_END_PRODUCE', 1, event => {
        //setTimeout(()=>{
            if (enabled && event.success) {
                dispatch.toServer('C_START_PRODUCE', 1, craftItem);
            }
        //}, 50);
	});
};
