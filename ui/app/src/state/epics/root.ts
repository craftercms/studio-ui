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

import { combineEpics, ofType } from 'redux-observable';
import auth from './auth';
import sites from './sites';
import contentTypes from './contentTypes';
import assets from './assets';
import audiencesPanel from './audiencesPanel';
import dialogs from './dialogs';
import preview from './preview';
import legacy from './legacy';
import itemVersions from './itemVersions';
import env from './env';
import content from './content';
import translation from './translation';
import { switchMap } from 'rxjs/operators';
import { batchActions } from '../actions/misc';
import configuration from './configuration';
import pathNavigator from './pathNavigator';
import pathNavigatorTree from './pathNavigatorTree';
import misc from './misc';
import system from './system';
import users from './users';
import { CrafterCMSEpic } from '../store';
import { Observable } from 'rxjs';
import StandardAction from '../../models/StandardAction';

const epic: CrafterCMSEpic = combineEpics(
  (action$: Observable<StandardAction<StandardAction[]>>) =>
    action$.pipe(
      ofType(batchActions.type),
      switchMap(({ payload }) => payload)
    ),
  ...auth,
  ...sites,
  ...contentTypes,
  ...assets,
  ...audiencesPanel,
  ...preview,
  ...dialogs,
  ...legacy,
  ...itemVersions,
  ...env,
  ...content,
  ...translation,
  ...configuration,
  ...pathNavigator,
  ...pathNavigatorTree,
  ...misc,
  ...system,
  ...users
);

export default epic;
