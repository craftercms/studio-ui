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
          'optional': true
        };
      }
    }
  });

  const newPackageData = {
    ...packageDataOther,
    private: false,
    // name: '@rart/25d0661d',
    ...packageDeps
  };
  const targetPath = path.resolve(buildPath, './package.json');

  await fse.writeFile(targetPath, JSON.stringify(newPackageData, null, 2), 'utf8');

  return newPackageData;
}

async function run() {
  try {

    await createPackageFile();
    console.log(`Created package.json`);

    const directoryPackages = glob.sync('**/**.scss', { cwd: srcPath });
    await Promise.all(
      directoryPackages.map((sassFilePath) =>
        fse.copyFile(path.join(srcPath, sassFilePath), path.join(buildPath, sassFilePath))
      )
    );
    console.log(`Copied scss to build`);

    fse.copy(path.join(srcPath, 'assets'), path.join(buildPath, 'assets'));
    console.log(`Copied assets to build`);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
