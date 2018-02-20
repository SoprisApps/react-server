import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const entryPoint = 'src/index.js';

export default [
	{
		input: entryPoint,
		output: [
			{ file: pkg.main, format: 'cjs', name: 'JsonResponseMiddleware' },
		],
		external: (id) => {
			console.log('checking external dep: ', id);
			return id.indexOf("babel-runtime") === 0;
		},
		plugins: [
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
				module: true,
				extensions: [ '.js', '.jsx' ],
			}),
			commonjs(),
		],
	},
	{
		input: entryPoint,
		output: [
			{ file: pkg.module, format: 'es' },
		],
		plugins: [
			commonjs(),
		],
	},
];
