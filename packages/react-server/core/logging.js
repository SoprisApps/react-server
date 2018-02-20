import * as clientLogging from './logging/client';
import * as serverLogging from './logging/server';

let theLogger;

// See docs/logging
if (SERVER_SIDE) {
	theLogger = serverLogging;
} else {
	theLogger = clientLogging;
}

export { theLogger };
