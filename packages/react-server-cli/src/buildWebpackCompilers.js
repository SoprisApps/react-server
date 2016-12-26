import webpack from "webpack"
import path from "path"
import mkdirp from "mkdirp"
import fs from "fs"
//import crypto from "crypto"

import normalizeRoutesPage from "./normalizeRoutesPage";


// commented out to please eslint, but re-add if logging is needed in this file.
// import {logging} from "react-server"
// const logger = logging.getLogger(__LOGGER__);

// compiles the routes file for browser clients using webpack.
// returns a tuple of { compiler, serverRoutes }. compiler is a webpack compiler
// that is ready to have run called, and serverRoutes is a promise that resolve to
// a path to the transpiled server routes file path. The promise only resolves
// once the compiler has been run. The file path returned from the promise
// can be required and passed in to reactServer.middleware().
// TODO: add options for sourcemaps.
export default (opts = {}, webpackInfo) => {
	const {
		routes,
		routesDir = ".",
		hot,
		longTermCaching,
	} = opts;
	const {
		workingDirAbsolute,
		outputDirAbsolute,
		serverOutputDirAbsolute,
		clientBootstrapFile,
	} = webpackInfo.paths;

	mkdirp.sync(workingDirAbsolute);
	mkdirp.sync(outputDirAbsolute);
	mkdirp.sync(serverOutputDirAbsolute);

	const routesDirAbsolute = path.resolve(process.cwd(), routesDir);

	writeClientBootstrapFile(clientBootstrapFile, opts);

	// now rewrite the routes file out in a webpack-compatible way.
	writeWebpackCompatibleRoutesFile(routes, routesDir, workingDirAbsolute, null, true);

	// It seems that WebpackDevServer doesn't work properly with multiple compiler configs at this time.  We'll have to
	// manually trigger the serverCompiler to run after the clientCompiler finishes then.
	// https://github.com/webpack/webpack/issues/1849
	webpackInfo.client.compiler = webpack(webpackInfo.client.config);
	webpackInfo.server.compiler = webpack(webpackInfo.server.config);

	webpackInfo.server.routesFile = new Promise((resolve, reject) => {
		webpackInfo.client.compiler.plugin("done", (stats) => {
			const manifest = statsToManifest(stats);

			// TODO: need to figure out why these two manifest files aren't working or used.
			//fs.writeFileSync(path.join(outputDirAbsolute, "manifest.json"), JSON.stringify(manifest));

			// this file is generated by the build in non-hot mode, but we don't need
			// it (we got the data ourselves from stats in statsToManifest()).
			if (!hot && longTermCaching) {
				//fs.unlinkSync(path.join(outputDirAbsolute, "chunk-manifest.json"));
			}

			const routesFilePath = writeWebpackCompatibleRoutesFile(routes, routesDir, workingDirAbsolute, webpackInfo.client.config.output.publicPath, false, manifest);
			webpackInfo.server.compiler.run((err) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(routesFilePath);
			});
		});
	});

	return webpackInfo;
}

// takes in the stats object from a successful compilation and returns a manifest
// object that characterizes the results of the compilation for CSS/JS loading
// and integrity checking. the manifest has the following entries:
//   jsChunksByName: an object that maps chunk names to their JS entrypoint file.
//   cssChunksByName: an object that maps chunk names to their CSS file. Note that
//     not all named chunks necessarily have a CSS file, so not all names will
//     show up as a key in this object.
//   jsChunksById: an object that maps chunk ids to their JS entrypoint file.
//   hash: the overall hash of the build, which can be used to check integrity
//     with prebuilt sources.
function statsToManifest(stats) {
	const jsChunksByName = {};
	const cssChunksByName = {};
	const jsChunksById = {};
	for (const chunk of stats.compilation.chunks) {
		if (chunk.name) {
			jsChunksByName[chunk.name] = chunk.files[0];
			if (chunk.files.length > 1) {
				cssChunksByName[chunk.name] = chunk.files[1];
			}
		}
		jsChunksById[chunk.id] = chunk.files[0];
	}
	return {
		jsChunksByName,
		jsChunksById,
		cssChunksByName,
		hash: stats.hash,
	};
}

// writes out a routes file that can be used at runtime.
function writeWebpackCompatibleRoutesFile(routes, routesDir, workingDirAbsolute, staticUrl, isClient, manifest) {
	let routesOutput = [];

	const coreMiddleware = require.resolve("react-server-core-middleware");
	const existingMiddleware = routes.middleware ? routes.middleware.map((middlewareRelativePath) => {
		return `unwrapEs6Module(require("${path.relative(workingDirAbsolute, path.resolve(routesDir, middlewareRelativePath))}"))`
	}) : [];
	routesOutput.push(`
var manifest = ${manifest ? JSON.stringify(manifest) : "undefined"};
function unwrapEs6Module(module) { return module.__esModule ? module.default : module }
var coreJsMiddleware = require('${coreMiddleware}').coreJsMiddleware;
var coreCssMiddleware = require('${coreMiddleware}').coreCssMiddleware;
module.exports = {
	middleware:[
		coreJsMiddleware(${JSON.stringify(staticUrl)}, manifest),
		coreCssMiddleware(${JSON.stringify(staticUrl)}, manifest),
		${existingMiddleware.join(",")}
	],
	routes:{`);

	for (let routeName of Object.keys(routes.routes)) {
		let route = routes.routes[routeName];

		routesOutput.push(`
		${routeName}: {`);
		routesOutput.push(`
			path: ${JSON.stringify(route.path)},`);
		// if the route doesn't have a method, we'll assume it's "get". routr doesn't
		// have a default (method is required), so we set it here.
		routesOutput.push(`
			method: "${route.method || "get"}",`);

		let formats = normalizeRoutesPage(route.page);
		routesOutput.push(`
			page: {`);
		for (let format of Object.keys(formats)) {
			const formatModule = formats[format];
			var relativePathToPage = path.relative(workingDirAbsolute, path.resolve(routesDir, formatModule));
			routesOutput.push(`
				${format}: function() {
					return {
						done: function(cb) {`);
			if (isClient) {
				routesOutput.push(`
							require.ensure("${relativePathToPage}", function() {
								cb(unwrapEs6Module(require("${relativePathToPage}")));
							});`);
			} else {
				routesOutput.push(`
							try {
								cb(unwrapEs6Module(require("${relativePathToPage}")));
							} catch (e) {
								console.error('Failed to load page at "${relativePathToPage}"', e.stack);
							}`);
			}
			routesOutput.push(`
						}
					};
				},`);
		}
		routesOutput.push(`
			},
		},`);
	}
	routesOutput.push(`
	}
};`);

	const routesContent = routesOutput.join("");
	// make a unique file name so that when it is required, there are no collisions
	// in the module loader between different invocations.
	//const routesMD5 = crypto.createHash('md5').update(routesContent).digest("hex");
	const routesFilePath = `${workingDirAbsolute}/routes_${isClient ? "client" : "server"}.js`;
	fs.writeFileSync(routesFilePath, routesContent);

	return routesFilePath;
}

// writes out a bootstrap file for the client which in turn includes the client
// routes file. note that outputDir must be the same directory as the client routes
// file, which must be named "routes_client".
function writeClientBootstrapFile(outputFile, opts) {
	fs.writeFileSync(outputFile, `
		if (typeof window !== "undefined") {
			window.__setReactServerBase = function(path) {
				__webpack_public_path__ = path;
				window.__reactServerBase = path;
			}
		}
		var reactServer = require("react-server");
		window.rfBootstrap = function() {
			reactServer.logging.setLevel('main',  ${JSON.stringify(opts.logLevel)});
			reactServer.logging.setLevel('time',  ${JSON.stringify(opts.timingLogLevel)});
			reactServer.logging.setLevel('gauge', ${JSON.stringify(opts.gaugeLogLevel)});
			new reactServer.ClientController({routes: require("./routes_client")}).init();
		}`
	);
}
