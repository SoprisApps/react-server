import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';


import pkg from './package.json';

const peerDependencies = Object.keys(pkg.peerDependencies);

const clientEntryPoint = 'core/client.js';
const serverEntryPoint = 'core/server.js';

export default [
	{
		input: clientEntryPoint,
		output: [
			{ file: pkg.browser[pkg.main], format: 'cjs', name: 'ReactServer' },
		],
		external: peerDependencies,
		plugins: [
			replace({
				SERVER_SIDE: false,
			}),
			babel({
				babelrc: false,
				externalHelpers: true,
				runtimeHelpers: true,
				exclude: ['node_modules/**'],
				presets: [
					["env", { "modules": false }],
					'stage-0',
					'react',
				],
				plugins: [ 'react-server', 'transform-runtime', 'external-helpers' ],
			}),
			nodeResolve({
				preferBuiltins: true,
				module: true,
				extensions: [ '.js', '.jsx', '.json' ],
			}),
			commonjs({
				ignore: [ 'continuation-local-storage' ],
			}),
			json(),
		],
	},
	{
		input: clientEntryPoint,
		output: [
			{ file: pkg.browser[pkg.module], format: 'es' },
		],
		plugins: [
			replace({
				SERVER_SIDE: false,
			}),
			babel({
				babelrc: false,
				externalHelpers: true,
				runtimeHelpers: true,
				exclude: ['node_modules/**', '*.js'],
				presets: [
					["env", { "modules": false }],
					'stage-0',
					'react',
				],
				plugins: [ 'react-server', 'transform-runtime', 'external-helpers' ],
			}),
			nodeResolve({
				preferBuiltins: true,
				module: true,
				extensions: [ '.js', '.jsx', '.json' ],
			}),
			commonjs({
				ignore: [ 'continuation-local-storage' ],
			}),
			json(),
		],
	},
	{
		input: serverEntryPoint,
		output: [
			{ file: pkg.main, format: 'cjs', name: 'ReactServer' },
		],
		external: peerDependencies,
		plugins: [
			replace({
				SERVER_SIDE: true,
			}),
			babel({
				babelrc: false,
				externalHelpers: true,
				runtimeHelpers: true,
				exclude: ['node_modules/**'],
				presets: [
					["env", { "modules": false }],
					'stage-0',
					'react',
				],
				plugins: [ 'react-server', 'transform-runtime', 'external-helpers' ],
			}),
			nodeResolve({
				preferBuiltins: true,
				module: true,
				extensions: [ '.js', '.jsx', '.json' ],
			}),
			commonjs({
				ignore: [ 'continuation-local-storage' ],
			}),
			json(),
		],
	},
	{
		input: serverEntryPoint,
		output: [
			{ file: pkg.module, format: 'es' },
		],
		plugins: [
			replace({
				SERVER_SIDE: true,
			}),
			babel({
				babelrc: false,
				externalHelpers: true,
				runtimeHelpers: true,
				exclude: ['node_modules/**', '*.js'],
				presets: [
					["env", { "modules": false }],
					'stage-0',
					'react',
				],
				plugins: [ 'react-server', 'transform-runtime', 'external-helpers' ],
			}),
			nodeResolve({
				preferBuiltins: true,
				module: true,
				extensions: [ '.js', '.jsx', '.json' ],
			}),
			commonjs({
				ignore: [ 'continuation-local-storage' ],
			}),
			json(),
		],
	},
];
