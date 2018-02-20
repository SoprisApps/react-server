import * as clientLogging from './logging/client';
import * as serverLogging from './logging/server';

let getLogger,
	setLevel,
	addTransport,
	addRewriter,
	setColorize,
	setTimestamp;

// See docs/logging
if (SERVER_SIDE) {
	getLogger = serverLogging.getLogger;
	setLevel = serverLogging.setLevel;
	addTransport = serverLogging.addTransport;
	addRewriter = serverLogging.addRewriter;
	setColorize = serverLogging.setColorize;
	setTimestamp = serverLogging.setTimestamp;
} else {
	getLogger = clientLogging.getLogger;
	setLevel = clientLogging.setLevel;
	addTransport = clientLogging.addTransport;
}

export {
	getLogger,
	setLevel,
	addTransport,
	addRewriter,
	setColorize,
	setTimestamp,
}
