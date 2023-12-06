/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

process.chdir(__dirname);

const fs = require('fs');
const prettier = require('prettier');
const prettierConfig = require('../prettier.config');
const childProcess = require('child_process');
const rootPath = __dirname.replace('/scripts', '');
const appSrcPath = `${rootPath}/ui/app/src`;
const componentsPath = `${appSrcPath}/components`;
const isDirectoryFilter = (directory) => directory.isDirectory();
const withFileTypes = true;
const args = process.argv.slice(2);

function muiIcons(iconSetName) {
  const builder = [
    fs.readFileSync('./copyright.js'),
    '\n',
    `import { lazy } from 'react';`,
    `import { components } from '../utils/constants';`,
    `\n`,
    `export default function register() {`
  ];
  const outFile = `${rootPath}/ui/app/src/env/register${iconSetName}Icons.ts`;
  fs.readFile(`${rootPath}/node_modules/@mui/icons-material/esm/index.js`, 'utf8', (error, input) => {
    if (error) {
      return console.log(error);
    }
    let icons = input
      .replace(/\/\*(.|\n)+?\*\/\n?/, '')
      .replace(/export \{.+?\} from '\.\/(.+)';/g, '$1')
      .split('\n')
      .filter((iconName) => iconName.includes(iconSetName))
      .map((iconName) => `@mui/icons-material/${iconName}`)
      .map((iconPath) => `components.set('${iconPath}', lazy(() => import('${iconPath}')));`)
      .join('\n');
    builder.push(icons);
    builder.push('}');
    fs.writeFileSync(outFile, builder.join(''), { encoding: 'utf8' });
    childProcess.exec(`node ${rootPath}/node_modules/.bin/prettier --write ${outFile}`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
      }
      console.log(`Mui ${iconSetName} icon set created successfully.`);
    });
  });
}

function studioUI() {
  const builder = [];
  const services = [];
  const utils = [];
  const createComponentEntry = ({ name, path, type = 'component' }) =>
    `${name}: lazy(() => import('../${type === 'component' ? 'components' : 'icons'}/${path}')),`;

  builder.push(fs.readFileSync('./copyright.js'));
  builder.push(`import { lazy } from 'react';`);
  fs.readdirSync(`${appSrcPath}/services`, { withFileTypes }).forEach((file) => {
    if (file.name !== 'index.ts' && file.name !== '.DS_Store') {
      const name = file.name.replace(/(\.ts|\.tsx)$/, '');
      services.push(name);
      builder.push(`import * as ${name}Service from '../services/${name}';`);
    }
  });
  fs.readdirSync(`${appSrcPath}/utils`, { withFileTypes }).forEach((file) => {
    if (
      ![
        'index.ts',
        '.DS_Store',
        'codebase-bridge.tsx',
        'craftercms.ts',
        'i18n-legacy.ts',
        'registerComponents.ts',
        'registerOutlinedIcons.ts',
        'registerRoundedIcons.ts',
        'studioUI.ts',
        'hljs.ts',
        'encrypt.ts',
        'mui.ts',
        'xml.ts',
        'resource.ts'
      ].includes(file.name)
    ) {
      const name = file.name.replace(/(\.ts|\.tsx)$/, '');
      utils.push(name);
      builder.push(`import * as ${name}Util from '../utils/${name}';`);
    }
  });
  builder.push(`export const components = {`);
  fs.readdirSync(componentsPath, { withFileTypes })
    .filter(isDirectoryFilter)
    .forEach((directory) => {
      const path = directory.name;
      builder.push(createComponentEntry({ path, name: directory.name }));
      fs.readdirSync(`${componentsPath}/${directory.name}`, { withFileTypes })
        .filter(isDirectoryFilter)
        .forEach((subdirectory) => {
          builder.push(createComponentEntry({ path: `${path}/${subdirectory.name}`, name: subdirectory.name }));
        });
    });
  builder.push('};');
  builder.push(`export const icons = {`);
  fs.readdirSync(`${appSrcPath}/icons`, { withFileTypes }).forEach((file) => {
    if (file.name !== 'index.ts' && file.name !== '.DS_Store') {
      const name = file.name.replace(/(\.ts|\.tsx)$/, '');
      const path = name;
      builder.push(createComponentEntry({ path, name, type: 'icon' }));
    }
  });
  builder.push('};');
  builder.push(`export const services = { ${services.map((name) => `${name}: ${name}Service`).join(',')} };`);
  builder.push(`export const utils = { ${utils.map((name) => `${name}: ${name}Util`).join(',')} };`);
  const outFile = `${rootPath}/ui/app/src/env/studioUI.ts`;
  fs.writeFile(outFile, builder.join(''), 'utf8', () => {
    childProcess.exec(`node ${rootPath}/node_modules/.bin/prettier --write ${outFile}`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
      }
      console.log('Studio UI export created successfully.');
    });
  });
}

function componentsIndex() {
  const builder = [];
  const createExport = (name) => `export * from './${name}';`;

  builder.push(fs.readFileSync('./copyright.js'));
  builder.push('\n');

  fs.readdirSync(componentsPath, { withFileTypes })
    .filter(isDirectoryFilter)
    .forEach((directory) => {
      const path = directory.name;
      builder.push(createExport(path));
      fs.readdirSync(`${componentsPath}/${directory.name}`, { withFileTypes })
        .filter(isDirectoryFilter)
        .forEach((subdirectory) => {
          builder.push(createExport(`${path}/${subdirectory.name}`));
        });
    });

  prettier
    .format(builder.join(''), {
      ...prettierConfig,
      parser: 'babel'
    })
    .then((formatted) => {
      fs.writeFile(`${componentsPath}/index.ts`, formatted, 'utf8', () => {
        console.log('Components index created successfully.');
      });
    });
}

function iconsIndex() {
  const iconsPath = `${appSrcPath}/icons`;
  const builder = [];
  const createExport = (name) => `export { default as ${name} } from './${name}';`;

  builder.push(fs.readFileSync('./copyright.js'));
  builder.push('\n');

  fs.readdirSync(iconsPath).forEach((file) => {
    if (!['index.ts', '.DS_Store'].includes(file)) {
      builder.push(createExport(file.replace(/(\.ts|\.tsx)$/, '')));
    }
  });

  prettier
    .format(builder.join(''), {
      ...prettierConfig,
      parser: 'babel'
    })
    .then((formatted) => {
      fs.writeFile(`${iconsPath}/index.ts`, formatted, 'utf8', () => {
        console.log('Icons index created successfully.');
      });
    });
}

function modelsIndex() {
  const modelsPath = `${appSrcPath}/models`;
  const builder = [];
  const createExport = (name) => `export * from './${name}';`;

  builder.push(fs.readFileSync('./copyright.js'));
  builder.push('\n');

  fs.readdirSync(modelsPath, { withFileTypes }).forEach((file) => {
    if (file.isDirectory()) {
      fs.readdirSync(`${modelsPath}/${file.name}`, { withFileTypes }).forEach((subFile) => {
        if (!subFile.isDirectory() && !['index.ts', '.DS_Store'].includes(subFile.name)) {
          builder.push(createExport(`${file.name}/${subFile.name.replace(/(\.ts|\.tsx)$/, '')}`));
        }
      });
    } else if (!['index.ts', '.DS_Store'].includes(file.name)) {
      builder.push(createExport(file.name.replace(/(\.ts|\.tsx)$/, '')));
    }
  });

  prettier
    .format(builder.join(''), {
      ...prettierConfig,
      parser: 'babel'
    })
    .then((formatted) => {
      fs.writeFile(`${modelsPath}/index.ts`, formatted, 'utf8', () => {
        console.log('Models index created successfully.');
      });
    });
}

function xbReactIndex() {
  const path = `${rootPath}/ui/guest/src/react`;
  const builder = [];
  const createExport = (name) => `export * from './${name}';`;

  builder.push(fs.readFileSync('./copyright.js'));
  builder.push('\n');

  fs.readdirSync(path).forEach((file) => {
    if (!['index.ts', '.DS_Store', 'package.json'].includes(file)) {
      builder.push(createExport(file.replace(/(\.ts|\.tsx)$/, '')));
    }
  });

  prettier
    .format(builder.join(''), {
      ...prettierConfig,
      parser: 'babel'
    })
    .then((formatted) => {
      fs.writeFile(`${path}/index.ts`, formatted, 'utf8', () => {
        console.log('xb/react index created successfully.');
      });
    });
}

function muiExport() {
  const mui = require('@mui/material');
  const builder = [];
  const components = [];
  const utilities = [];
  const muiExports = Object.keys(mui);

  muiExports.forEach((name) => {
    if (/^[A-Z]/.test(name)) {
      components.push(name);
    } else {
      utilities.push(name);
    }
  });

  builder.push(fs.readFileSync('./copyright.js'));
  builder.push(`import { lazy } from 'react';`);
  builder.push(`import { ${utilities.join(', ')} } from '@mui/material';\n\n`);
  builder.push(`// region Components\n`);
  components.forEach((name) =>
    builder.push(
      `const ${name} = lazy(() => import('${name.includes('Unstyled') ? `@mui/base` : `@mui/material`}/${name}'));\n`
    )
  );
  builder.push(`// endregion\n`);
  builder.push('\n\n');
  builder.push(`// region Exports\n`);
  builder.push(`export { ${muiExports.join(', ')} }`);
  builder.push(`// endregion\n`);

  prettier
    .format(builder.join(''), {
      ...prettierConfig,
      parser: 'babel'
    })
    .then((formatted) => {
      fs.writeFile('../ui/app/src/env/mui.ts', formatted, 'utf8', () => {
        console.log('MUI export created successfully.');
      });
    });
}

function main(...args) {
  switch (args[0]) {
    case 'mui-icons': {
      if (args[1]) {
        muiIcons(args[1]);
      } else {
        muiIcons('Rounded');
        muiIcons('Outlined');
      }
      break;
    }
    case 'mui-export': {
      muiExport();
      break;
    }
    case 'studio-ui': {
      studioUI();
      break;
    }
    case 'components-index': {
      componentsIndex();
      break;
    }
    case 'icons-index': {
      iconsIndex();
      break;
    }
    case 'models-index': {
      modelsIndex();
      break;
    }
    case 'xb-react-index': {
      xbReactIndex();
      break;
    }
    case 'all': {
      main('mui-icons');
      // muiExport();
      studioUI();
      componentsIndex();
      iconsIndex();
      modelsIndex();
      xbReactIndex();
      break;
    }
  }
}

main(...args);
