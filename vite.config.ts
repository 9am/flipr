import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import postcssNesting from 'postcss-nesting';

export default defineConfig({
    plugins: [dts({ insertTypesEntry: true })],
    css: {
        postcss: {
            plugins: [postcssNesting],
        },
        modules: {
            generateScopedName: '-[local]-[hash:base64:5]',
            localsConvention: 'dashes',
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'Flipr',
            formats: ['es', 'umd'],
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            output: {
                exports: 'named',
            },
        },
    },
});
