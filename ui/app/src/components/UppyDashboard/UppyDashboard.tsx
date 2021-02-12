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

import Dashboard, { DashboardOptions } from '@craftercms/uppy-dashboard';
import { useEffect, useRef } from 'react';
import { Uppy } from '@uppy/core';

interface UppyDashboardProps {
  uppy: Uppy;
  options?: DashboardOptions;
}

export default function UppyDashboard(props: UppyDashboardProps) {
  const { uppy, options } = props;
  const ref = useRef();

  useEffect(() => {
    if (uppy.getPlugin(options.id ?? 'craftercms:Dashboard')) {
      uppy.removePlugin(uppy.getPlugin(options.id ?? 'craftercms:Dashboard'));
    }
    uppy.use(Dashboard, { id: 'craftercms:Dashboard', inline: true, ...options, target: ref.current });
    return () => {
      uppy.removePlugin(uppy.getPlugin(options.id ?? 'craftercms:Dashboard'));
    };
    // options is removed from dependencies to avoid re-render a new dashboard
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [uppy]);

  return <section ref={ref} />;
}
