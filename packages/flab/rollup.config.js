import pkg from "./package.json";

const rollupConfig = [
	{
		input: "index.js",
		output: [
			{file: pkg.module, format: "esm", sourcemap: "inline"},
			{file: pkg.main, format: "cjs", sourcemap: "inline"},
		],
	},
];
export default rollupConfig;
