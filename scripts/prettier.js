/* eslint-disable no-console */
// Based on material-ui's prettier scripts

const glob = require('glob-gitignore');
const prettier = require('prettier');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const listChangedFiles = require('./listChangedFiles');

function runPrettier(options) {
  const { changedFiles, shouldWrite, onlyLegacy, onlyNext } = options;

  const cwd = process.cwd();
  if (cwd.endsWith('/ui/app')) process.chdir('../../');

  let didWarn = false;
  let didError = false;

  const warnedFiles = [];
  const ignoredFiles = fs
    .readFileSync('.eslintignore', 'utf-8')
    .split(/\r*\n/)
    .filter((notEmpty) => notEmpty);

  const files = glob
    .sync((onlyLegacy ? 'static-assets/' : onlyNext ? 'ui/' : '') + '**/*.{js,tsx,ts}', {
      ignore: ['**/node_modules/**', ...ignoredFiles]
    })
    .filter((f) => !changedFiles || changedFiles.has(f));

  if (!files.length) {
    return;
  }

  const prettierConfigPath = path.join(__dirname, '../prettier.config.js');

  const promises = files.map((file) => {
    return prettier.resolveConfig(file, {
      config: prettierConfigPath
    });
  });

  Promise.all(promises).then((results) => {
    results.forEach((prettierOptions, index) => {
      const file = files[index];
      try {
        const input = fs.readFileSync(file, 'utf8');
        if (shouldWrite) {
          console.log(`Formatting ${file}`);
          prettier.format(input, { ...prettierOptions, filepath: file }).then((output) => {
            if (output !== input) {
              fs.writeFileSync(file, output, 'utf8');
            }
          });
        } else {
          console.log(`Checking ${file}`);
          if (!prettier.check(input, { ...prettierOptions, filepath: file })) {
            warnedFiles.push(file);
            didWarn = true;
          }
        }
      } catch (error) {
        didError = true;
        console.log(`\n\n${error.message}`);
        console.log(file);
      }
    });

    if (didWarn) {
      console.log(
        '\n\nThis project uses prettier to format all JavaScript code.\n' +
          `Please run '${!changedFiles ? 'yarn prettier:all' : 'yarn prettier'}'` +
          ' and commit the changes to the files listed below:\n\n'
      );
      console.log(warnedFiles.join('\n'));
    }

    if (didWarn || didError) {
      throw new Error('Triggered at least one error or warning');
    }
  });
}

async function run(argv) {
  const { mode } = argv;
  const shouldWrite = mode === 'write' || mode === 'changed' || mode === 'legacy' || mode === 'next';
  const onlyChanged = mode === 'changed' || mode === 'check-changed';
  const onlyLegacy = mode === 'legacy';
  const onlyNext = mode === 'next';

  let changedFiles;
  if (onlyChanged) {
    changedFiles = await listChangedFiles();
  }

  runPrettier({ changedFiles, shouldWrite, onlyLegacy, onlyNext });
}

yargs
  .command({
    command: '$0 [mode]',
    description: 'formats codebase',
    builder: (command) => {
      return command.positional('mode', {
        description: '"write" | "changed" | "legacy" | "next" | "check" | "check-changed"',
        type: 'string',
        default: 'changed'
      });
    },
    handler: run
  })
  .help()
  .strict(true)
  .version(false)
  .parse();
