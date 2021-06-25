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

import { MinimizedDialog } from '../../models/MinimizedDialog';
import { useDispatch } from 'react-redux';
import { useSelection } from './useSelection';
import { useEffect } from 'react';
import { popDialog, pushDialog } from '../../state/reducers/dialogs/minimizedDialogs';

export function useMinimizeDialog(initialTab: MinimizedDialog) {
  const dispatch = useDispatch();
  const state = useSelection((state) => state.dialogs.minimizedDialogs[initialTab.id]);

  useEffect(
    () => {
      dispatch(pushDialog(initialTab));
      return () => {
        dispatch(popDialog({ id: initialTab.id }));
      };
    },
    // `initialTab` omitted purposely to facilitate use without memo from consumer side
    // eslint-disable-next-line
    [dispatch, initialTab.id]
  );

  return state?.minimized ?? initialTab.minimized;
}
