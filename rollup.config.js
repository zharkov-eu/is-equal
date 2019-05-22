/*
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * @author Evgeni Zharkov <zharkov.ev.u@yandex.ru>
 */

import fs from "fs";
import commonjs from "rollup-plugin-commonjs";
import { dts } from "rollup-plugin-dts";

let err = (() => {
  try {
    fs.mkdirSync("dist");
  } catch (e) {
    return e.code === "EEXIST" ? null : e;
  }
})();
if (err) throw err;

export default [{
  input: "index.js",
  output: {
    file: "dist/index.js",
    format: "commonjs",
    exports: "named"
  },
  plugins: [commonjs()]
}, {
  input: "index.ts",
  output: {
    file: "dist/index.d.ts",
    format: "es"
  },
  plugins: [dts({ banner: false })]
}]
