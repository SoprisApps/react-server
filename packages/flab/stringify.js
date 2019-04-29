require("get-stdin")().then(src => console.log( // eslint-disable-line no-console
	'const flabSrc = ' + src
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
		.replace(/^/gm, '"')
		.replace(/$/gm, '\\n"+')+
	'"";\nexport default flabSrc;'
));
