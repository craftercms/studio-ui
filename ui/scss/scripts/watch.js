/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const fs = require('fs');
const Subject = require('rxjs').Subject;
const { filter, map, tap, debounceTime } = require('rxjs/operators');
const { processFileDevMode, FILES } = require('./lib');

const fileChanged$ = new Subject();
const fileIgnored$ = new Subject();
const queue = [];

FILES.forEach(processFileDevMode);

fs.watch('.', { recursive: true }, (eventType, fileName) => {
  // fileChanged$.next({ eventType, fileName });
  FILES.forEach(processFileDevMode);
});

fileChanged$.pipe(
  filter(({ fileName }) => {
    const found = !!FILES.find((item) =>
      (typeof item === 'string')
        ? clean(fileName) === item
        : clean(fileName) === item.input
    );
    if (!found) {
      fileIgnored$.next(fileName);
    }
    return found;
  }),
  map(({ fileName }) => FILES.find((item) =>
    (typeof item === 'string')
      ? clean(fileName) === item
      : clean(fileName) === item.input
  )),
  tap((info) => {
    if (!queue.find((item) => item === info)) {
      queue.push(info);
    }
  }),
  debounceTime(100)
).subscribe(() => {
  for (let i = 0, l = queue.length; i < l; i++) {
    const item = queue.pop();
    console.log(`Processing ${item.input || item}.scss`);
    processFileDevMode(item);
  }
});

fileIgnored$.pipe(debounceTime(100)).subscribe((fileName) => {
  console.log(
    `! * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n` +
    `! Ignored file '${fileName.substr(0, fileName.indexOf('__'))}'.\n` +
    `! Did you mean to build it? If so, add it to \`FILES\` const on lib.js\n` +
    `! * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *`
  );
});

function clean(fileName) {
  return fileName.substr(0, fileName.lastIndexOf('.scss')).replace('src/', '');
}
