import path from "path"
import {logging} from "./react-server";

const logger = logging.getLogger(__LOGGER__);

let CHUNK_HASHES = {};

// takes in stats object returned by a webpack compilation and returns
// removes the require.cache entry for modified files
export default function serverSideHotModuleReload (webpackStats, webpackInfo) {
	if (webpackStats.compilation.errors.length !== 0) {
		logger.warning("Not reloading server side code because Webpack ended with an error compiling.");
		return;
	}

	/*
	This commented code is a placeholder for now.  It took a while to find out which files caused Webpack to recompile
	and we'll probably need it again in the future when we do server side Webpack.

	// Get the list of files that were modified, causing Webpack to recompile
	const modifiedFiles = Object.keys(webpackStats.compilation.compiler.watchFileSystem.watcher.mtimes);
	*/

	// This is the meat of the server side "hot reloading" code.  Essentially, we look iterate over the named
	// chunks and, if their hashes are different from what we last saw, we delete the "require.cache" entry.
	// The next time that file is "require()'d", NodeJS will read it from disk.
	let chunk,
		absoluteFilename;
	for (let chunkName in webpackStats.compilation.namedChunks) {
		if (webpackStats.compilation.namedChunks.hasOwnProperty(chunkName)) {
			chunk = webpackStats.compilation.namedChunks[chunkName];
			if (typeof CHUNK_HASHES[chunkName] !== "undefined" && CHUNK_HASHES[chunkName] !== chunk.hash) {
				chunk.files.map((fileName) => { // eslint-disable-line no-loop-func
					absoluteFilename = path.join(webpackInfo.paths.serverOutputDirAbsolute, fileName);
					logger.notice(`chunk ${chunkName} changed, hot reloading: ${absoluteFilename}`);
					delete require.cache[absoluteFilename];
				});
			}
			CHUNK_HASHES[chunkName] = chunk.hash;
		}
	}
}


