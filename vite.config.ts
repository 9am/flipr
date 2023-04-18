import { resolve } from 'path';
import { defineConfig } from 'vite';
import banner from 'vite-plugin-banner';
import dts from 'vite-plugin-dts';
import postcssNesting from 'postcss-nesting';
import { name, version, description, author, homepage, license } from './package.json';

export default defineConfig({
    plugins: [
        dts({ insertTypesEntry: true }),
        banner((fileName: string) =>
            fileName.match(/\.js$/)
                ? [
                      '/**',
                      ` * name: ${name}@${version}`,
                      ` * desc: ${description}`,
                      ` * author: ${author.name} <${author.email}> [${author.url}]`,
                      ` * homepage: ${homepage}`,
                      ` * license: ${license}`,
                      ' */',
                  ].join('\n')
                : null
        ),
    ],
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
