'use strict';

import assert from 'assert';
import 'mocha';
import path from 'path';
import isEqual from '../index';

const notExist = path.join(__dirname, 'resource/not-found.jpg');
const jsLogo = path.join(__dirname, 'resource/js-logo.jpg');
const nodeLogo = path.join(__dirname, 'resource/nodejs-logo.jpg');
const nodeLogoByte = path.join(__dirname, 'resource/nodejs-logo-byte.jpg');
const nodeLogoCopy = path.join(__dirname, 'resource/nodejs-logo-copy.jpg');

describe('isFileExists correct', () => {
  it('Throw error when compare not a file', async () => {
    await assert.rejects(isEqual(jsLogo, __dirname));
  });

  it('Throw error when file not exists', async () => {
    await assert.rejects(isEqual(jsLogo, notExist));
  });

  it('Return false when file not equals', async () => {
    const equals = await isEqual(jsLogo, nodeLogo);
    assert.strictEqual(equals, false);
  });

  it('Return false on equal size but not content files', async () => {
    const equals = await isEqual(nodeLogo, nodeLogoByte);
    assert.strictEqual(equals, false);
  });

  it('Return true on same file', async () => {
    const equals = await isEqual(jsLogo, jsLogo);
    assert.strictEqual(equals, true);
  });

  it('Return true on equal content files', async () => {
    const equals = await isEqual(nodeLogo, nodeLogoCopy);
    assert.strictEqual(equals, true);
  });
});
