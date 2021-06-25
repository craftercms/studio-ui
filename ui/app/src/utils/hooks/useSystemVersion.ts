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

import { useDispatch } from 'react-redux';
import { useEnv } from './useEnv';
import { useEffect } from 'react';
import { fetchSystemVersion } from '../../state/actions/env';

// TODO: Assess drawbacks & improve.
// Might need to refactor the state to have the isFetching there.
let /* private */ systemVersionRequested = false;
/**
 * Will only fetch the system version once. It's controlled by the
 * `systemVersionRequested` private to control whether it's been requested.
 **/
export function useSystemVersion() {
  const dispatch = useDispatch();
  const env = useEnv();
  useEffect(() => {
    if (!systemVersionRequested && env.version === null) {
      systemVersionRequested = true;
      dispatch(fetchSystemVersion());
    }
  }, [dispatch, env.version]);
  return env.version;
}
