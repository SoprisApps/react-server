import path from 'path';

/**
 * Thin wrapper around the environment-specific configuration file
 */

let config = null;

function serverConfig() {
	// only read out the config once, and then cache it. -sra.
	if (null === config) {

		//eslint-disable-next-line no-process-env
		if (process.env.REACT_SERVER_CONFIGS) {
			//eslint-disable-next-line no-process-env
			var configFilePath = process.env.REACT_SERVER_CONFIGS;

			// Node.js tries to load `config.js` file first. If `config.js` doesn't exist, Node.js
			// then try to load `config.json`.
			//
			// If `configFilePath` is absolute `require.resolve` will
			// reset to it, correctly overriding `process.cwd()`.  If it
			// is relative, then it will be relative to `process.cwd()`.
			//
			configFilePath = path.resolve(process.cwd(), configFilePath, "config");
			config = Object.freeze(require(configFilePath));
		} else {
			config = Object.freeze({});
		}
	}
	return config;
}

// I'm not entirely clear why this code is here; it seems to just copy all the key & values from inputEnv;
// I'm not clear why the client wouldn't just use inputEnv.
const clientEnv = {
	rehydrate: function (inputEnv) {
		Object.keys(inputEnv).forEach( key => {
			clientEnv[key] = inputEnv[key];
		});

		// janky: remove the 'rehydrate' method from
		// the environment module after it's used
		delete clientEnv.rehydrate;
	},
};

function clientConfig() {
	return clientEnv;
}

let thisConfig;

if (SERVER_SIDE) {
	thisConfig = serverConfig;
} else {
	thisConfig = clientConfig;
}

export default thisConfig;
