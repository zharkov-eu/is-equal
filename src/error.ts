/*
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * @author Evgeni Zharkov <zharkov.ev.u@yandex.ru>
 */

"use strict";

export class EnotfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ENOTFILE";
  }
}
