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

const path = require('path');
const fse = require('fs-extra');
const glob = require('glob');
const prettier = require('prettier');

const packagePath = process.cwd();
const buildPath = path.join(packagePath, './build_tsc');
const srcPath = path.join(packagePath, './src');

const ignoreDeps = ['react-scripts'];
const optionalDeps = [
  '@types/graphql',
  '@types/jest',
  '@types/js-cookie',
  '@types/node',
  '@types/prettier',
  '@types/react',
  '@types/react-dom',
  '@types/react-redux',
  '@types/react-router-dom',
  '@types/react-swipeable-views',
  '@types/video.js',
  'typescript'
];
const peerDeps = [
  '@date-io/date-fns',
  '@material-ui/core',
  '@material-ui/icons',
  '@material-ui/lab',
  '@material-ui/pickers',
  '@prettier/plugin-xml',
  '@reduxjs/toolkit',
  'clsx',
  'date-fns',
  'react',
  'react-dom',
  'redux',
  'redux-observable',
  'rxjs',
  'react-redux',
  'react-router',
  'react-router-dom',
  'react-intl',
  ...optionalDeps
];

async function createPackageFile() {
  const packageData = await fse.readFile(path.resolve(packagePath, './package.json'), 'utf8');
  const {
    scripts,
    dependencies,
    devDependencies,
    eslintConfig,
    browserslist,
    proxy,
    bic,
    ...packageDataOther
  } = JSON.parse(packageData);

  delete dependencies['react-scripts'];
  const packageDeps = {
    dependencies: {},
    peerDependencies: {},
    peerDependenciesMeta: {}
  };

  Object.entries(dependencies).forEach(([dep, version]) => {
    if (!ignoreDeps.includes(dep)) {
      if (peerDeps.includes(dep)) {
        packageDeps.peerDependencies[dep] = version;
      } else {
        packageDeps.dependencies[dep] = version;
      }
      if (optionalDeps.includes(dep)) {
        packageDeps.peerDependenciesMeta[dep] = {
          optional: true
        };
      }
    }
  });

  const newPackageData = {
    ...packageDataOther,
    private: false,
    ...packageDeps
  };
  const targetPath = path.resolve(buildPath, './package.json');

  await fse.writeFile(targetPath, JSON.stringify(newPackageData, null, 2), { flag: 'w+', encoding: 'utf8' });
  console.log(`Created package.json`);
}

// TODO: This will likely screw up source maps
async function bannerAndFormat() {
  const filePattern = '**/**.{ts,js}';
  const filesToProcess = glob.sync(filePattern, { cwd: buildPath });
  console.log(`Beginning copyright & format of ${filesToProcess.length} files (${filePattern}).`);
  const banner = `${await fse.readFile(path.resolve(packagePath, './scripts/license.txt'), 'utf8')}\n`;
  const config = path.join(__dirname, '../../../prettier.config.js');
  filesToProcess.forEach(async (filePath) => {
    const fullPath = path.join(buildPath, filePath);
    const options = prettier.resolveConfig.sync(fullPath, { config });
    const code = await fse.readFile(fullPath, 'utf8');
    try {
      const output = `${banner}${prettier.format(code, { ...options, filepath: fullPath })}`;
      await fse.writeFile(fullPath, output, 'utf8');
    } catch {
      console.log(`Error formatting "${filePath}"`);
    }
  });
  console.log(`Formatted and added license to "${filePattern}".`);
}

async function run() {
  try {
    await createPackageFile();

    const directoryPackages = glob.sync('**/**.scss', { cwd: srcPath });
    await Promise.all(
      directoryPackages.map((sassFilePath) =>
        fse.copyFile(path.join(srcPath, sassFilePath), path.join(buildPath, sassFilePath))
      )
    );
    console.log(`Copied scss to build`);

    fse.copy(path.join(srcPath, 'assets'), path.join(buildPath, 'assets'));
    console.log(`Copied assets to build`);

    await fse.copyFile(path.join(packagePath, 'scripts', 'LICENSE'), path.join(buildPath, 'LICENSE'));
    console.log('License file added');

    await fse.copyFile(path.join(packagePath, 'scripts', 'README.md'), path.join(buildPath, 'README.md'));
    console.log('Readme file added');

    await bannerAndFormat();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
