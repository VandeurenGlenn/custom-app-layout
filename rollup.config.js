export default [
	// iife , for older browsers
	{
    input: 'src/custom-app-layout.js',
    output: {
      file: 'custom-app-layout.js',
      name: 'CustomAppLayout',
      format: 'iife',
      sourcemap: false
    },
    experimentalCodeSplitting: false,
    experimentalDynamicImport: false
	}
]
