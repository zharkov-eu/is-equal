'use strict';

import fs from 'fs';
import { promisify } from 'util';

const bufSize = 16 * 1024;
const statAsync = promisify(fs.stat);

/**
 * Check file content equals
 * @param {string} a - filepath
 * @param {string} b - filepath
 * @throws CommonSystemErrors | ENOTFILE
 */
async function isFileEquals(a: string, b: string): Promise<boolean> {
  const statA = await statAsync(a);
  const statB = await statAsync(b);
  if (!statA.isFile()) throw new EnotfileError(`ENOTFILE: '${a}' is not a file`);
  if (!statB.isFile()) throw new EnotfileError(`ENOTFILE: '${b}' is not a file`);

  if (statA.size !== statB.size) return false;

  return new Promise(resolve => {
    let cmpBufSize = 0;
    let emitCompare = false;
    const cmpBuf = Buffer.allocUnsafe(bufSize);
    const streamA = fs.createReadStream(a, { highWaterMark: bufSize });
    const streamB = fs.createReadStream(b, { highWaterMark: bufSize });

    const handleData = (me: fs.ReadStream, compare: fs.ReadStream) => (chunk: Buffer) => {
      me.pause();
      if (emitCompare) {
        const cmpSize = Math.min(chunk.byteLength, cmpBufSize);
        if (chunk.compare(cmpBuf, 0, cmpSize, 0, cmpSize) !== 0) {
          compare.destroy();
          me.destroy();
          return resolve(false);
        }

        if (chunk.byteLength > cmpBufSize) {
          cmpBuf.fill(chunk.slice(cmpBufSize));
          cmpBufSize = chunk.byteLength - cmpBufSize;
          return compare.resume();
        } else if (chunk.byteLength < cmpBufSize) {
          cmpBuf.fill(cmpBuf.slice(chunk.byteLength));
          cmpBufSize = cmpBufSize - chunk.byteLength;
          return me.resume();
        } else {
          emitCompare = false;
        }
      } else {
        cmpBufSize = chunk.byteLength;
        cmpBuf.fill(chunk);
        emitCompare = true;
      }
      return compare.resume();
    };

    const handleEnd = () => {
      streamA.close();
      streamB.close();
      resolve(true);
    };

    streamA.on('data', handleData(streamA, streamB)).on('end', handleEnd);
    streamB.on('data', handleData(streamB, streamA)).on('end', handleEnd);
  });
}

export class EnotfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ENOTFILE';
  }
}

export default isFileEquals;
