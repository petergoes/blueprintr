import svelte from 'rollup-plugin-svelte';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	input: 'docs/src/index.svelte',
	output: [
		{ file: 'docs/bundle.js', 'format': 'es', compact: true },
	],
	plugins: [
    nodeResolve(),
		svelte({ customElement: true })
	]
};