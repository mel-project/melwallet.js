import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import json from '@rollup/plugin-json'
import ttypescript from 'ttypescript'
import tsPlugin from 'rollup-plugin-typescript2'

const pkg = require('./package.json')

const libraryName = 'index'

export default {
  input: `src/${libraryName}.ts`,
  output: [
    { file: pkg.main, name: "index.js", format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ["node-fetch"],
  globals: {
    "node-fetch": "fetch"
  },
  watch: {
    include: 'src/*',
  },
  inlineDynamicImports: true,
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    tsPlugin({
      typescript: ttypescript
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(
      {
        preferBuiltins: true
      }
    ),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
}
