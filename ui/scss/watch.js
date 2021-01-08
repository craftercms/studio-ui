const fs = require('fs');
const Subject = require('rxjs').Subject;
const { filter, map, tap, debounceTime } = require('rxjs/operators');
const { processFile, FILES } = require('./lib');

const fileChanged$ = new Subject();
const fileIgnored$ = new Subject();
const queue = [];

fs.watch('.', { recursive: true }, (eventType, fileName) => {
  fileChanged$.next({ eventType, fileName });
});

fileChanged$
  .pipe(
    filter(({ fileName }) => {
      const found = !!FILES.find((item) =>
        typeof item === 'string' ? clean(fileName) === item : clean(fileName) === item.input
      );
      if (!found) {
        fileIgnored$.next(fileName);
      }
      return found;
    }),
    map(({ fileName }) =>
      FILES.find((item) => (typeof item === 'string' ? clean(fileName) === item : clean(fileName) === item.input))
    ),
    tap((info) => {
      if (!queue.find((item) => item === info)) {
        queue.push(info);
      }
    }),
    debounceTime(100)
  )
  .subscribe(() => {
    for (let i = 0, l = queue.length; i < l; i++) {
      const item = queue.pop();
      console.log(`Processing ${item.input || item}.scss`);
      processFile(item);
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
  return fileName.substr(0, fileName.lastIndexOf('.scss'));
}
