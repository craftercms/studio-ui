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

import auth from './auth';
import user from './user';
import sites from './sites';
import env from './env';
import preview from './preview';
import previewNavigation from './previewNavigation';
import contentTypes from './contentTypes';
import dialogs from './dialogs';
import versions from './versions';
import content from './content';
import pathNavigator from './pathNavigator';
import pathNavigatorTree from './pathNavigatorTree';
import uiConfig from './uiConfig';
import dashboard from './dashboard';
import globalNavigation from './globalNavigation';
import { combineReducers } from 'redux';

const reducer = combineReducers({
  auth,
  user,
  sites,
  env,
  preview,
  previewNavigation,
  contentTypes,
  dialogs,
  versions,
  content,
  pathNavigator,
  pathNavigatorTree,
  uiConfig,
  dashboard,
  globalNavigation
});

export default reducer;
