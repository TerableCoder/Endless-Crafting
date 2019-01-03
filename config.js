module.exports = {
	enabled: false,
    cureId: 182439, //Normal: 181100, elite: 182439
	ufc: true, // unk -> fatigability -> current ?
	/*
	The module will automatically toggle it if you choose the wrong option
	if your S_FATIGABILITY_POINT.3.def looks like this
		int32 unk
		int32 fatigability
		int32 current
	then set ufc to "true"
	
	if it looks like this
		int32 unk
		int32 current
		int32 fatigability
	then set ufc to "false"
	*/
}