/*
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * @author Evgenii Zharkov <zharkov.ev.u@yandex.ru>
 */

import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'index.ts',
    output: {
      file: 'dist/index.js',
      exports: 'named',
      format: 'cjs',
    },
    plugins: [typescript({ module: 'es6' })],
  },
  {
    input: 'index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts({ banner: false })],
  },
];
