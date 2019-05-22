/*
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * @author Evgeni Zharkov <zharkov.ev.u@yandex.ru>
 */

"use strict";

import fs from "fs";
import { promisify } from "util";
import { EnotfileError } from "./error";

const bufSize = 16 * 1024;
const statAsync = promisify(fs.stat);

/**
 * Check file content equals
 * @param {string} a - filepath
 * @param {string} b - filepath
 * @throws CommonSystemErrors | ENOTFILE
 */
export async function isFileEquals(a: string, b: string): Promise<boolean> {
  const statA = await statAsync(a);
  const statB = await statAsync(b);
  if (!statA.isFile()) throw new EnotfileError(`'${a}' is not a file`);
  if (!statB.isFile()) throw new EnotfileError(`'${b}' is not a file`);

  if (statA.size !== statB.size) return false;

  return new Promise(resolve => {
    let emitCompare = false;
    const compareBuffer = Buffer.allocUnsafe(bufSize);
    const streamA = fs.createReadStream(a, { highWaterMark: bufSize });
    const streamB = fs.createReadStream(b, { highWaterMark: bufSize });

    const handleData = (me: fs.ReadStream, compare: fs.ReadStream) => (chunk: Buffer) => {
      me.pause();
      if (emitCompare) {
        if (chunk.compare(compareBuffer, 0, chunk.byteLength) !== 0) {
          compare.destroy();
          me.destroy();
          return resolve(false);
        }
      } else {
        compareBuffer.fill(chunk);
      }
      emitCompare = !emitCompare;
      compare.resume();
    };

    const handleEnd = () => resolve(true);

    streamA.on("data", handleData(streamA, streamB)).on("end", handleEnd);
    streamB.on("data", handleData(streamB, streamA)).on("end", handleEnd);
  });
}
