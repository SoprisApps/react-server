import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';
import Visualizer from 'rollup-plugin-visualizer';

import pkg from './package.json';

const peerDependencies = Object.keys(pkg.peerDependencies);
const bundleTypes = ['client', 'server'];
const outputFormats = ['cjs', 'es'];
const variants = [];

let outputFormatOptions,
	babelExcludeOptions;

bundleTypes.forEach((bundleType) => {
	outputFormats.forEach((outputFormat) => {
		outputFormatOptions = { format: outputFormat };
		babelExcludeOptions = ['node_modules/**'];

		switch (bundleType + '_' + outputFormat) {
			case 'client_cjs':
				outputFormatOptions.file = pkg.browser[pkg.main];
				outputFormatOptions.name = 'ReactServer';
				break;

			case 'client_esm':
				outputFormatOptions.file = pkg.browser[pkg.module];
				babelExcludeOptions.push('*.js'); // don't transpile .js files, only .jsx
				break;

			case 'server_cjs':
				outputFormatOptions.name = 'ReactServer';
				outputFormatOptions.file = pkg.main;
				break;

			case 'server_esm':
				outputFormatOptions.file = pkg.module;
				babelExcludeOptions.push('*.js'); // don't transpile .js files, only .jsx
				break;
		}

		variants.push(
			{
				input: `core/${bundleType}.js`,
				output: outputFormatOptions,
				external: peerDependencies,
				plugins: [
					replace({
						SERVER_SIDE: bundleType === 'server',
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
					Visualizer({
						filename: `./statistics-${bundleType}-${outputFormat}.html`,
						sourcemaps: true,
					}),
				],
			},
		);
	});
});

export default variants;
