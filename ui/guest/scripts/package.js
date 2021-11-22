/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

const pkg = require('../../app/package.json');

const path = require('path');
const fse = require('fs-extra');

const packagePath = process.cwd();
const appPath = path.resolve(packagePath, '../app');
const buildPath = path.join(packagePath, './build_tsc');

const optional = [];
const ignoreDeps = ['typescript'];
const peerDeps = [
  '@emotion/css',
  '@emotion/react',
  '@emotion/styled',
  '@mui/icons-material',
  '@mui/lab',
  '@mui/material',
  '@mui/styles',
  'react',
  'react-dom',
  'react-intl',
  'react-redux',
  'react-router-dom',
  'redux',
  'redux-observable',
  'rxjs'
];

async function run() {
  try {
    const appPackageContent = await fse.readFile(path.resolve(packagePath, './package.json'), 'utf8');
    const appPackage = JSON.parse(appPackageContent);

    const { name, description, version, keywords, repository, license } = appPackage;

    const newPackageData = {
      private: false,
      name,
      description,
      version,
      keywords,
      repository,
      license,
      main: 'index.js',
      module: 'index.js',
      typings: 'index.d.ts',
      dependencies: {},
      peerDependencies: {},
      peerDependenciesMeta: {}
    };

    Object.entries(appPackage.dependencies).forEach(([dep, version]) => {
      if (!ignoreDeps.includes(dep)) {
        if (dep === '@craftercms/studio-ui') {
          newPackageData.dependencies[dep] = pkg.version;
        } else if (optional.includes(dep)) {
          newPackageData.peerDependenciesMeta[dep] = {
            optional: true
          };
        } else if (peerDeps.includes(dep)) {
          newPackageData.peerDependencies[dep] = version;
        } else {
          newPackageData.dependencies[dep] = version;
        }
      }
    });

    const targetPath = path.resolve(buildPath, './package.json');

    await fse.writeFile(targetPath, JSON.stringify(newPackageData, null, 2), { flag: 'w+', encoding: 'utf8' });
    console.log(`Created package.json`);

    await fse.copyFile(path.join(appPath, 'scripts', 'LICENSE'), path.join(buildPath, 'LICENSE'));
    console.log('License file added');

    // await fse.copyFile(path.join(packagePath, 'scripts', 'README.md'), path.join(buildPath, 'README.md'));
    // console.log('Readme file added');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
