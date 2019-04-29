const Terser = require("terser");

require("get-stdin")().then(src => {
	const result = Terser.minify(
		src
			// Remove a few hand-annotated debug-related chunks.
			.replace(/\/\*!START_DEBUG(?:.|[\n\r])*?END_DEBUG\*\//g, "")

			// Let Terser's dead-code elimination handle the rest.
			.replace(/\w+\[_Debug]/g, "false")
	);
	console.log( // eslint-disable-line no-console
		"\n"+
		"/*! LAB.js (LABjs :: Loading And Blocking JavaScript)\n"+
		"    v2.0.3 (c) Kyle Simpson\n"+
		"    MIT License\n"+
		"*/\n"+
		result.code
	);
});
