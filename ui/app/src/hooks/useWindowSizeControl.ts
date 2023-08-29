/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { useEffect } from 'react';
import useMount from './useMount';
import { setWindowSize } from '../state/actions/preview';
import { useDispatch } from 'react-redux';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import usePreviewState from './usePreviewState';
import useActiveUser from './useActiveUser';
import useActiveSiteId from './useActiveSiteId';
import { setStoredICEToolsPanelWidth, setStoredPreviewToolsPanelWidth } from '../utils/state';

export function useWindowSizeControl() {
  const { icePanelWidth, toolsPanelWidth } = usePreviewState();
  const user = useActiveUser();
  const siteId = useActiveSiteId();
  const dispatch = useDispatch();
  useMount(() => {
    dispatch(setWindowSize({ size: window.innerWidth }));
  });
  // region Sidebars localStorage update
  useEffect(() => {
    setStoredICEToolsPanelWidth(siteId, user.username, icePanelWidth);
  }, [icePanelWidth, siteId, user?.username]);
  useEffect(() => {
    setStoredPreviewToolsPanelWidth(siteId, user.username, toolsPanelWidth);
  }, [toolsPanelWidth, siteId, user?.username]);
  // endregion
  useEffect(() => {
    const subscription = fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => dispatch(setWindowSize({ size: window.innerWidth })));

    return () => subscription.unsubscribe();
  }, [dispatch]);
}
