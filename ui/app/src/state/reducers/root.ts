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

import { ReducersMapObject } from 'redux';
import GlobalState from '../../models/GlobalState';
import { StandardAction } from '../../models/StandardAction';
import auth from './auth';
import user from './user';
import sites from './sites';
import env from './env';
import preview from './preview';
import contentTypes from './contentTypes';
import dialogs from './dialogs';

const reducer: ReducersMapObject<GlobalState, StandardAction> = {
  auth,
  user,
  sites,
  env,
  preview,
  contentTypes,
  dialogs
};

export default reducer;
