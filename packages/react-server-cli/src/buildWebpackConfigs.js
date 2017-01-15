import webpack from "webpack";
import path from "path";
import fs from "fs";
import ExtractTextPlugin from "extract-text-webpack-plugin";
//import ChunkManifestPlugin from "chunk-manifest-webpack-plugin";
import { StatsWriterPlugin } from "webpack-stats-plugin"
import callerDependency from "./callerDependency";
import normalizeRoutesPage from "./normalizeRoutesPage";

// Used with packing modules for Node
let nodeModules = {};

// Identify all node_modules for later
fs.readdirSync('node_modules')
	.filter(function(x) {
		return ['.bin'].indexOf(x) === -1;
	})
	.forEach(function(mod) {
		nodeModules[mod] = true;
	});


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
export default (opts = {}) => {
	const {
		routes,
		webpackConfig,
		webpackClientConfig,
		webpackServerConfig,
		workingDir = "./__clientTemp",
		outputDir = workingDir + "/build",
		serverOutputDir = workingDir + "/serverBuild",
		routesDir = ".",
		hot,
		longTermCaching,
	} = opts;

	const workingDirAbsolute = path.resolve(process.cwd(), workingDir);
	const outputDirAbsolute = path.resolve(process.cwd(), outputDir);
	const serverOutputDirAbsolute = path.resolve(process.cwd(), serverOutputDir);

	const routesDirAbsolute = path.resolve(process.cwd(), routesDir);

	// for each route, let's create an entrypoint file that includes the page file and the routes file
	let clientBootstrapFile = path.resolve(workingDirAbsolute, "clientEntry.js");
	const entrypointBase = hot ? [
		'webpack-hot-middleware/client?path=/__react_server_hmr__&timeout=20000&reload=true',
	] : [];
	const clientEntryPoints = {};
	for (let routeName of Object.keys(routes.routes)) {
		let route = routes.routes[routeName];
		let formats = normalizeRoutesPage(route.page);
		for (let format of Object.keys(formats)) {
			const absolutePathToPage = require.resolve(path.resolve(routesDirAbsolute, formats[format]));

			clientEntryPoints[`${routeName}${format !== "default" ? "-" + format : ""}`] = [
				...entrypointBase,
				clientBootstrapFile,
				absolutePathToPage,
			];
		}
	}

	const serverBootstrapFile = path.resolve(workingDirAbsolute, "routes_server.js");
	const serverEntryPoints = {
		'Routes': serverBootstrapFile,
	};

	if (longTermCaching && hot) {
		// chunk hashes can't be used in hot mode, so we can't use long-term caching
		// and hot mode at the same time.
		throw new Error("Hot reload cannot be used with long-term caching. Please disable either long-term caching or hot reload.");
	}

	// finally, let's pack this up with webpack.
	const webpackConfigFunc = makeCustomWebpackConfigFunc(webpackConfig);

	const webpackClientConfigFunc = makeCustomWebpackConfigFunc(webpackClientConfig);
	const finalWebpackClientConfig = webpackClientConfigFunc(packageCodeForBrowser(webpackConfigFunc(getCommonWebpackConfig(opts)), clientEntryPoints, outputDirAbsolute, opts));

	const webpackServerConfigFunc = makeCustomWebpackConfigFunc(webpackServerConfig);
	const finalWebpackServerConfig = webpackServerConfigFunc(packageCodeForNode(webpackConfigFunc(getCommonWebpackConfig(opts)), serverEntryPoints, serverOutputDirAbsolute));

	return {
		paths: {
			workingDirAbsolute,
			outputDirAbsolute,
			serverOutputDirAbsolute,
			clientBootstrapFile,
			serverEntryPoints,
		},
		client: {
			config: finalWebpackClientConfig,
			compiler: null,
			compiledPromise: null,
		},
		server: {
			config: finalWebpackServerConfig,
			compiler: null,
			compiledPromise: null,
			routesFile: null,
		},
	};
}

function getCommonWebpackConfig(options) {
	const {
		hot,
		longTermCaching,
	} = options;
	const NonCachingExtractTextLoader = path.join(__dirname, "./NonCachingExtractTextLoader");
	const extractTextLoader = require.resolve(NonCachingExtractTextLoader) + "?{remove:true}!css-loader";

	let commonWebpackConfig = {
		profile: true,
		module: {
			loaders: [
				{
					test: /\.jsx?$/,
					loader: "babel",
					exclude: /node_modules/,
				},
				{
					test: /\.css$/,
					loader: extractTextLoader,
					exclude: /node_modules/,
				},
				{
					test: /\.(eot|woff|woff2|ttf|ttc|png|svg|jpg|jpeg|gif|cgm|tiff|webp|bmp|ico)$/i,
					loader: "file",
					exclude: /node_modules/,
				},
				{
					test: /\.json/,
					loader: "json",
					// exclude: /node_modules/,
				},
				{
					test: /\.less/,
					loader: extractTextLoader + "!less-loader",
					exclude: /node_modules/,
				},
				{
					test: /\.s(a|c)ss$/,
					loader: extractTextLoader + "!sass-loader",
					exclude: /node_modules/,
				},
				{
					test: /\.md/,
					loader: "raw",
					exclude: /node_modules/,
				},
			],
		},
		resolve: {
			alias: {
				// These need to be singletons.
				"react"        : callerDependency("react"),
				"react-dom"    : callerDependency("react-dom"),
				"react-server" : callerDependency("react-server"),
			},
		},
		resolveLoader: {
			root: [
				path.resolve(path.join(path.dirname(require.resolve("webpack")), "../..")),
			],
		},
		plugins: [
			new webpack.optimize.OccurrenceOrderPlugin(true),
			new webpack.DefinePlugin({
				'process.env': {
					'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'), // eslint-disable-line no-process-env
				},
			}),
			new webpack.optimize.DedupePlugin(),
			new ExtractTextPlugin(`[name]${longTermCaching ? ".[chunkhash]" : ""}.css`),
			new StatsWriterPlugin({
				fields: [
					"assets",
					"assetsByChunkName",
					"children",
					"chunks",
					"filteredModules",
					"errors",
					"hash",
					"modules",
					"profile",
					"reasons",
					"version",
					"warnings",
				],
			}),
		],
	};

	if (hot) {
		commonWebpackConfig.module.loaders = [
			{
				test: /\.jsx?$/,
				loader: "react-hot",
				exclude: /node_modules/,
			},
			...commonWebpackConfig.module.loaders,
		];
		commonWebpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
		commonWebpackConfig.plugins.push(new webpack.NoErrorsPlugin());
	}

	return commonWebpackConfig;
}

function packageCodeForBrowser(commonWebpackConfig, entryPoints, outputDir, options) {
	const {
		hot,
		longTermCaching,
		outputUrl,
		minify,
	} = options;

	let clientWebpackConfig = Object.assign({}, commonWebpackConfig, {
		target: "web",
		entry: entryPoints,
		output: {
			path: outputDir,
			// other than hot mode, the public path is set at runtime.
			publicPath: hot ? outputUrl : undefined,
			filename: `[name]${longTermCaching ? ".[chunkhash]" : ""}.bundle.js`,
			chunkFilename: `[id]${longTermCaching ? ".[chunkhash]" : ""}.bundle.js`,
		},
		plugins: [
			...commonWebpackConfig.plugins,
			/*
			TODO: need to figure out why this isn't working properly.  This file is only generated when
	    		compiling using "hot" setting and isn't used anywhere.
			new ChunkManifestPlugin({
				filename: "chunk-manifest.json",
				manifestVariable: "webpackManifest",
			}),
			*/
			new webpack.optimize.CommonsChunkPlugin({
				name:"common",
			}),
			new webpack.DefinePlugin({
				REACT_SERVER_CLIENT_SIDE: 'true',
			}),
		],
	});

	if (minify) {
		clientWebpackConfig.plugins.push(
			// TODO: should this be done as babel plugin?
			new webpack.optimize.UglifyJsPlugin(),
		);
	} else {
		clientWebpackConfig.plugins.push(new webpack.SourceMapDevToolPlugin());
	}

	return clientWebpackConfig;
}

function packageCodeForNode(commonWebpackConfig, entryPoints, outputDir) {
	// This function is required because sometimes modules are loaded like 'require("react-dom/server/index.js");' and
	// it forces Webpack to load the whole react-dom module.
	// https://github.com/webpack/webpack/issues/839#issuecomment-177219660
	const nodeModulesTransform = function(context, request, callback) {
		let absoluteRequest;
		if (/^\./.test(request)) {
			// this is a relative pathname
			absoluteRequest = path.join(context, request);
		} else {
			absoluteRequest = request;
		}
		// Make all of the requests relative to node_modules for determining nested modules
		const relativeRequest = path.normalize(absoluteRequest).replace(/^.*?\/node_modules\//, '');

		// search for a '/' indicating a nested module
		const slashIndex = relativeRequest.indexOf("/");
		let rootModuleName;
		if (slashIndex === -1) {
			rootModuleName = relativeRequest;
		} else {
			rootModuleName = relativeRequest.substr(0, slashIndex);
		}

		// Match for root modules that are in our node_modules except Webpack.
		// Because Webpack uses relative pathnames for itself, let's just bundle Webpack
		if (rootModuleName !== "webpack" && nodeModules.hasOwnProperty(rootModuleName)) {
			// This is in our node_modules, so we can safely list it as external
			callback(null, "commonjs " + request);
		} else {
			// This is NOT in our node_modules, so we must bundle it.
			callback();
		}
	};

	let serverWebpackConfig = Object.assign({}, commonWebpackConfig, {
		target: "node",
		node: {
			__dirname  : false,
			__filename : false,
		},
		entry: entryPoints,
		externals: nodeModulesTransform,
		output: {
			path: outputDir,
			filename: '[name].bundle.js',
			chunkFilename: '[id].bundle.js',
			libraryTarget: 'commonjs2',
			pathinfo: true,
		},
		devtool: 'source-map',
		plugins: [
			...commonWebpackConfig.plugins,
			new webpack.SourceMapDevToolPlugin(),
			new webpack.NormalModuleReplacementPlugin(/\.(css|less|sass|scss)$/, 'node-noop'),
			new webpack.BannerPlugin('require("source-map-support").install();', {
				raw: true,
				entryOnly: true,
			}),
			new webpack.DefinePlugin({
				REACT_SERVER_CLIENT_SIDE: 'false',
			}),
			/*
			// Don't enable this until we figure out how to import a webpack bundle from node without module.exports
			// being set properly by Webpack.
			new webpack.optimize.CommonsChunkPlugin({
				name:"common",
			}),
			 */
			new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
		],
	});

	return serverWebpackConfig;
}

function makeCustomWebpackConfigFunc(customWebpackConfigFunc) {
	if (customWebpackConfigFunc) {
		const userWebpackConfigFunc = require(path.resolve(process.cwd(), customWebpackConfigFunc));
		customWebpackConfigFunc = userWebpackConfigFunc.default
	} else {
		customWebpackConfigFunc = (data) => { return data };
	}
	return customWebpackConfigFunc;
}